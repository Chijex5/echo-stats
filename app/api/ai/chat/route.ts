import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import mongoose from "mongoose";
import { GoogleGenAI } from "@google/genai";
import { getSessionUserId } from "@/lib/get-session-user-id";
import { connectDB } from "@/lib/db";
import StreamEntry from "@/lib/models/StreamEntry";
import { buildMusicContext } from "@/lib/ai/buildMusicContext";
import {
  MUSIC_ASSISTANT_SYSTEM_PROMPT,
  buildCommandResultPrompt,
  buildMusicAssistantUserPrompt,
} from "@/lib/ai-prompts";
import ChatMessageModel from "@/lib/models/ChatMessage";

const chatRequestSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().trim().min(1).max(1_500),
      })
    )
    .min(1)
    .max(8),
});

const commandSchema = z.object({
  duration: z.enum(["yesterday", "today", "last-7-days", "last-30-days"]),
});

type ChatMessage = z.infer<typeof chatRequestSchema>["messages"][number];
type StreamEvent =
  | { type: "assistant_delta"; text: string }
  | { type: "assistant_done" }
  | { type: "command_loading"; loading: boolean; label?: string }
  | { type: "error"; error: string };

// ---------------------------------------------------------------------
// Debug logging. Deliberately plain console.log/console.error (not gated
// behind NODE_ENV) so these show up in your platform's function logs in
// prod (Vercel "Logs" tab, etc). Every log line carries the requestId so
// a single request's whole lifecycle can be grepped out.
// ---------------------------------------------------------------------
function genRequestId() {
  try {
    return crypto.randomUUID();
  } catch {
    return `req_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }
}

function logDebug(requestId: string, label: string, meta?: Record<string, unknown>) {
  console.log(`[ai/chat][${requestId}] ${label}`, meta ? JSON.stringify(meta) : "");
}

function streamError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

function getGoogleConfig() {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  const model = process.env.GOOGLE_AI_MODEL ?? "gemini-3.1-flash-lite";
  return { apiKey, model };
}

function toInteractionInput(messages: ChatMessage[], latestPrompt: string) {
  return [
    ...messages.map((message) => ({
      type: message.role === "assistant" ? ("model_output" as const) : ("user_input" as const),
      content: [{ type: "text" as const, text: message.content }],
    })),
    {
      type: "user_input" as const,
      content: [{ type: "text" as const, text: latestPrompt }],
    },
  ];
}

function parseListeningHistoryCommand(text: string) {
  const commandMatch = text.match(/LISTENING-HISTORY:\/\/filter:(\{[^\n]+\})/);
  if (!commandMatch) return { cleanText: text.trim(), command: null };

  const cleanText = text.replace(commandMatch[0], "").trim();
  const parsedJson = (() => {
    try {
      return JSON.parse(commandMatch[1]);
    } catch {
      return null;
    }
  })();
  const parsedCommand = commandSchema.safeParse(parsedJson);
  return {
    cleanText: cleanText || "Let me get that from your listening history.",
    command: parsedCommand.success ? parsedCommand.data : null,
  };
}

function getDateRange(duration: z.infer<typeof commandSchema>["duration"]) {
  const now = new Date();
  const start = new Date(now);
  const end = new Date(now);

  if (duration === "today") {
    start.setHours(0, 0, 0, 0);
    return { start, end };
  }

  if (duration === "yesterday") {
    start.setDate(start.getDate() - 1);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    return { start, end };
  }

  start.setDate(start.getDate() - (duration === "last-7-days" ? 7 : 30));
  return { start, end };
}

async function executeListeningHistoryCommand(userId: string, command: z.infer<typeof commandSchema>) {
  const userObjectId = new mongoose.Types.ObjectId(userId);
  const { start, end } = getDateRange(command.duration);
  const tracks = await StreamEntry.find({ userId: userObjectId, ts: { $gte: start, $lt: end } })
    .sort({ ts: -1 })
    .limit(25)
    .select("trackName artistName albumName ts msPlayed platform skipped -_id")
    .lean();

  return {
    command: "LISTENING-HISTORY://filter",
    duration: command.duration,
    range: { start, end },
    returnedCount: tracks.length,
    tracks,
  };
}

// Every event that actually goes out over the wire is logged here — this
// is the ground truth for "did the server ever send this". If you see
// these logs but the browser never logged receiving them, the problem is
// in transit (proxy/CDN buffering, connection drop) not in generation.
function enqueueEvent(
  controller: ReadableStreamDefaultController<Uint8Array>,
  event: StreamEvent,
  requestId: string
) {
  logDebug(requestId, "enqueueEvent", {
    type: event.type,
    textLen: "text" in event ? event.text.length : undefined,
    loading: "loading" in event ? event.loading : undefined,
    error: "error" in event ? event.error : undefined,
  });
  try {
    controller.enqueue(new TextEncoder().encode(`${JSON.stringify(event)}\n`));
  } catch (err) {
    // If the client has already disconnected, controller.enqueue throws.
    // This is a strong candidate for your "generated but never shown" bug:
    // generation succeeds, DB save succeeds, but the socket to the browser
    // is already gone by the time we try to push a delta.
    logDebug(requestId, "enqueueEvent FAILED (client likely disconnected)", {
      message: err instanceof Error ? err.message : String(err),
    });
    throw err;
  }
}

async function saveTurns(
  userId: string,
  turns: { role: "user" | "assistant"; content: string }[],
  requestId: string
) {
  if (turns.length === 0) return;
  try {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    await ChatMessageModel.insertMany(
      turns.map((turn) => ({ userId: userObjectId, role: turn.role, content: turn.content }))
    );
    logDebug(requestId, "saveTurns OK", { count: turns.length, roles: turns.map((t) => t.role) });
  } catch (error) {
    logGoogleCallError("saveTurns", error, requestId);
  }
}

function logGoogleCallError(label: string, error: unknown, requestId: string) {
  if (error instanceof Error) {
    console.error(`[ai/chat][${requestId}] ${label} threw:`, {
      name: error.name,
      message: error.message,
      cause: (error as { cause?: unknown }).cause,
      stack: error.stack,
    });
  } else {
    console.error(`[ai/chat][${requestId}] ${label} threw non-Error:`, error);
  }
}

async function generateGoogleText(
  messages: ChatMessage[],
  prompt: string,
  client: GoogleGenAI,
  model: string,
  requestId: string
): Promise<{ text: string; interactionId: string | undefined }> {
  const startedAt = Date.now();
  logDebug(requestId, "generateGoogleText -> start", { historyLen: messages.length, model });
  try {
    const interaction = await client.interactions.create({
      model,
      system_instruction: MUSIC_ASSISTANT_SYSTEM_PROMPT,
      input: toInteractionInput(messages, prompt),
      generation_config: { temperature: 0.7, max_output_tokens: 1024, thinking_level: "low" },
      store: true,
    });

    logDebug(requestId, "generateGoogleText -> interaction returned", {
      ms: Date.now() - startedAt,
      interactionId: interaction.id,
      outputTextLen: interaction.output_text?.length ?? 0,
      finishReason: (interaction as unknown as { finish_reason?: string }).finish_reason,
    });

    if (!interaction.output_text) {
      console.error(`[ai/chat][${requestId}] generateGoogleText -> empty output_text`, {
        interactionId: interaction.id,
      });
      throw new Error("Gemini returned an empty response for this request. Please try again.");
    }

    return { text: interaction.output_text, interactionId: interaction.id };
  } catch (error) {
    logGoogleCallError("generateGoogleText", error, requestId);
    throw error;
  }
}

async function streamGoogleText(
  controller: ReadableStreamDefaultController<Uint8Array>,
  prompt: string,
  client: GoogleGenAI,
  model: string,
  previousInteractionId: string | undefined,
  requestId: string
): Promise<string> {
  const startedAt = Date.now();
  logDebug(requestId, "streamGoogleText -> start", { previousInteractionId });
  try {
    const stream = await client.interactions.create({
      model,
      system_instruction: MUSIC_ASSISTANT_SYSTEM_PROMPT,
      input: toInteractionInput([], prompt),
      previous_interaction_id: previousInteractionId,
      generation_config: { temperature: 0.7, max_output_tokens: 1024, thinking_level: "low" },
      stream: true,
    });

    let fullText = "";
    let deltaCount = 0;
    for await (const event of stream) {
      if (event.event_type === "step.delta" && event.delta?.type === "text" && event.delta.text) {
        fullText += event.delta.text;
        deltaCount += 1;
        enqueueEvent(controller, { type: "assistant_delta", text: event.delta.text }, requestId);
      }
    }

    logDebug(requestId, "streamGoogleText -> Gemini stream finished", {
      ms: Date.now() - startedAt,
      deltaCount,
      fullTextLen: fullText.length,
    });

    if (!fullText) {
      console.error(`[ai/chat][${requestId}] streamGoogleText -> stream produced no text`, {
        previousInteractionId,
      });
      throw new Error("Gemini returned an empty response for this request. Please try again.");
    }

    return fullText;
  } catch (error) {
    logGoogleCallError("streamGoogleText", error, requestId);
    throw error;
  }
}

export async function POST(req: NextRequest) {
  const requestId = genRequestId();
  const requestStartedAt = Date.now();
  logDebug(requestId, "POST -> received");

  const userId = await getSessionUserId(req);
  if (!userId) {
    logDebug(requestId, "POST -> unauthorized");
    return streamError("Unauthorized", 401);
  }

  const rawBody = await req.json().catch((err) => {
    console.error(`[ai/chat][${requestId}] POST -> failed to parse request JSON:`, err);
    return null;
  });
  const parsed = chatRequestSchema.safeParse(rawBody);
  if (!parsed.success) {
    logDebug(requestId, "POST -> invalid body", { issues: parsed.error?.issues });
    return streamError("Invalid chat request", 400);
  }

  logDebug(requestId, "POST -> body OK", { userId, messageCount: parsed.data.messages.length });

  const { apiKey, model } = getGoogleConfig();
  if (!apiKey) {
    console.error(`[ai/chat][${requestId}] Missing GOOGLE_GENERATIVE_AI_API_KEY env var`);
    return streamError("AI chat is not configured. Add GOOGLE_GENERATIVE_AI_API_KEY on the server.", 503);
  }

  const client = new GoogleGenAI({
    apiKey,
    httpOptions: {
      timeout: 30_000,
      retryOptions: { attempts: 3 },
    },
  });

  try {
    await connectDB();
    logDebug(requestId, "POST -> DB connected");
  } catch (error) {
    logGoogleCallError("connectDB", error, requestId);
    return streamError("Database connection failed", 500);
  }

  const contextStartedAt = Date.now();
  const context = await buildMusicContext(userId);
  logDebug(requestId, "POST -> music context built", { ms: Date.now() - contextStartedAt });

  const latestQuestion = parsed.data.messages.at(-1)?.content ?? "Summarize my listening history.";
  const recentConversation = parsed.data.messages.slice(-6, -1);
  const firstPrompt = buildMusicAssistantUserPrompt(latestQuestion, context);

  const stream = new ReadableStream({
    async start(controller) {
      // Heartbeat: if nothing gets enqueued for 10s, log it explicitly.
      // This is the single most useful signal for a "hung, no error" bug —
      // it tells you the server is still alive and waiting on something
      // (Gemini, Mongo) rather than having already finished and lost the
      // client connection.
      const stall = setInterval(() => {
        logDebug(requestId, "STALL WARNING -> no event enqueued in last 10s", {
          elapsedMs: Date.now() - requestStartedAt,
        });
      }, 10_000);

      try {
        const { text: firstAnswer, interactionId } = await generateGoogleText(
          recentConversation,
          firstPrompt,
          client,
          model,
          requestId
        );
        const { cleanText, command } = parseListeningHistoryCommand(firstAnswer);
        logDebug(requestId, "POST -> parsed command", { hasCommand: !!command, command });

        enqueueEvent(controller, { type: "assistant_delta", text: cleanText }, requestId);
        enqueueEvent(controller, { type: "assistant_done" }, requestId);

        await saveTurns(
          userId,
          [
            { role: "user", content: latestQuestion },
            { role: "assistant", content: cleanText },
          ],
          requestId
        );

        if (command) {
          enqueueEvent(
            controller,
            { type: "command_loading", loading: true, label: "Checking your listening history…" },
            requestId
          );
          const commandStartedAt = Date.now();
          const commandResult = await executeListeningHistoryCommand(userId, command);
          logDebug(requestId, "POST -> command executed", {
            ms: Date.now() - commandStartedAt,
            returnedCount: commandResult.returnedCount,
          });
          enqueueEvent(controller, { type: "command_loading", loading: false }, requestId);
          const followUpText = await streamGoogleText(
            controller,
            buildCommandResultPrompt(latestQuestion, commandResult),
            client,
            model,
            interactionId,
            requestId
          );
          enqueueEvent(controller, { type: "assistant_done" }, requestId);
          await saveTurns(userId, [{ role: "assistant", content: followUpText }], requestId);
        }

        logDebug(requestId, "POST -> stream complete OK", { totalMs: Date.now() - requestStartedAt });
      } catch (error) {
        logGoogleCallError("stream handler (outer)", error, requestId);
        try {
          enqueueEvent(
            controller,
            { type: "error", error: error instanceof Error ? error.message : "AI chat failed" },
            requestId
          );
        } catch (enqueueErr) {
          // Client is gone — nothing more we can do but log it loudly.
          logDebug(requestId, "POST -> could not deliver error event, client disconnected", {
            message: enqueueErr instanceof Error ? enqueueErr.message : String(enqueueErr),
          });
        }
      } finally {
        clearInterval(stall);
        logDebug(requestId, "POST -> controller.close()", { totalMs: Date.now() - requestStartedAt });
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no", // tells nginx-style proxies not to buffer this response
      "X-Chat-Request-Id": requestId,
    },
  });
}

export async function GET(req: NextRequest) {
  const requestId = genRequestId();
  logDebug(requestId, "GET -> received");

  const userId = await getSessionUserId(req);
  if (!userId) return streamError("Unauthorized", 401);

  try {
    await connectDB();
  } catch (error) {
    logGoogleCallError("connectDB", error, requestId);
    return streamError("Database connection failed", 500);
  }

  const userObjectId = new mongoose.Types.ObjectId(userId);
  const history = await ChatMessageModel.find({ userId: userObjectId })
    .sort({ createdAt: 1 })
    .limit(200)
    .select("role content -_id")
    .lean();

  logDebug(requestId, "GET -> history loaded", { count: history.length });

  return NextResponse.json({ messages: history }, { headers: { "X-Chat-Request-Id": requestId } });
}
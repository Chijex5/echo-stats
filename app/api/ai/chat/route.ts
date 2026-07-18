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

function enqueueEvent(controller: ReadableStreamDefaultController<Uint8Array>, event: StreamEvent) {
  controller.enqueue(new TextEncoder().encode(`${JSON.stringify(event)}\n`));
}

// Persists completed turns only — never partial/failed ones, so a broken
// request doesn't leave a half-written exchange in the resumed history.
// Failure here shouldn't break the response the user is already reading,
// so it's logged rather than thrown.
async function saveTurns(userId: string, turns: { role: "user" | "assistant"; content: string }[]) {
  if (turns.length === 0) return;
  try {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    await ChatMessageModel.insertMany(
      turns.map((turn) => ({ userId: userObjectId, role: turn.role, content: turn.content }))
    );
  } catch (error) {
    logGoogleCallError("saveTurns", error);
  }
}

function logGoogleCallError(label: string, error: unknown) {
  if (error instanceof Error) {
    console.error(`[ai/chat] ${label} threw:`, {
      name: error.name,
      message: error.message,
      cause: (error as { cause?: unknown }).cause,
      stack: error.stack,
    });
  } else {
    console.error(`[ai/chat] ${label} threw non-Error:`, error);
  }
}

// Turn 1: the grounded answer to the user's actual question. We pass
// store: true explicitly so the interaction is guaranteed retrievable —
// the second call below chains onto it via previous_interaction_id instead
// of us manually re-threading the whole conversation by hand.
async function generateGoogleText(
  messages: ChatMessage[],
  prompt: string,
  client: GoogleGenAI,
  model: string
): Promise<{ text: string; interactionId: string | undefined }> {
  try {
    const interaction = await client.interactions.create({
      model,
      system_instruction: MUSIC_ASSISTANT_SYSTEM_PROMPT,
      input: toInteractionInput(messages, prompt),
      // Gemini 3 models default to thinking_level "high" if unset, and
      // thinking tokens are drawn from the same max_output_tokens budget as
      // the visible answer. Left unset, some requests spend the entire
      // budget reasoning internally and return finish_reason MAX_TOKENS
      // with an empty output_text — no thrown error, just silence. "low" is
      // Google's documented recommendation for latency-sensitive tasks that
      // don't need deep multi-step reasoning, which this is.
      generation_config: { temperature: 0.7, max_output_tokens: 1024, thinking_level: "low" },
      store: true,
    });

    if (!interaction.output_text) {
      // Surface this as a real failure instead of silently streaming
      // nothing — see the empty-output check below for why.
      console.error("[ai/chat] generateGoogleText -> empty output_text", {
        interactionId: interaction.id,
      });
      throw new Error("Gemini returned an empty response for this request. Please try again.");
    }

    return { text: interaction.output_text, interactionId: interaction.id };
  } catch (error) {
    logGoogleCallError("generateGoogleText", error);
    throw error;
  }
}

// Turn 2: the follow-up after a listening-history command result. Chained
// onto the first interaction via previous_interaction_id so the model still
// has the original question + conversation in view, instead of answering
// with only the command result and nothing else.
async function streamGoogleText(
  controller: ReadableStreamDefaultController<Uint8Array>,
  prompt: string,
  client: GoogleGenAI,
  model: string,
  previousInteractionId: string | undefined
): Promise<string> {
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
    for await (const event of stream) {
      if (event.event_type === "step.delta" && event.delta?.type === "text" && event.delta.text) {
        fullText += event.delta.text;
        enqueueEvent(controller, { type: "assistant_delta", text: event.delta.text });
      }
    }

    if (!fullText) {
      console.error("[ai/chat] streamGoogleText -> stream produced no text", { previousInteractionId });
      throw new Error("Gemini returned an empty response for this request. Please try again.");
    }

    return fullText;
  } catch (error) {
    logGoogleCallError("streamGoogleText", error);
    throw error;
  }
}

export async function POST(req: NextRequest) {
  const userId = await getSessionUserId(req);
  if (!userId) return streamError("Unauthorized", 401);

  const rawBody = await req.json().catch((err) => {
    console.error("[ai/chat] POST -> failed to parse request JSON:", err);
    return null;
  });
  const parsed = chatRequestSchema.safeParse(rawBody);
  if (!parsed.success) return streamError("Invalid chat request", 400);

  const { apiKey, model } = getGoogleConfig();
  if (!apiKey) {
    console.error("[ai/chat] Missing GOOGLE_GENERATIVE_AI_API_KEY env var");
    return streamError("AI chat is not configured. Add GOOGLE_GENERATIVE_AI_API_KEY on the server.", 503);
  }

  // Client-wide resilience: fail fast instead of hanging (this is what bit
  // us with the 63s "fetch failed" earlier), and let the SDK's built-in
  // exponential backoff quietly absorb transient 429/5xx instead of that
  // surfacing as a user-facing error on the first hiccup.
  const client = new GoogleGenAI({
    apiKey,
    httpOptions: {
      timeout: 30_000,
      retryOptions: { attempts: 3 },
    },
  });

  try {
    await connectDB();
  } catch (error) {
    logGoogleCallError("connectDB", error);
    return streamError("Database connection failed", 500);
  }

  const context = await buildMusicContext(userId);
  const latestQuestion = parsed.data.messages.at(-1)?.content ?? "Summarize my listening history.";
  const recentConversation = parsed.data.messages.slice(-6, -1);
  const firstPrompt = buildMusicAssistantUserPrompt(latestQuestion, context);

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const { text: firstAnswer, interactionId } = await generateGoogleText(
          recentConversation,
          firstPrompt,
          client,
          model
        );
        const { cleanText, command } = parseListeningHistoryCommand(firstAnswer);

        enqueueEvent(controller, { type: "assistant_delta", text: cleanText });
        enqueueEvent(controller, { type: "assistant_done" });

        // Save the question + first answer now — if the command step below
        // fails, this exchange is still real and should still be there on
        // reload, even though the follow-up never completed.
        await saveTurns(userId, [
          { role: "user", content: latestQuestion },
          { role: "assistant", content: cleanText },
        ]);

        if (command) {
          enqueueEvent(controller, {
            type: "command_loading",
            loading: true,
            label: "Checking your listening history…",
          });
          const commandResult = await executeListeningHistoryCommand(userId, command);
          enqueueEvent(controller, { type: "command_loading", loading: false });
          const followUpText = await streamGoogleText(
            controller,
            buildCommandResultPrompt(latestQuestion, commandResult),
            client,
            model,
            interactionId
          );
          enqueueEvent(controller, { type: "assistant_done" });
          await saveTurns(userId, [{ role: "assistant", content: followUpText }]);
        }
      } catch (error) {
        logGoogleCallError("stream handler (outer)", error);
        enqueueEvent(controller, {
          type: "error",
          error: error instanceof Error ? error.message : "AI chat failed",
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
    },
  });
}

// Serves the single running history the frontend resumes on load. Capped
// well above the 8-message window sent back to the model per request —
// this is just for display, not for context assembly.
export async function GET(req: NextRequest) {
  const userId = await getSessionUserId(req);
  if (!userId) return streamError("Unauthorized", 401);

  try {
    await connectDB();
  } catch (error) {
    logGoogleCallError("connectDB", error);
    return streamError("Database connection failed", 500);
  }

  const userObjectId = new mongoose.Types.ObjectId(userId);
  const history = await ChatMessageModel.find({ userId: userObjectId })
    .sort({ createdAt: 1 })
    .limit(200)
    .select("role content -_id")
    .lean();

  return NextResponse.json({ messages: history });
}
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
  console.log("[ai/chat] getGoogleConfig ->", {
    hasApiKey: Boolean(apiKey),
    apiKeyLength: apiKey?.length ?? 0,
    model,
  });
  return { apiKey, model };
}

function toInteractionInput(
  messages: ChatMessage[],
  latestPrompt: string
) {
  return [
    ...messages.map((message) => ({
      type: message.role === "assistant" ? ("model_output" as const) : ("user_input" as const),
      content: [
        {
          type: "text" as const,
          text: message.content,
        },
      ],
    })),
    {
      type: "user_input" as const,
      content: [
        {
          type: "text" as const,
          text: latestPrompt,
        },
      ],
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
  console.log("[ai/chat] executeListeningHistoryCommand ->", { userId, command });
  const userObjectId = new mongoose.Types.ObjectId(userId);
  const { start, end } = getDateRange(command.duration);
  const tracks = await StreamEntry.find({ userId: userObjectId, ts: { $gte: start, $lt: end } })
    .sort({ ts: -1 })
    .limit(25)
    .select("trackName artistName albumName ts msPlayed platform skipped -_id")
    .lean();

  console.log("[ai/chat] executeListeningHistoryCommand result ->", { returnedCount: tracks.length });

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

// Centralized so every call site logs the same way, and so we can surface
// error.cause — for "TypeError: fetch failed" the real reason (ENOTFOUND,
// ECONNREFUSED, certificate error, timeout, etc.) lives in `cause`, not `message`.
function logGoogleCallError(label: string, error: unknown) {
  if (error instanceof Error) {
    const cause = error.cause;
    console.error(`[ai/chat] ${label} threw:`, {
      name: error.name,
      message: error.message,
      cause,
      stack: error.stack,
    });
  } else {
    console.error(`[ai/chat] ${label} threw non-Error:`, error);
  }
}

async function generateGoogleText(
  messages: ChatMessage[],
  prompt: string,
  client: GoogleGenAI,
  model: string
) {
  console.log("[ai/chat] generateGoogleText -> calling interactions.create", {
    model,
    messageCount: messages.length,
    promptPreview: prompt.slice(0, 200),
  });
  try {
    const interaction = await client.interactions.create({
      model,
      system_instruction: MUSIC_ASSISTANT_SYSTEM_PROMPT,
      input: toInteractionInput(messages, prompt),
      generation_config: {
        temperature: 0.7,
        max_output_tokens: 650,
      },
    });
    console.log("[ai/chat] generateGoogleText -> success", {
      outputLength: interaction.output_text?.length ?? 0,
    });
    return interaction.output_text ?? "";
  } catch (error) {
    logGoogleCallError("generateGoogleText", error);
    throw error;
  }
}

async function streamGoogleText(
  controller: ReadableStreamDefaultController<Uint8Array>,
  messages: ChatMessage[],
  prompt: string,
  client: GoogleGenAI,
  model: string
) {
  console.log("[ai/chat] streamGoogleText -> calling interactions.create (stream)", {
    model,
    messageCount: messages.length,
    promptPreview: prompt.slice(0, 200),
  });
  try {
    const stream = await client.interactions.create({
      model,
      system_instruction: MUSIC_ASSISTANT_SYSTEM_PROMPT,
      input: toInteractionInput(messages, prompt),
      generation_config: { temperature: 0.7, max_output_tokens: 650 },
      stream: true,
    });

    let deltaCount = 0;
    for await (const event of stream) {
      if (event.event_type === "step.delta" && event.delta?.type === "text" && event.delta.text) {
        deltaCount += 1;
        enqueueEvent(controller, { type: "assistant_delta", text: event.delta.text });
      }
    }
    console.log("[ai/chat] streamGoogleText -> stream finished", { deltaCount });
  } catch (error) {
    logGoogleCallError("streamGoogleText", error);
    throw error;
  }
}

export async function POST(req: NextRequest) {
  const userId = await getSessionUserId(req);
  console.log("[ai/chat] POST -> session", { userId });
  if (!userId) return streamError("Unauthorized", 401);

  const rawBody = await req.json().catch((err) => {
    console.error("[ai/chat] POST -> failed to parse request JSON:", err);
    return null;
  });
  const parsed = chatRequestSchema.safeParse(rawBody);
  console.log("[ai/chat] Parsed request:", parsed.success ? parsed.data : parsed.error?.flatten());
  if (!parsed.success) return streamError("Invalid chat request", 400);

  const { apiKey, model } = getGoogleConfig();
  if (!apiKey) {
    console.error("[ai/chat] Missing GOOGLE_GENERATIVE_AI_API_KEY env var");
    return streamError("AI chat is not configured. Add GOOGLE_GENERATIVE_AI_API_KEY on the server.", 503);
  }

  const client = new GoogleGenAI({ apiKey });
  console.log("[ai/chat] GoogleGenAI client initialized with model:", model);

  try {
    await connectDB();
    console.log("[ai/chat] DB connected");
  } catch (error) {
    logGoogleCallError("connectDB", error);
    return streamError("Database connection failed", 500);
  }

  const context = await buildMusicContext(userId);
  console.log("[ai/chat] built music context", {
    contextLength: typeof context === "string" ? (context as string).length : undefined,
  });

  const latestQuestion = parsed.data.messages.at(-1)?.content ?? "Summarize my listening history.";
  const recentConversation = parsed.data.messages.slice(-6, -1);
  const firstPrompt = buildMusicAssistantUserPrompt(latestQuestion, context);
  console.log("[ai/chat] First prompt for AI:", firstPrompt.slice(0, 300));

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const firstAnswer = await generateGoogleText(recentConversation, firstPrompt, client, model);
        const { cleanText, command } = parseListeningHistoryCommand(firstAnswer);

        enqueueEvent(controller, { type: "assistant_delta", text: cleanText });
        enqueueEvent(controller, { type: "assistant_done" });

        if (command) {
          enqueueEvent(controller, {
            type: "command_loading",
            loading: true,
            label: "Checking your listening history…",
          });
          const commandResult = await executeListeningHistoryCommand(userId, command);
          enqueueEvent(controller, { type: "command_loading", loading: false });
          await streamGoogleText(
            controller,
            [],
            buildCommandResultPrompt(latestQuestion, commandResult),
            client,
            model
          );
          enqueueEvent(controller, { type: "assistant_done" });
        }
      } catch (error) {
        // This is almost certainly where your "fetch failed" surfaces.
        // logGoogleCallError already printed name/message/cause/stack above —
        // check the server logs for the `cause` field specifically.
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
  console.log("[ai/chat] Streaming response to client");

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
    },
  });
}
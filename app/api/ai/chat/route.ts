import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import mongoose from "mongoose";
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
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY ?? process.env.GOOGLE_AI_API_KEY;
  const model = process.env.GOOGLE_AI_MODEL ?? "gemini-1.5-flash";
  return { apiKey, model };
}

function getGoogleEndpoint(model: string, apiKey: string, streaming: boolean) {
  const action = streaming ? "streamGenerateContent?alt=sse" : "generateContent";
  const separator = streaming ? "&" : "?";
  return `https://generativelanguage.googleapis.com/v1beta/models/${model}:${action}${separator}key=${apiKey}`;
}

function toGoogleContents(messages: ChatMessage[], latestPrompt: string) {
  return [
    ...messages.map((message) => ({
      role: message.role === "assistant" ? "model" : "user",
      parts: [{ text: message.content }],
    })),
    { role: "user", parts: [{ text: latestPrompt }] },
  ];
}

function extractText(payload: unknown): string {
  const candidate = (payload as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> })
    ?.candidates?.[0];
  return candidate?.content?.parts?.map((part) => part.text ?? "").join("") ?? "";
}

function extractSseText(line: string): string {
  if (!line.startsWith("data: ")) return "";

  try {
    return extractText(JSON.parse(line.slice("data: ".length)));
  } catch {
    return "";
  }
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

async function generateGoogleText(messages: ChatMessage[], prompt: string, apiKey: string, model: string) {
  const response = await fetch(getGoogleEndpoint(model, apiKey, false), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: MUSIC_ASSISTANT_SYSTEM_PROMPT }] },
      contents: toGoogleContents(messages, prompt),
      generationConfig: { temperature: 0.7, maxOutputTokens: 650 },
    }),
  });

  if (!response.ok) throw new Error("Google AI request failed");
  return extractText(await response.json());
}

async function streamGoogleText(
  controller: ReadableStreamDefaultController<Uint8Array>,
  messages: ChatMessage[],
  prompt: string,
  apiKey: string,
  model: string
) {
  const response = await fetch(getGoogleEndpoint(model, apiKey, true), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: MUSIC_ASSISTANT_SYSTEM_PROMPT }] },
      contents: toGoogleContents(messages, prompt),
      generationConfig: { temperature: 0.7, maxOutputTokens: 650 },
    }),
  });

  if (!response.ok || !response.body) throw new Error("Google AI request failed");

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      const text = extractSseText(line.trim());
      if (text) enqueueEvent(controller, { type: "assistant_delta", text });
    }
  }
}

export async function POST(req: NextRequest) {
  const userId = await getSessionUserId(req);
  if (!userId) return streamError("Unauthorized", 401);

  const parsed = chatRequestSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return streamError("Invalid chat request", 400);

  const { apiKey, model } = getGoogleConfig();
  if (!apiKey) {
    return streamError("AI chat is not configured. Add GOOGLE_GENERATIVE_AI_API_KEY on the server.", 503);
  }

  await connectDB();
  const context = await buildMusicContext(userId);
  const latestQuestion = parsed.data.messages.at(-1)?.content ?? "Summarize my listening history.";
  const recentConversation = parsed.data.messages.slice(-6, -1);
  const firstPrompt = buildMusicAssistantUserPrompt(latestQuestion, context);

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const firstAnswer = await generateGoogleText(recentConversation, firstPrompt, apiKey, model);
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
            apiKey,
            model
          );
          enqueueEvent(controller, { type: "assistant_done" });
        }
      } catch (error) {
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

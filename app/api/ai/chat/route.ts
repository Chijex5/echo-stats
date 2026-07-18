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

function apiError(message: string, status: number) {
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

function logCallError(label: string, error: unknown) {
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

async function saveTurns(userId: string, turns: { role: "user" | "assistant"; content: string }[]) {
  if (turns.length === 0) return;
  try {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    await ChatMessageModel.insertMany(
      turns.map((turn) => ({ userId: userObjectId, role: turn.role, content: turn.content }))
    );
  } catch (error) {
    logCallError("saveTurns", error);
  }
}

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
      generation_config: { temperature: 0.7, max_output_tokens: 1024, thinking_level: "low" },
      store: true,
    });

    if (!interaction.output_text) {
      console.error("[ai/chat] generateGoogleText -> empty output_text", { interactionId: interaction.id });
      throw new Error("Gemini returned an empty response for this request. Please try again.");
    }

    return { text: interaction.output_text, interactionId: interaction.id };
  } catch (error) {
    logCallError("generateGoogleText", error);
    throw error;
  }
}

async function generateFollowUpText(
  prompt: string,
  client: GoogleGenAI,
  model: string,
  previousInteractionId: string | undefined
): Promise<string> {
  try {
    const interaction = await client.interactions.create({
      model,
      system_instruction: MUSIC_ASSISTANT_SYSTEM_PROMPT,
      input: toInteractionInput([], prompt),
      previous_interaction_id: previousInteractionId,
      generation_config: { temperature: 0.7, max_output_tokens: 1024, thinking_level: "low" },
    });

    if (!interaction.output_text) {
      console.error("[ai/chat] generateFollowUpText -> empty output_text", { previousInteractionId });
      throw new Error("Gemini returned an empty response for this request. Please try again.");
    }

    return interaction.output_text;
  } catch (error) {
    logCallError("generateFollowUpText", error);
    throw error;
  }
}

export async function POST(req: NextRequest) {
  const userId = await getSessionUserId(req);
  if (!userId) return apiError("Unauthorized", 401);

  const rawBody = await req.json().catch((err) => {
    console.error("[ai/chat] POST -> failed to parse request JSON:", err);
    return null;
  });
  const parsed = chatRequestSchema.safeParse(rawBody);
  if (!parsed.success) return apiError("Invalid chat request", 400);

  const { apiKey, model } = getGoogleConfig();
  if (!apiKey) {
    console.error("[ai/chat] Missing GOOGLE_GENERATIVE_AI_API_KEY env var");
    return apiError("AI chat is not configured. Add GOOGLE_GENERATIVE_AI_API_KEY on the server.", 503);
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
  } catch (error) {
    logCallError("connectDB", error);
    return apiError("Database connection failed", 500);
  }

  const context = await buildMusicContext(userId);
  const latestQuestion = parsed.data.messages.at(-1)?.content ?? "Summarize my listening history.";
  const recentConversation = parsed.data.messages.slice(-6, -1);
  const firstPrompt = buildMusicAssistantUserPrompt(latestQuestion, context);

  try {
    const { text: firstAnswer, interactionId } = await generateGoogleText(
      recentConversation,
      firstPrompt,
      client,
      model
    );
    const { cleanText, command } = parseListeningHistoryCommand(firstAnswer);

    await saveTurns(userId, [
      { role: "user", content: latestQuestion },
      { role: "assistant", content: cleanText },
    ]);

    if (!command) {
      return NextResponse.json({ messages: [{ role: "assistant", content: cleanText }] });
    }

    const commandResult = await executeListeningHistoryCommand(userId, command);
    const followUpText = await generateFollowUpText(
      buildCommandResultPrompt(latestQuestion, commandResult),
      client,
      model,
      interactionId
    );
    await saveTurns(userId, [{ role: "assistant", content: followUpText }]);

    return NextResponse.json({
      messages: [
        { role: "assistant", content: cleanText },
        { role: "assistant", content: followUpText },
      ],
    });
  } catch (error) {
    logCallError("POST handler", error);
    return apiError(error instanceof Error ? error.message : "AI chat failed", 500);
  }
}

export async function GET(req: NextRequest) {
  const userId = await getSessionUserId(req);
  if (!userId) return apiError("Unauthorized", 401);

  try {
    await connectDB();
  } catch (error) {
    logCallError("connectDB", error);
    return apiError("Database connection failed", 500);
  }

  const userObjectId = new mongoose.Types.ObjectId(userId);
  const history = await ChatMessageModel.find({ userId: userObjectId })
    .sort({ createdAt: 1 })
    .limit(200)
    .select("role content -_id")
    .lean();

  return NextResponse.json({ messages: history });
}
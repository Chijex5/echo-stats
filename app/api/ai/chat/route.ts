import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUserId } from "@/lib/get-session-user-id";
import { connectDB } from "@/lib/db";
import { buildMusicContext } from "@/lib/ai/buildMusicContext";
import { MUSIC_ASSISTANT_SYSTEM_PROMPT, buildMusicAssistantUserPrompt } from "@/lib/ai-prompts";

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

const OPENAI_CHAT_URL = "https://api.openai.com/v1/chat/completions";

export async function POST(req: NextRequest) {
  const userId = await getSessionUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = chatRequestSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid chat request" }, { status: 400 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "AI chat is not configured. Add OPENAI_API_KEY on the server." },
      { status: 503 }
    );
  }

  await connectDB();
  const context = await buildMusicContext(userId);
  const latestQuestion = parsed.data.messages.at(-1)?.content ?? "Summarize my listening history.";
  const recentConversation = parsed.data.messages.slice(-6, -1);

  const aiResponse = await fetch(OPENAI_CHAT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
      temperature: 0.7,
      max_tokens: 650,
      messages: [
        { role: "system", content: MUSIC_ASSISTANT_SYSTEM_PROMPT },
        ...recentConversation,
        { role: "user", content: buildMusicAssistantUserPrompt(latestQuestion, context) },
      ],
    }),
  });

  if (!aiResponse.ok) {
    return NextResponse.json({ error: "AI provider request failed" }, { status: 502 });
  }

  const payload = await aiResponse.json();
  const answer = payload?.choices?.[0]?.message?.content;

  if (typeof answer !== "string" || !answer.trim()) {
    return NextResponse.json({ error: "AI provider returned an empty answer" }, { status: 502 });
  }

  return NextResponse.json({ answer });
}

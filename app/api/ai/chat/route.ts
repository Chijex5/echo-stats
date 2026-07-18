import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import mongoose from "mongoose";
import { GoogleGenAI } from "@google/genai";
import { getSessionUserId } from "@/lib/get-session-user-id";
import { connectDB } from "@/lib/db";
import StreamEntry from "@/lib/models/StreamEntry";
import { GENRE_GROUP_MAP, groupGenre } from "@/lib/musicAnalysis";
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

const DURATIONS = ["yesterday", "today", "last-7-days", "last-30-days"] as const;
type Duration = (typeof DURATIONS)[number];

const DURATION_LABELS: Record<Duration, string> = {
  yesterday: "yesterday",
  today: "today",
  "last-7-days": "the last 7 days",
  "last-30-days": "the last 30 days",
};

const listeningHistorySchema = z.object({ duration: z.enum(DURATIONS) });
const artistTopSongsSchema = z.object({ artist: z.string().trim().min(1).max(200) });
const createPlaylistSchema = z.object({ genre: z.string().trim().min(1).max(100) });

type AssistantCommand =
  | { kind: "listening-history"; duration: Duration }
  | { kind: "artist-top-songs"; artist: string }
  | { kind: "create-playlist"; genre: string };

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

// Escapes user/model-supplied text before it's used inside a RegExp, so an
// artist name like "3.O.T (Remix)" doesn't get interpreted as regex syntax.
function escapeRegex(input: string) {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const FALLBACK_ACK = "Let me pull that for you.";

// Recognizes exactly one of the three hidden command formats the prompt
// teaches the model to emit. Malformed command payloads are treated as "no
// command" rather than thrown — a broken command shouldn't break the whole
// response when the acknowledgement text is still perfectly fine on its own.
function parseAssistantCommand(text: string): { cleanText: string; command: AssistantCommand | null } {
  const listeningHistoryMatch = text.match(/LISTENING-HISTORY:\/\/filter:(\{[^\n]+\})/);
  if (listeningHistoryMatch) {
    const cleanText = text.replace(listeningHistoryMatch[0], "").trim();
    const parsed = listeningHistorySchema.safeParse(safeJsonParse(listeningHistoryMatch[1]));
    return {
      cleanText: cleanText || FALLBACK_ACK,
      command: parsed.success ? { kind: "listening-history", duration: parsed.data.duration } : null,
    };
  }

  const artistTopSongsMatch = text.match(/ARTIST-TOP-SONGS:\/\/filter:(\{[^\n]+\})/);
  if (artistTopSongsMatch) {
    const cleanText = text.replace(artistTopSongsMatch[0], "").trim();
    const parsed = artistTopSongsSchema.safeParse(safeJsonParse(artistTopSongsMatch[1]));
    return {
      cleanText: cleanText || FALLBACK_ACK,
      command: parsed.success ? { kind: "artist-top-songs", artist: parsed.data.artist } : null,
    };
  }

  const createPlaylistMatch = text.match(/CREATE-PLAYLIST:\/\/filter:(\{[^\n]+\})/);
  if (createPlaylistMatch) {
      
    const cleanText = text.replace(createPlaylistMatch[0], "").trim();
    const parsed = createPlaylistSchema.safeParse(safeJsonParse(createPlaylistMatch[1]));
    return {
      cleanText: cleanText || FALLBACK_ACK,
      command: parsed.success ? { kind: "create-playlist", genre: parsed.data.genre } : null,
    };
  }

  return { cleanText: text.trim(), command: null };
}

function safeJsonParse(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function getDateRange(duration: Duration) {
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

async function fetchListeningHistory(userId: string, duration: Duration) {
  const userObjectId = new mongoose.Types.ObjectId(userId);
  const { start, end } = getDateRange(duration);
  const tracks = await StreamEntry.find({ userId: userObjectId, ts: { $gte: start, $lt: end } })
    .sort({ ts: -1 })
    .limit(25)
    .select("trackName artistName albumName ts msPlayed platform skipped -_id")
    .lean();

  return { duration, range: { start, end }, returnedCount: tracks.length, tracks };
}

// No AI call — the raw data becomes the whole response. This is the actual
// fix: a plain formatter can't drift from the query results the way a
// second LLM generation could.
function formatListeningHistoryMarkdown(result: Awaited<ReturnType<typeof fetchListeningHistory>>): string {
  if (result.tracks.length === 0) {
    return `No plays found for **${DURATION_LABELS[result.duration]}**.`;
  }
  const lines = result.tracks.map(
    (t: { trackName: string; artistName: string }) => `- **${t.trackName}** – ${t.artistName}`
  );
  return [
    `Here's your listening history for **${DURATION_LABELS[result.duration]}** (${result.returnedCount} ${
      result.returnedCount === 1 ? "play" : "plays"
    }):`,
    "",
    ...lines,
  ].join("\n");
}

// Top 10 tracks by play count for one artist. Substring match (not an exact
// match) on purpose: this dataset stores collabs as one combined string
// (e.g. "Reekado Banks, Sarkodie"), so an exact match on "Sarkodie" alone
// would silently miss that row.
async function fetchArtistTopSongs(userId: string, artist: string) {
  const userObjectId = new mongoose.Types.ObjectId(userId);
  const artistRegex = new RegExp(escapeRegex(artist.trim()), "i");

  const tracks = await StreamEntry.aggregate([
    { $match: { userId: userObjectId, artistName: artistRegex } },
    {
      $group: {
        _id: { track: "$trackName", artist: "$artistName" },
        trackName: { $first: "$trackName" },
        artistName: { $first: "$artistName" },
        albumName: { $first: "$albumName" },
        playCount: { $sum: 1 },
        lastPlayed: { $max: "$ts" },
      },
    },
    { $sort: { playCount: -1 } },
    { $limit: 10 },
    { $project: { _id: 0, trackName: 1, artistName: 1, albumName: 1, playCount: 1, lastPlayed: 1 } },
  ]);

  return { artist, matchedTrackCount: tracks.length, tracks };
}

// Maps free-text genre input to one of the canonical group IDs in
// GENRE_GROUP_MAP (e.g. "hip pop" -> "hiphop"). Also accepts a group ID
// directly, since the prompt asks the model to already map to these names.
function normalizeGenreQuery(input: string): string | null {
  const key = input.trim().toLowerCase();
  if (GENRE_GROUP_MAP[key]) return GENRE_GROUP_MAP[key];
  const knownGroups = new Set(Object.values(GENRE_GROUP_MAP));
  if (knownGroups.has(key)) return key;
  return null;
}


async function fetchPlaylistByGenre(userId: string, rawGenre: string) {
  const matchedGenre = normalizeGenreQuery(rawGenre);
  if (!matchedGenre) {
    return { genre: rawGenre, matchedGenre: null as string | null, tracks: [] as unknown[] };
  }

  const userObjectId = new mongoose.Types.ObjectId(userId);

  const distinctRawGenres: string[] = await StreamEntry.distinct("genre", {
    userId: userObjectId,
    genre: { $nin: [null, "", "unknown"] },
  });

  const matchingRawGenres = distinctRawGenres.filter((g) => groupGenre(g) === matchedGenre);

  if (matchingRawGenres.length === 0) {
    return { genre: rawGenre, matchedGenre, tracks: [] as unknown[] };
  }

  const tracks = await StreamEntry.aggregate([
    { $match: { userId: userObjectId, genre: { $in: matchingRawGenres } } },
    {
      $group: {
        _id: { track: "$trackName", artist: "$artistName" },
        trackName: { $first: "$trackName" },
        artistName: { $first: "$artistName" },
        playCount: { $sum: 1 },
      },
    },
    { $sort: { playCount: -1 } },
    { $limit: 20 },
    { $project: { _id: 0, trackName: 1, artistName: 1, playCount: 1 } },
  ]);

  return { genre: rawGenre, matchedGenre, tracks };
}

// No AI call, same reasoning as formatListeningHistoryMarkdown — this is a
// judgment call since it wasn't specified explicitly; switch this to route
// through generateFollowUpText/buildCommandResultPrompt instead if you'd
// rather have AI-authored framing on playlists.
function formatPlaylistMarkdown(result: Awaited<ReturnType<typeof fetchPlaylistByGenre>>): string {
  if (!result.matchedGenre) {
    return `I don't recognize "${result.genre}" as a genre I can filter by. Try things like afrobeats, hip-hop, R&B, pop, rock, electronic, jazz, latin, or indie.`;
  }
  if (result.tracks.length === 0) {
    return `No ${result.matchedGenre} plays found in your history yet.`;
  }
  const lines = (result.tracks as { trackName: string; artistName: string; playCount: number }[]).map(
    (t) =>
      `- **${t.trackName}** – ${t.artistName} (${t.playCount} ${t.playCount === 1 ? "play" : "plays"})`
  );
  return [`Here's a playlist pulled from your own ${result.matchedGenre} history:`, "", ...lines].join("\n");
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

// Only reached now for commands that want AI-authored framing
// (artist-top-songs). Data-dump commands never call this.
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

// Runs whichever command the model picked and returns the finished
// human-facing text for that turn — either straight Markdown, or (for
// artist-top-songs) one more AI call to frame the recommendation.
async function resolveCommand(
  userId: string,
  command: AssistantCommand,
  latestQuestion: string,
  client: GoogleGenAI,
  model: string,
  interactionId: string | undefined
): Promise<string> {
  switch (command.kind) {
    case "listening-history": {
      const result = await fetchListeningHistory(userId, command.duration);
      return formatListeningHistoryMarkdown(result);
    }
    case "artist-top-songs": {
      const result = await fetchArtistTopSongs(userId, command.artist);
      return generateFollowUpText(buildCommandResultPrompt(latestQuestion, result), client, model, interactionId);
    }
    case "create-playlist": {
      const result = await fetchPlaylistByGenre(userId, command.genre);
      return formatPlaylistMarkdown(result);
    }
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
    httpOptions: { timeout: 30_000, retryOptions: { attempts: 3 } },
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
    const { cleanText, command } = parseAssistantCommand(firstAnswer);

    await saveTurns(userId, [
      { role: "user", content: latestQuestion },
      { role: "assistant", content: cleanText },
    ]);

    if (!command) {
      return NextResponse.json({ messages: [{ role: "assistant", content: cleanText }] });
    }

    const followUpText = await resolveCommand(userId, command, latestQuestion, client, model, interactionId);
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
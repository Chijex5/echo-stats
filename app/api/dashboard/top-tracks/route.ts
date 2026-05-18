import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/db";
import StreamEntry from "@/lib/models/StreamEntry";
import mongoose from "mongoose";

// Deterministic gradient palette — vivid, Spotify-adjacent
const GRADIENT_PALETTE: string[] = [
  "from-red-500 to-orange-500",
  "from-blue-500 to-cyan-500",
  "from-pink-400 to-rose-400",
  "from-purple-500 to-indigo-500",
  "from-emerald-400 to-teal-500",
  "from-yellow-400 to-amber-500",
  "from-violet-500 to-purple-600",
  "from-sky-400 to-blue-600",
  "from-fuchsia-500 to-pink-500",
  "from-lime-400 to-green-500",
];

/**
 * Simple string hash so the same URI always gets the same color,
 * and the color is spread evenly across the palette.
 */
function uriToColor(uri: string): string {
  let hash = 0;
  for (let i = 0; i < uri.length; i++) {
    hash = (hash * 31 + uri.charCodeAt(i)) >>> 0;
  }
  return GRADIENT_PALETTE[hash % GRADIENT_PALETTE.length];
}

type Trend = "up" | "down" | "same";

function computeTrend(current: number, previous: number): Trend {
  if (previous === 0) return current > 0 ? "up" : "same";
  const delta = (current - previous) / previous;
  if (delta > 0.05) return "up";
  if (delta < -0.05) return "down";
  return "same";
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const limit = Number(new URL(req.url).searchParams.get("limit") ?? "10");

  await connectDB();
  const userId = new mongoose.Types.ObjectId(session.user.id);

  // Time windows
  const now = new Date();
  const currentStart = new Date(now);
  currentStart.setMonth(currentStart.getMonth() - 1); // last 30 days

  const previousStart = new Date(now);
  previousStart.setMonth(previousStart.getMonth() - 2); // 30–60 days ago

  // ── Current month plays ──────────────────────────────────────────────────
  const currentAgg = await StreamEntry.aggregate([
    { $match: { userId, ts: { $gte: currentStart } } },
    {
      $group: {
        _id: "$spotifyTrackUri",
        trackName: { $first: "$trackName" },
        artistName: { $first: "$artistName" },
        albumName: { $first: "$albumName" },
        playCount: { $sum: 1 },
        totalMs: { $sum: "$msPlayed" },
        lastPlayed: { $max: "$ts" },
        firstPlayed: { $min: "$ts" },
      },
    },
    { $sort: { playCount: -1 } },
    { $limit: limit },
  ]);

  // ── Previous month plays (only for URIs that made the current top list) ──
  const topUris = currentAgg.map((t) => t._id);

  const previousAgg = await StreamEntry.aggregate([
    {
      $match: {
        userId,
        spotifyTrackUri: { $in: topUris },
        ts: { $gte: previousStart, $lt: currentStart },
      },
    },
    {
      $group: {
        _id: "$spotifyTrackUri",
        playCount: { $sum: 1 },
      },
    },
  ]);

  const prevMap = new Map<string, number>(
    previousAgg.map((p) => [p._id as string, p.playCount as number])
  );

  // ── Assemble response ────────────────────────────────────────────────────
  const tracks = currentAgg.map((t) => {
    const prevPlays = prevMap.get(t._id as string) ?? 0;
    return {
      uri: t._id as string,
      trackName: t.trackName as string,
      artistName: t.artistName as string,
      albumName: t.albumName as string,
      playCount: t.playCount as number,
      previousPlayCount: prevPlays,
      totalMs: t.totalMs as number,
      lastPlayed: t.lastPlayed as Date,
      firstPlayed: t.firstPlayed as Date,
      trend: computeTrend(t.playCount as number, prevPlays),
      color: uriToColor(t._id as string),
    };
  });

  return NextResponse.json({ tracks });
}
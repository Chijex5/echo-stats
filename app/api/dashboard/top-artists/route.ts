import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/db";
import StreamEntry from "@/lib/models/StreamEntry";
import mongoose from "mongoose";

// ─── Colour palette (matches top-tracks palette style) ────────────────────

const GRADIENT_PALETTE: string[] = [
  "from-red-500 to-orange-500",
  "from-purple-500 to-indigo-500",
  "from-pink-500 to-rose-400",
  "from-emerald-400 to-cyan-500",
  "from-blue-500 to-cyan-400",
  "from-amber-500 to-orange-400",
  "from-green-500 to-emerald-400",
  "from-red-600 to-pink-600",
  "from-violet-500 to-purple-600",
  "from-sky-400 to-blue-600",
];

function nameToColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  return GRADIENT_PALETTE[hash % GRADIENT_PALETTE.length];
}

function nameToInitials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

type Trend = "up" | "down" | "same";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const limit = Number(new URL(req.url).searchParams.get("limit") ?? "8");

  await connectDB();
  const userId = new mongoose.Types.ObjectId(session.user.id);

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  // ── Current & previous period totals ──────────────────────────────────────
  const [current, previous] = await Promise.all([
    StreamEntry.aggregate<{ _id: string; plays: number }>([
      { $match: { userId, ts: { $gte: thirtyDaysAgo } } },
      { $group: { _id: "$artistName", plays: { $sum: 1 } } },
    ]),
    StreamEntry.aggregate<{ _id: string; plays: number }>([
      { $match: { userId, ts: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo } } },
      { $group: { _id: "$artistName", plays: { $sum: 1 } } },
    ]),
  ]);

  const prevMap = new Map(previous.map((a) => [a._id, a.plays]));

  // Top N by current plays
  const topArtists = current
    .map((a) => {
      const prev = prevMap.get(a._id) ?? 0;
      const delta = a.plays - prev;
      const trend: Trend = delta > 0 ? "up" : delta < 0 ? "down" : "same";
      return { name: a._id, plays: a.plays, prev, delta, trend };
    })
    .sort((a, b) => b.plays - a.plays)
    .slice(0, limit);

  // ── Weekly sparkline buckets for top artists (last 5 weeks) ──────────────
  const topNames = topArtists.map((a) => a.name);
  const fiveWeeksAgo = new Date(now.getTime() - 5 * 7 * 24 * 60 * 60 * 1000);

  const sparklineAgg = await StreamEntry.aggregate<{
    _id: { artist: string; week: number };
    plays: number;
  }>([
    {
      $match: {
        userId,
        artistName: { $in: topNames },
        ts: { $gte: fiveWeeksAgo },
      },
    },
    {
      $group: {
        _id: {
          artist: "$artistName",
          // week bucket 0..4 (oldest → newest)
          week: {
            $floor: {
              $divide: [
                { $subtract: [now, "$ts"] },
                7 * 24 * 60 * 60 * 1000,
              ],
            },
          },
        },
        plays: { $sum: 1 },
      },
    },
  ]);

  // Build a Map<artistName, number[5]> with oldest first
  const sparkMap = new Map<string, number[]>(
    topNames.map((n) => [n, [0, 0, 0, 0, 0]])
  );
  for (const row of sparklineAgg) {
    const { artist, week } = row._id;
    const idx = 4 - Math.min(Math.floor(week), 4); // invert: week 0 = this week = index 4
    const arr = sparkMap.get(artist);
    if (arr) arr[idx] = row.plays;
  }

  // ── Assemble final response ───────────────────────────────────────────────
  const artists = topArtists.map((a) => ({
    name: a.name,
    initials: nameToInitials(a.name),
    plays: a.plays,
    delta: a.delta,
    trend: a.trend,
    deltaLabel:
      a.delta > 0
        ? `+${a.delta} plays this month`
        : a.delta < 0
        ? `${a.delta} plays vs last`
        : "Steady listening",
    color: nameToColor(a.name),
    sparkline: (sparkMap.get(a.name) ?? [0, 0, 0, 0, 0]).map((v) => ({ v })),
  }));

  return NextResponse.json({ artists });
}
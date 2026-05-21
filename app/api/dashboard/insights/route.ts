import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/db";
import StreamEntry from "@/lib/models/StreamEntry";
import mongoose from "mongoose";
import { analyzeUserMusic } from "@/lib/musicAnalysis";
import { a } from "framer-motion/client";

// ── helpers ────────────────────────────────────────────────────────────────

function decadeLabel(year: number): string {
  const d = Math.floor(year / 10) * 10;
  return `${d}s`;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const userId = new mongoose.Types.ObjectId(session.user.id);

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
  const yearStart = new Date(now.getFullYear(), 0, 1);

  const [
    trackPlays,
    prevTrackPlays,
    hourBuckets,
    decadeAgg,
    firstSongAgg,
    allPlaysForStreak,
  ] = await Promise.all([

    // ── 1. Current 30-day track plays (for Hidden Gem: lowest global-ish play count) ──
    StreamEntry.aggregate<{ _id: string; trackName: string; artistName: string; albumImageUrl: string | null; plays: number }>([
      { $match: { userId, ts: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: "$spotifyTrackUri",
          trackName: { $first: "$trackName" },
          albumImageUrl: { $first: "$albumImageUrl" },
          artistName: { $first: "$artistName" },
          plays: { $sum: 1 },
        },
      },
      { $sort: { plays: 1 } }, // ascending: fewest plays = most "underground"
      { $limit: 1 },
    ]),

    // ── 2. Previous 30-day genre breakdown (for Genre Drift) ──
    // We proxy "genre" through artistName — top artist name of each window
    Promise.all([
      StreamEntry.aggregate<{ _id: string; plays: number; albumImageUrl: string | null }>([
        { $match: { userId, ts: { $gte: thirtyDaysAgo } } },
        { $group: { _id: "$artistName", plays: { $sum: 1 }, albumImageUrl: { $first: "$albumImageUrl" } } },
        { $sort: { plays: -1 } },
        { $limit: 1 },
      ]),
      StreamEntry.aggregate<{ _id: string; plays: number; albumImageUrl: string | null }>([
        { $match: { userId, ts: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo } } },
        { $group: { _id: "$artistName", plays: { $sum: 1 }, albumImageUrl: { $first: "$albumImageUrl" } } },
        { $sort: { plays: -1 } },
        { $limit: 1 },
      ]),
    ]),

    // ── 3. Hour-of-day distribution (for Emotional Profile proxy) ──
    // Morning 6-11 = calm, Afternoon 12-17 = neutral, Evening 18-21 = energetic, Night 22-5 = intense
    StreamEntry.aggregate<{ _id: number; count: number }>([
      { $match: { userId, ts: { $gte: thirtyDaysAgo } } },
      { $group: { _id: { $hour: "$ts" }, count: { $sum: 1 } } },
    ]),

    // ── 4. Release-year decade breakdown ──
    StreamEntry.aggregate<{ _id: number; count: number }>([
      { $match: { userId, releaseYear: { $exists: true, $ne: null } } },
      {
        $group: {
          _id: { $floor: { $divide: ["$releaseYear", 10] } }, // e.g. 201 = 2010s
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]),

    // ── 5. First song of the current year ──
    StreamEntry.aggregate<{ _id: string; trackName: string; artistName: string; albumImageUrl: string | null; ts: Date }>([
      { $match: { userId, ts: { $gte: yearStart } } },
      { $sort: { ts: 1 } },
      { $limit: 1 },
      {
        $project: {
          _id: "$spotifyTrackUri",
          trackName: 1,
          artistName: 1,
          albumImageUrl: 1,
          ts: 1,
        },
      },
    ]),

    // ── 6. All plays for longest single-track consecutive-day streak ──
    // Group by (uri, date) → find longest run of consecutive dates per track
    StreamEntry.aggregate<{ _id: { uri: string; date: string }; trackName: string; artistName: string; albumImageUrl: string | null }>([
      { $match: { userId } },
      {
        $group: {
          _id: {
            uri: "$spotifyTrackUri",
            date: { $dateToString: { format: "%Y-%m-%d", date: "$ts" } },
          },
          trackName: { $first: "$trackName" },
          artistName: { $first: "$artistName" },
          albumImageUrl: { $first: "$albumImageUrl" },
        },
      },
      { $sort: { "_id.uri": 1, "_id.date": 1 } },
    ]),
  ]);

  // ── Post-process: Hidden Gem ──────────────────────────────────────────────
  const hiddenGem = trackPlays[0] ?? null;

  // ── Post-process: Genre Drift ─────────────────────────────────────────────
  const [currentTopArtists, prevTopArtists] = prevTrackPlays as [
    { _id: string; plays: number; albumImageUrl: string | null }[],
    { _id: string; plays: number; albumImageUrl: string | null }[],
  ];
  const genreDrift = {
    from: prevTopArtists[0]?._id ?? null,
    to: currentTopArtists[0]?._id ?? null,
    drifted: prevTopArtists[0]?._id !== currentTopArtists[0]?._id,
  };

  // ── Post-process: Emotional Profile ──────────────────────────────────────
  // Bucket hours into 4 energy segments; returns % for each
  let calm = 0, neutral = 0, energetic = 0, intense = 0, total = 0;
  for (const { _id: hour, count } of hourBuckets) {
    total += count;
    if (hour >= 6 && hour <= 11) calm += count;
    else if (hour >= 12 && hour <= 17) neutral += count;
    else if (hour >= 18 && hour <= 21) energetic += count;
    else intense += count; // 22-5
  }
  const pct = (n: number) => (total > 0 ? Math.round((n / total) * 100) : 0);
  const emotionalProfile = {
    calm: pct(calm),
    neutral: pct(neutral),
    energetic: pct(energetic),
    intense: pct(intense),
    dominantLabel:
      Math.max(calm, neutral, energetic, intense) === calm
        ? "Calm"
        : Math.max(neutral, energetic, intense) === neutral
        ? "Neutral"
        : Math.max(energetic, intense) === energetic
        ? "High Energy"
        : "Late Night",
  };

  // ── Post-process: Favorite Decade ────────────────────────────────────────
  // Build ordered decade bars from 1960s to 2020s
  const decadeMap = new Map(decadeAgg.map((d) => [d._id * 10, d.count]));
  const decadeBands = [1960, 1970, 1980, 1990, 2000, 2010, 2020];
  const decadeTotals = decadeBands.map((d) => decadeMap.get(d) ?? 0);
  const maxDecade = Math.max(...decadeTotals, 1);
  const totalDecadePlays = decadeTotals.reduce((a, b) => a + b, 0) || 1;
  const topDecadeIdx = decadeTotals.indexOf(Math.max(...decadeTotals));
  const favoriteDecade = {
    bars: decadeTotals.map((c, i) => ({
      decade: decadeBands[i],
      label: decadeLabel(decadeBands[i]),
      count: c,
      heightPct: Math.round((c / maxDecade) * 100),
      isTop: i === topDecadeIdx,
    })),
    topDecade: decadeLabel(decadeBands[topDecadeIdx]),
    topPct: Math.round((decadeTotals[topDecadeIdx] / totalDecadePlays) * 100),
  };

  // ── Post-process: First Song ──────────────────────────────────────────────
  const firstSong = firstSongAgg[0]
    ? {
        trackName: firstSongAgg[0].trackName,
        artistName: firstSongAgg[0].artistName,
        albumImageUrl: firstSongAgg[0].albumImageUrl ?? null, // we don't have this info in the current schema; would require an extra query or storing it in the entry
        ts: firstSongAgg[0].ts,
      }
    : null;

  // ── Post-process: Longest Repeat Streak ───────────────────────────────────
  // Group play-days by URI, find max consecutive run
  type StreakEntry = { trackName: string; artistName: string; albumImageUrl: string | null; days: string[] };
  const streakMap = new Map<string, StreakEntry>();

  for (const row of allPlaysForStreak) {
    const uri = row._id.uri;
    const date = row._id.date;
    if (!streakMap.has(uri)) {
      streakMap.set(uri, { trackName: row.trackName, artistName: row.artistName, albumImageUrl: row.albumImageUrl ?? null, days: [] });
    }
    streakMap.get(uri)!.days.push(date);
  }

  let longestStreak: { trackName: string; artistName: string; albumImageUrl: string | null; days: number } = { trackName: "", artistName: "", albumImageUrl: null, days: 0 };

  for (const { trackName, artistName, albumImageUrl, days } of streakMap.values()) {
    // days is already sorted ascending from the aggregation
    let run = 1;
    let best = 1;
    for (let i = 1; i < days.length; i++) {
      const prev = new Date(days[i - 1]);
      const curr = new Date(days[i]);
      const diff = (curr.getTime() - prev.getTime()) / (24 * 60 * 60 * 1000);
      if (diff === 1) {
        run++;
        best = Math.max(best, run);
      } else {
        run = 1;
      }
    }
    if (best > longestStreak.days) {
      longestStreak = { trackName, artistName, albumImageUrl, days: best };
    }
  }

  const allStreams = await StreamEntry.find({ userId }).sort({ ts: 1 }).lean();
    if (allStreams.length === 0) {
      return NextResponse.json({ error: "No stream data found for user" }, { status: 404 });
    }
    const normalizedStreams = allStreams.map(stream => ({
      ...stream,
      releaseYearConfidence: stream.releaseYearConfidence ?? undefined,
      releaseDatePrecision: stream.releaseDatePrecision ?? undefined,
    })) as Parameters<typeof analyzeUserMusic>[1];

  const analysisResult = analyzeUserMusic(userId, normalizedStreams as Parameters<typeof analyzeUserMusic>[1]);

  return NextResponse.json({
    hiddenGem,
    genreDrift,
    emotionalProfile,
    favoriteDecade,
    analysisResult,
    firstSong,
    longestStreak: longestStreak.days > 0 ? longestStreak : null,
  });
}
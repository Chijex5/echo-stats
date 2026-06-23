import { NextRequest, NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/get-session-user-id";
import { connectDB } from "@/lib/db";
import StreamEntry from "@/lib/models/StreamEntry";
import mongoose from "mongoose";

// ── helpers ────────────────────────────────────────────────────────────────

function decadeLabel(year: number): string {
  const d = Math.floor(year / 10) * 10;
  return `${d}s`;
}

export async function GET(req: NextRequest) {
  const userId = await getSessionUserId(req);
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const userObjectId = new mongoose.Types.ObjectId(userId);

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
    StreamEntry.aggregate<{ _id: string; trackName: string; artistName: string; plays: number }>([
      { $match: { userId: userObjectId, ts: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: "$spotifyTrackUri",
          trackName: { $first: "$trackName" },
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
      StreamEntry.aggregate<{ _id: string; plays: number }>([
        { $match: { userId: userObjectId, ts: { $gte: thirtyDaysAgo } } },
        { $group: { _id: "$artistName", plays: { $sum: 1 } } },
        { $sort: { plays: -1 } },
        { $limit: 1 },
      ]),
      StreamEntry.aggregate<{ _id: string; plays: number }>([
        { $match: { userId: userObjectId, ts: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo } } },
        { $group: { _id: "$artistName", plays: { $sum: 1 } } },
        { $sort: { plays: -1 } },
        { $limit: 1 },
      ]),
    ]),

    // ── 3. Hour-of-day distribution (for Emotional Profile proxy) ──
    // Morning 6-11 = calm, Afternoon 12-17 = neutral, Evening 18-21 = energetic, Night 22-5 = intense
    StreamEntry.aggregate<{ _id: number; count: number }>([
      { $match: { userId: userObjectId, ts: { $gte: thirtyDaysAgo } } },
      { $group: { _id: { $hour: "$ts" }, count: { $sum: 1 } } },
    ]),

    // ── 4. Release-year decade breakdown ──
    StreamEntry.aggregate<{ _id: number; count: number }>([
      { $match: { userId: userObjectId, releaseYear: { $exists: true, $ne: null } } },
      {
        $group: {
          _id: { $floor: { $divide: ["$releaseYear", 10] } }, // e.g. 201 = 2010s
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]),

    // ── 5. First song of the current year ──
    StreamEntry.aggregate<{ _id: string; trackName: string; artistName: string; ts: Date }>([
      { $match: { userId: userObjectId, ts: { $gte: yearStart } } },
      { $sort: { ts: 1 } },
      { $limit: 1 },
      {
        $project: {
          _id: "$spotifyTrackUri",
          trackName: 1,
          artistName: 1,
          ts: 1,
        },
      },
    ]),

    // ── 6. All plays for longest single-track consecutive-day streak ──
    // Group by (uri, date) → find longest run of consecutive dates per track
    StreamEntry.aggregate<{ _id: { uri: string; date: string }; trackName: string; artistName: string }>([
      { $match: { userId: userObjectId } },
      {
        $group: {
          _id: {
            uri: "$spotifyTrackUri",
            date: { $dateToString: { format: "%Y-%m-%d", date: "$ts" } },
          },
          trackName: { $first: "$trackName" },
          artistName: { $first: "$artistName" },
        },
      },
      { $sort: { "_id.uri": 1, "_id.date": 1 } },
    ]),
  ]);

  // ── Post-process: Hidden Gem ──────────────────────────────────────────────
  const hiddenGem = trackPlays[0] ?? null;

  // ── Post-process: Genre Drift ─────────────────────────────────────────────
  const [currentTopArtists, prevTopArtists] = prevTrackPlays as [
    { _id: string; plays: number }[],
    { _id: string; plays: number }[],
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
        ts: firstSongAgg[0].ts,
      }
    : null;

  // ── Post-process: Longest Repeat Streak ───────────────────────────────────
  // Group play-days by URI, find max consecutive run
  type StreakEntry = { trackName: string; artistName: string; days: string[] };
  const streakMap = new Map<string, StreakEntry>();

  for (const row of allPlaysForStreak) {
    const uri = row._id.uri;
    const date = row._id.date;
    if (!streakMap.has(uri)) {
      streakMap.set(uri, { trackName: row.trackName, artistName: row.artistName, days: [] });
    }
    streakMap.get(uri)!.days.push(date);
  }

  let longestStreak = { trackName: "", artistName: "", days: 0 };

  for (const { trackName, artistName, days } of streakMap.values()) {
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
      longestStreak = { trackName, artistName, days: best };
    }
  }

  return NextResponse.json({
    hiddenGem,
    genreDrift,
    emotionalProfile,
    favoriteDecade,
    firstSong,
    longestStreak: longestStreak.days > 0 ? longestStreak : null,
  });
}
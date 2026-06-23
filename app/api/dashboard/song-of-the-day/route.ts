import { NextRequest, NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/get-session-user-id";
import { connectDB } from "@/lib/db";
import StreamEntry from "@/lib/models/StreamEntry";
import mongoose from "mongoose";

// ─── Constants ─────────────────────────────────────────────────────────────

const MIN_PLAYS = 5;               // must have played this many times to qualify
const RECENCY_EXCLUSION_DAYS = 30; // exclude songs played in the last 30 days
const CANDIDATE_POOL = 80;         // how many candidates to pull before scoring

const GRADIENT_PALETTE = [
  { from: "#3B82F6", to: "#7C3AED", cls: "from-blue-500 to-violet-600" },
  { from: "#EC4899", to: "#F97316", cls: "from-pink-500 to-orange-400" },
  { from: "#10B981", to: "#06B6D4", cls: "from-emerald-500 to-cyan-400" },
  { from: "#F59E0B", to: "#EF4444", cls: "from-amber-400 to-red-500" },
  { from: "#8B5CF6", to: "#EC4899", cls: "from-violet-500 to-pink-500" },
  { from: "#06B6D4", to: "#3B82F6", cls: "from-cyan-400 to-blue-500" },
  { from: "#F97316", to: "#FBBF24", cls: "from-orange-500 to-amber-400" },
  { from: "#EF4444", to: "#EC4899", cls: "from-red-500 to-pink-500" },
];

const SNAPSHOT_PALETTE = [
  "from-pink-500 to-orange-400",
  "from-purple-500 to-indigo-500",
  "from-emerald-500 to-teal-400",
  "from-amber-400 to-orange-500",
  "from-blue-500 to-cyan-500",
  "from-rose-400 to-pink-500",
  "from-violet-500 to-fuchsia-500",
  "from-indigo-500 to-purple-500",
  "from-yellow-500 to-amber-600",
];

function uriToGradient(uri: string) {
  let hash = 0;
  for (let i = 0; i < uri.length; i++) hash = (hash * 31 + uri.charCodeAt(i)) >>> 0;
  return GRADIENT_PALETTE[hash % GRADIENT_PALETTE.length];
}

function strToSnapshotColor(s: string) {
  let hash = 0;
  for (let i = 0; i < s.length; i++) hash = (hash * 31 + s.charCodeAt(i)) >>> 0;
  return SNAPSHOT_PALETTE[hash % SNAPSHOT_PALETTE.length];
}

/** Deterministic day seed: same userId + calendar date → same integer */
function dayIndex(userId: string, date: Date): number {
  const dateStr = date.toISOString().slice(0, 10); // "YYYY-MM-DD"
  let hash = 0;
  const key = userId + dateStr;
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  return hash;
}

function nameToInitials(name: string): string {
  return name.split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");
}

/** Season label from month number (0-indexed) */
function seasonLabel(month: number): string {
  if (month >= 2 && month <= 4) return "spring";
  if (month >= 5 && month <= 7) return "summer";
  if (month >= 8 && month <= 10) return "autumn";
  return "winter";
}

/** "X days ago" / "X months ago" */
function timeAgoLabel(date: Date, now: Date): string {
  const diffMs = now.getTime() - date.getTime();
  const days = Math.floor(diffMs / (24 * 60 * 60 * 1000));
  if (days < 1) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  return months === 1 ? "1 month ago" : `${months} months ago`;
}

// ─── Route ─────────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const userId = await getSessionUserId(req);
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const userObjectId = new mongoose.Types.ObjectId(userId);
  const now = new Date();
  const recencyCutoff = new Date(now.getTime() - RECENCY_EXCLUSION_DAYS * 24 * 60 * 60 * 1000);

  // ── 1. Pull candidate pool ─────────────────────────────────────────────
  // Tracks with ≥ MIN_PLAYS, not played in the last 30 days, sorted by total plays desc
  type CandidateAgg = {
    _id: string;
    trackName: string;
    artistName: string;
    albumName: string;
    albumImageUrl?: string;
    artistImageUrl?: string;
    playCount: number;
    totalMs: number;
    lastPlayed: Date;
    firstPlayed: Date;
  };

  const candidates = await StreamEntry.aggregate<CandidateAgg>([
    { $match: { userId: userObjectId } },
    {
      $group: {
        _id: "$spotifyTrackUri",
        albumImageUrl: { $first: "$albumImageUrl" },
        trackName: { $first: "$trackName" },
        artistName: { $first: "$artistName" },
        artistImageUrl: { $first: "$artistImageUrl" },
        albumName: { $first: "$albumName" },
        playCount: { $sum: 1 },
        totalMs: { $sum: "$msPlayed" },
        lastPlayed: { $max: "$ts" },
        firstPlayed: { $min: "$ts" },
      },
    },
    { $match: { playCount: { $gte: MIN_PLAYS }, lastPlayed: { $lt: recencyCutoff } } },
    { $sort: { playCount: -1 } },
    { $limit: CANDIDATE_POOL },
  ]);

  if (candidates.length === 0) {
    return NextResponse.json({ error: "No eligible songs found" }, { status: 404 });
  }

  // ── 2. Deterministic daily pick ────────────────────────────────────────
  const seed = dayIndex(userId, now);
  const picked = candidates[seed % candidates.length];

  const gradient = uriToGradient(picked._id);
  const daysSinceLastPlay = Math.floor(
    (now.getTime() - picked.lastPlayed.getTime()) / (24 * 60 * 60 * 1000)
  );

  // ── 3. Full play history for the picked track ──────────────────────────
  type TrackPlayEntry = { ts: Date; msPlayed: number };
  const trackPlays = await StreamEntry.find(
    { userId: userObjectId, spotifyTrackUri: picked._id },
    { ts: 1, msPlayed: 1, _id: 0 }
  ).lean<TrackPlayEntry[]>();

  // ── 4. Story beats ─────────────────────────────────────────────────────
  // Peak month
  const monthCountMap = new Map<string, number>();
  for (const { ts } of trackPlays) {
    const key = `${ts.getFullYear()}-${String(ts.getMonth() + 1).padStart(2, "0")}`;
    monthCountMap.set(key, (monthCountMap.get(key) ?? 0) + 1);
  }
  let peakMonthKey = "";
  let peakMonthCount = 0;
  for (const [k, v] of monthCountMap) {
    if (v > peakMonthCount) { peakMonthCount = v; peakMonthKey = k; }
  }
  const peakMonthDate = peakMonthKey
    ? new Date(Number(peakMonthKey.split("-")[0]), Number(peakMonthKey.split("-")[1]) - 1, 1)
    : picked.lastPlayed;
  const peakMonthLabel = peakMonthDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  // Night % (22:00–05:00)
  const nightPlays = trackPlays.filter(({ ts }) => {
    const h = ts.getHours();
    return h >= 22 || h <= 4;
  });
  const nightPct = Math.round((nightPlays.length / trackPlays.length) * 100);

  // Season anchor: most played season
  const seasonCount: Record<string, number> = {};
  for (const { ts } of trackPlays) {
    const s = seasonLabel(ts.getMonth());
    seasonCount[s] = (seasonCount[s] ?? 0) + 1;
  }
  const dominantSeason = Object.entries(seasonCount).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "year";

  // ── 5. Monthly play trend (last 12 calendar months) ───────────────────
  const MONTH_LABELS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const monthTrend = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    return { m: MONTH_LABELS[d.getMonth()], v: monthCountMap.get(key) ?? 0 };
  });

  // ── 6. Hour-of-day distribution ────────────────────────────────────────
  const hourCounts = new Array(24).fill(0) as number[];
  for (const { ts } of trackPlays) hourCounts[ts.getHours()]++;
  const hourHeat = hourCounts.map((v, h) => ({ hour: h, v }));
  const peakHour = hourCounts.indexOf(Math.max(...hourCounts));
  const peakHourLabel = `${String(peakHour % 12 || 12).padStart(2, "0")}:${
    peakHour < 12 ? "00 AM" : "00 PM"
  }`;

  // ── 7. Repeat-per-session curve ────────────────────────────────────────
  // Group plays by calendar date, count plays per date, build frequency histogram
  const playsPerDay = new Map<string, number>();
  for (const { ts } of trackPlays) {
    const k = ts.toISOString().slice(0, 10);
    playsPerDay.set(k, (playsPerDay.get(k) ?? 0) + 1);
  }
  // Build histogram of repeat counts (how many days had 1 play, 2 plays, …)
  const repeatFreq = new Map<number, number>();
  for (const count of playsPerDay.values()) {
    repeatFreq.set(count, (repeatFreq.get(count) ?? 0) + 1);
  }
  const maxRepeat = Math.max(...repeatFreq.keys(), 1);
  const repeatCurve = Array.from({ length: Math.min(maxRepeat, 18) }, (_, i) => ({
    v: repeatFreq.get(i + 1) ?? 0,
  }));
  const maxRepeatsInOneDay = maxRepeat;

  // ── 8. Affinity score ─────────────────────────────────────────────────
  // Weighted composite 0–100:
  //   40% — play count rank within candidate pool
  //   30% — recency gap (longer gap = higher nostalgia score)
  //   20% — night listening (more nocturnal = more emotionally charged)
  //   10% — peak month concentration (higher peak = deeper attachment)
  const rankPct = 1 - candidates.indexOf(picked) / Math.max(candidates.length - 1, 1);
  const maxGap = Math.max(...candidates.map((c) =>
    (now.getTime() - c.lastPlayed.getTime()) / (24 * 60 * 60 * 1000)
  ), 1);
  const gapPct = Math.min(daysSinceLastPlay / maxGap, 1);
  const nightScore = nightPct / 100;
  const peakConcentration = Math.min(peakMonthCount / picked.playCount, 1);

  const affinityRaw = rankPct * 40 + gapPct * 30 + nightScore * 20 + peakConcentration * 10;
  const affinityScore = Math.round(Math.min(affinityRaw, 100));
  const affinityLabel =
    affinityScore >= 85 ? "Excellent nostalgic match"
    : affinityScore >= 70 ? "Strong personal connection"
    : affinityScore >= 55 ? "Familiar memory"
    : "Quiet rediscovery";

  // ── 9. Peak-month snapshot: co-played tracks ───────────────────────────
  type CoPlayEntry = { _id: string; albumImageUrl: string | null; trackName: string; artistName: string; artistImageUrl?: string; plays: number };
  const peakStart = peakMonthDate;
  const peakEnd = new Date(peakMonthDate.getFullYear(), peakMonthDate.getMonth() + 1, 1);

  const coPlayed = await StreamEntry.aggregate<CoPlayEntry>([
    {
      $match: {
        userId: userObjectId,
        ts: { $gte: peakStart, $lt: peakEnd },
        spotifyTrackUri: { $ne: picked._id },
      },
    },
    {
      $group: {
        _id: "$spotifyTrackUri",
        trackName: { $first: "$trackName" },
        albumImageUrl: { $first: "$albumImageUrl" },
        artistName: { $first: "$artistName" },
        plays: { $sum: 1 },
      },
    },
    { $sort: { plays: -1 } },
    { $limit: 9 },
  ]);

  // Top artist during peak month
  type ArtistEntry = { _id: string; artistImageUrl?: string; plays: number };
  const peakArtists = await StreamEntry.aggregate<ArtistEntry>([
    { $match: { userId: userObjectId, ts: { $gte: peakStart, $lt: peakEnd } } },
    { $group: { _id: "$artistName", artistImageUrl: { $first: "$artistImageUrl" }, plays: { $sum: 1 } } },
    { $sort: { plays: -1 } },
    { $limit: 1 },
  ]);

  // Total hours streamed during peak month
  type MonthTotalEntry = { totalMs: number };
  const [peakMonthTotal] = await StreamEntry.aggregate<MonthTotalEntry>([
    { $match: { userId: userObjectId, ts: { $gte: peakStart, $lt: peakEnd } } },
    { $group: { _id: null, totalMs: { $sum: "$msPlayed" } } },
  ]);
  const peakMonthHours = Math.round((peakMonthTotal?.totalMs ?? 0) / 3_600_000);

  const topArtistPeak = peakArtists[0] ?? null;

  const snapshotTracks = coPlayed.slice(0, 4).map((t) => ({
    title: t.trackName,
    albumImageUrl: t.albumImageUrl,
    artist: t.artistName,
    artistImageUrl: t.artistImageUrl,
    color: strToSnapshotColor(t._id),
  }));

  const snapshotCollage = coPlayed.map((t) => strToSnapshotColor(t._id)).slice(0, 9);

  // ── 10. Algo reasons ──────────────────────────────────────────────────
  const algoReasons: { icon: string; label: string; desc: string }[] = [
    {
      icon: "Calendar",
      label: "Forgotten",
      desc: `Last played ${timeAgoLabel(picked.lastPlayed, now)} — past your nostalgia threshold.`,
    },
    {
      icon: "Heart",
      label: "Loved",
      desc: `${picked.playCount} lifetime plays — one of your most listened tracks.`,
    },
    {
      icon: "Moon",
      label: nightPct >= 40 ? "Nocturnal" : "Seasonal",
      desc:
        nightPct >= 40
          ? `${nightPct}% of plays were after midnight — a late-night signature.`
          : `Most plays in ${dominantSeason} — a seasonal anchor for you.`,
    },
    {
      icon: "Sparkles",
      label: "Hidden affinity",
      desc: `Peak month had ${peakMonthCount} plays — ${Math.round((peakMonthCount / picked.playCount) * 100)}% of your total listens concentrated in one month.`,
    },
  ];

  // ── 11. Related forgotten tracks ──────────────────────────────────────
  // Other candidates with similar dormancy (gap within ±60 days of picked)
  type RelatedTrack = {
    title: string;
    albumImageUrl?: string;
    artistImageUrl?: string;
    artist: string;
    color: string;
    tag: string;
    lastPlayed: string;
  };

  const TAGS = ["Late-night favorite", "Rainy-day classic", "Seasonal anchor", "One-week addiction", "Summer obsession", "Deep cut", "Rediscovered gem"];

  const related: RelatedTrack[] = candidates
    .filter((c) => c._id !== picked._id)
    .slice(0, 5)
    .map((c, i) => {
      const g = uriToGradient(c._id);
      return {
        title: c.trackName,
        albumImageUrl: c.albumImageUrl,
        artistImageUrl: c.artistImageUrl,
        artist: c.artistName,
        color: g.cls,
        tag: TAGS[i % TAGS.length],
        lastPlayed: timeAgoLabel(c.lastPlayed, now),
      };
    });

  // ── 12. Daily ritual stats (all-time SOTD participation) ──────────────
  // We compute these from the data itself; no separate SOTD view-log table exists yet.
  // Use proxy stats: consecutive listening days in the last 2 weeks, unique resurfaced tracks
  // (those with a gap of >30 days before the last play), avg affinity across candidates.
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
  type DayEntry = { _id: string };
  const recentDays = await StreamEntry.aggregate<DayEntry>([
    { $match: { userId: userObjectId, ts: { $gte: twoWeeksAgo } } },
    { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$ts" } } } },
    { $sort: { _id: -1 } },
  ]);

  let streakDays = 0;
  const today = new Date(now); today.setHours(0, 0, 0, 0);
  const daySet = new Set(recentDays.map((d) => d._id));
  for (let i = 0; i < 14; i++) {
    const d = new Date(today); d.setDate(d.getDate() - i);
    const k = d.toISOString().slice(0, 10);
    if (daySet.has(k)) streakDays++;
    else if (i > 0) break;
  }

  const avgAffinity = Math.round(
    candidates.reduce((acc, c, idx) => {
      const rp = 1 - idx / Math.max(candidates.length - 1, 1);
      const gp = Math.min(
        (now.getTime() - c.lastPlayed.getTime()) / (24 * 60 * 60 * 1000) / maxGap,
        1
      );
      return acc + rp * 40 + gp * 30;
    }, 0) / Math.max(candidates.length, 1)
  );

  // ── Assemble response ─────────────────────────────────────────────────
  return NextResponse.json({
    song: {
      uri: picked._id,
      title: picked.trackName,
      artist: picked.artistName,
      album: picked.albumName,
      released: picked.firstPlayed
        ? new Date(picked.firstPlayed).getFullYear().toString()
        : "Unknown",
      gradientFrom: gradient.from,
      gradientTo: gradient.to,
      gradientClass: gradient.cls,
      albumImageUrl: picked.albumImageUrl, // will be filled in client-side after fetching from Spotify API
      artistImageUrl: picked.artistImageUrl, // will be filled in client-side after fetching from Spotify API
    },
    stats: {
      pastPlays: picked.playCount,
      lastPlayed: timeAgoLabel(picked.lastPlayed, now),
      lastPlayedDate: picked.lastPlayed,
      daysSinceLastPlay,
      favoriteMonth: peakMonthLabel,
      peakMonthPlays: peakMonthCount,
      nightPct,
      dominantSeason,
      totalMinutes: Math.round(picked.totalMs / 60_000),
    },
    storyBeats: [
      { stat: String(peakMonthCount), label: `times in ${peakMonthLabel}`, icon: "Repeat" },
      { stat: `${nightPct}%`, label: "of plays were after midnight", icon: "Moon" },
      { stat: String(daysSinceLastPlay), label: "days since you last played it", icon: "Calendar" },
      {
        stat: dominantSeason.charAt(0).toUpperCase() + dominantSeason.slice(1),
        label: `season anchor — your shelter song`,
        icon: "CloudRain",
      },
    ],
    memorySnapshot: {
      snapshotTracks,
      snapshotCollage,
      topArtist: topArtistPeak
        ? {
            name: topArtistPeak._id,
            initials: nameToInitials(topArtistPeak._id),
            plays: topArtistPeak.plays,
            color: strToSnapshotColor(topArtistPeak._id),
            imageUrl: topArtistPeak.artistImageUrl ?? null,
          }
        : null,
      peakMonthHours,
      peakMonthLabel,
    },
    algoReasons,
    affinityScore,
    affinityLabel,
    moodReconstruction: {
      hourHeat,
      peakHourLabel,
      monthTrend,
      repeatCurve,
      maxRepeatsInOneDay,
    },
    related,
    dailyRitual: {
      streakDays,
      totalRediscovered: candidates.length,
      avgAffinityScore: avgAffinity,
      savedToLibrary: 0, // requires a separate user-saves table
    },
  });
}
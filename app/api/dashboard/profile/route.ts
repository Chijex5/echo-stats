import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import mongoose from "mongoose";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/db";
import StreamEntry from "@/lib/models/StreamEntry";
import User from "@/lib/models/User";
import { analyzeUserMusic } from "@/lib/musicAnalysis";
import UserImport from "@/lib/models/UserImport";

function formatMonthYear(date: Date | null | undefined) {
  if (!date) return "Unknown";
  return new Intl.DateTimeFormat("en", { month: "short", year: "numeric" }).format(date);
}

function seasonForMonth(month: number) {
  if (month === 11 || month <= 1) return "Winter";
  if (month >= 2 && month <= 4) return "Spring";
  if (month >= 5 && month <= 7) return "Summer";
  return "Autumn";
}

function hourLabel(hour: number | null | undefined) {
  if (hour === null || hour === undefined) return "Unknown";
  const suffix = hour >= 12 ? "PM" : "AM";
  const h = hour % 12 || 12;
  return `${h}:00 ${suffix}`;
}

function yearsBetween(first: Date | null | undefined, last: Date | null | undefined) {
  if (!first || !last) return 0;
  const diff = last.getTime() - first.getTime();
  return Math.max(1, Math.ceil(diff / (365 * 24 * 60 * 60 * 1000)));
}

function listeningPersonality(nightPct: number, topHour: number | null, uniqueArtists: number) {
  if (nightPct >= 45) return "Midnight Archivist";
  if (topHour !== null && topHour >= 6 && topHour <= 11) return "Morning Curator";
  if (uniqueArtists >= 500) return "Restless Explorer";
  return "Memory Collector";
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const userId = new mongoose.Types.ObjectId(session.user.id);
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);


  const [
    user,
    userImport,
    totals,
    dailyPlays,
    hourBuckets,
    seasonBuckets,
    topAlbums,
    topArtists,
    topTrackThisYear,
    firstImportedSong,
    firstSyncedSong,
    oldestFavoriteTrack,
    longestObsession,
    currentTopArtist,
    previousTopArtist,
    lastSync,
  ] = await Promise.all([
    User.findById(userId).select("displayName email avatarUrl spotifyProduct favoriteGenres createdAt"),
    UserImport.findOne({ userId }).sort({ createdAt: -1 }).lean(),
    StreamEntry.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: null,
          totalPlays: { $sum: 1 },
          totalMsPlayed: { $sum: "$msPlayed" },
          uniqueTracks: { $addToSet: "$spotifyTrackUri" },
          uniqueArtists: { $addToSet: "$artistName" },
          uniqueAlbums: { $addToSet: "$albumName" },
          firstPlay: { $min: "$ts" },
          lastPlay: { $max: "$ts" },
        },
      },
      {
        $project: {
          totalPlays: 1,
          totalMsPlayed: 1,
          uniqueTrackCount: { $size: "$uniqueTracks" },
          uniqueArtistCount: { $size: "$uniqueArtists" },
          uniqueAlbumCount: { $size: "$uniqueAlbums" },
          firstPlay: 1,
          lastPlay: 1,
        },
      },
    ]),
    StreamEntry.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$ts" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: -1 } },
      { $limit: 365 },
    ]),
    StreamEntry.aggregate<{ _id: number; count: number }>([
      { $match: { userId } },
      { $group: { _id: { $hour: "$ts" }, count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
    StreamEntry.aggregate<{ _id: number; count: number }>([
      { $match: { userId } },
      { $group: { _id: { $month: "$ts" }, count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
    StreamEntry.aggregate<{ _id: string; plays: number; artistName: string }>([
      { $match: { userId, albumName: { $exists: true, $ne: "" } } },
      {
        $group: {
          _id: "$albumName",
          plays: { $sum: 1 },
          artistName: { $first: "$artistName" },
        },
      },
      { $sort: { plays: -1 } },
      { $limit: 6 },
    ]),
    StreamEntry.aggregate<{ _id: string; plays: number }>([
      { $match: { userId } },
      { $group: { _id: "$artistName", plays: { $sum: 1 } } },
      { $sort: { plays: -1 } },
      { $limit: 1 },
    ]),
    StreamEntry.aggregate<{ _id: string; trackName: string; artistName: string; plays: number }>([
      { $match: { userId, ts: { $gte: new Date(now.getFullYear(), 0, 1) } } },
      {
        $group: {
          _id: "$spotifyTrackUri",
          trackName: { $first: "$trackName" },
          artistName: { $first: "$artistName" },
          plays: { $sum: 1 },
        },
      },
      { $sort: { plays: -1 } },
      { $limit: 1 },
    ]),
    StreamEntry.findOne({ userId }).sort({ ts: 1 }).select("trackName artistName ts").lean(),
    StreamEntry.findOne({ userId, platform: "spotify-live-sync" })
      .sort({ ts: 1 })
      .select("trackName artistName ts")
      .lean(),
    StreamEntry.aggregate<{ trackName: string; artistName: string; firstPlayed: Date; plays: number }>([
      { $match: { userId } },
      {
        $group: {
          _id: "$spotifyTrackUri",
          trackName: { $first: "$trackName" },
          artistName: { $first: "$artistName" },
          firstPlayed: { $min: "$ts" },
          plays: { $sum: 1 },
        },
      },
      { $sort: { firstPlayed: 1, plays: -1 } },
      { $limit: 1 },
    ]),
    StreamEntry.aggregate<{ trackName: string; artistName: string; plays: number }>([
      { $match: { userId } },
      {
        $group: {
          _id: "$spotifyTrackUri",
          trackName: { $first: "$trackName" },
          artistName: { $first: "$artistName" },
          plays: { $sum: 1 },
        },
      },
      { $sort: { plays: -1 } },
      { $limit: 1 },
    ]),
    StreamEntry.aggregate<{ _id: string; plays: number }>([
      { $match: { userId, ts: { $gte: thirtyDaysAgo } } },
      { $group: { _id: "$artistName", plays: { $sum: 1 } } },
      { $sort: { plays: -1 } },
      { $limit: 1 },
    ]),
    StreamEntry.aggregate<{ _id: string; plays: number }>([
      { $match: { userId, ts: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo } } },
      { $group: { _id: "$artistName", plays: { $sum: 1 } } },
      { $sort: { plays: -1 } },
      { $limit: 1 },
    ]),
    StreamEntry.findOne({ userId, platform: "spotify-live-sync" }).sort({ ts: -1 }).select("ts").lean(),
  ]);

  const data = totals[0] ?? {};
  const totalPlays = data.totalPlays ?? 0;
  const uniqueArtistCount = data.uniqueArtistCount ?? 0;
  const totalHours = Math.round((data.totalMsPlayed ?? 0) / 3_600_000);
  const firstPlay = data.firstPlay ?? null;
  const lastPlay = data.lastPlay ?? null;

  const playDays = new Set(dailyPlays.map((d: { _id: string }) => d._id));
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 0; i < 365; i++) {
    const day = new Date(today);
    day.setDate(day.getDate() - i);
    const key = day.toISOString().split("T")[0];
    if (playDays.has(key)) streak++;
    else if (i > 0) break;
  }

  const totalHourPlays = hourBuckets.reduce((sum, bucket) => sum + bucket.count, 0);
  const nightPlays = hourBuckets
    .filter((bucket) => bucket._id >= 22 || bucket._id <= 4)
    .reduce((sum, bucket) => sum + bucket.count, 0);
  const topHour = hourBuckets[0]?._id ?? null;
  const nightPct = totalHourPlays ? Math.round((nightPlays / totalHourPlays) * 100) : 0;

  const seasonTotals = new Map<string, number>();
  for (const bucket of seasonBuckets) {
    const season = seasonForMonth(bucket._id - 1);
    seasonTotals.set(season, (seasonTotals.get(season) ?? 0) + bucket.count);
  }
  const topSeason = [...seasonTotals.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "Unknown";

  const favoriteGenres =
    user?.favoriteGenres?.length
      ? user.favoriteGenres
      : Array.isArray(userImport?.favoriteGenres)
        ? userImport.favoriteGenres
        : [];
  const favoriteGenre = favoriteGenres[0] ?? "Still emerging";

  return NextResponse.json({
    user: {
      name: user?.displayName ?? session.user.name ?? "EchoStats Listener",
      email: user?.email ?? session.user.email ?? "",
      avatarUrl: user?.avatarUrl ?? session.user.image ?? null,
      spotifyProduct: user?.spotifyProduct ?? "connected",
      connectedAt: user?.createdAt ?? null,
      accountAge: formatMonthYear(user?.createdAt),
    },
    summary: {
      totalSongsAnalyzed: data.uniqueTrackCount ?? 0,
      yearsImported: yearsBetween(firstPlay, lastPlay),
      totalArtistsDiscovered: uniqueArtistCount,
      favoriteGenre,
      listeningStreak: streak,
      connectedDate: formatMonthYear(user?.createdAt),
      totalHoursListened: totalHours,
      totalPlays,
    },
    identity: {
      listeningPersonality: listeningPersonality(nightPct, topHour, uniqueArtistCount),
      musicAge: firstPlay ? `Since ${formatMonthYear(firstPlay)}` : "Still forming",
      favoriteDecade: "Imported archive",
      hiddenGenre: favoriteGenres[1] ?? favoriteGenre,
      topListeningHour: hourLabel(topHour),
      topListeningSeason: topSeason,
    },
    milestones: {
      firstImportedSong,
      firstSyncedSong,
      oldestFavoriteTrack: oldestFavoriteTrack[0] ?? null,
      longestObsession: longestObsession[0] ?? null,
      latestGenreShift: {
        from: previousTopArtist[0]?._id ?? null,
        to: currentTopArtist[0]?._id ?? null,
      },
    },
    services: {
      spotifyConnected: Boolean(user?.spotifyId ?? session.user.spotifyId),
      lastSync: lastSync?.ts ?? lastPlay,
      syncHealth: lastSync ? "Healthy" : "Archive only",
      archiveImported: Boolean(userImport?.spotifyImported ?? totalPlays > 0),
      storageUsed: `${Math.max(1, Math.round((totalPlays * 1.2) / 1024))} MB`,
    },
    highlights: {
      topAlbums,
      mostPlayedArtist: topArtists[0] ?? null,
      favoriteSongThisYear: topTrackThisYear[0] ?? null,
      forgottenFavoriteCount: Math.max(0, Math.round((data.uniqueTrackCount ?? 0) * 0.08)),
    },
  });
}

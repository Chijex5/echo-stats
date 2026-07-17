import mongoose from "mongoose";
import StreamEntry from "@/lib/models/StreamEntry";
import User from "@/lib/models/User";

export interface MusicAIContext {
  profile: {
    displayName: string;
    favoriteGenres: string[];
    bio: string;
  };
  stats: {
    totalPlays: number;
    totalHours: number;
    uniqueTrackCount: number;
    uniqueArtistCount: number;
    firstPlay: Date | null;
    lastPlay: Date | null;
    nightPct: number;
  };
  topTracks: Array<{
    trackName: string;
    artistName: string;
    playCount: number;
    lastPlayed: Date;
  }>;
  topArtists: Array<{ name: string; plays: number }>;
  recentTracks: Array<{ trackName: string; artistName: string; ts: Date }>;
  listeningPatterns: {
    topHours: Array<{ hour: number; plays: number }>;
    topWeekdays: Array<{ weekday: string; plays: number }>;
    skippedRate: number;
    platformBreakdown: Array<{ platform: string; plays: number }>;
  };
}

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export async function buildMusicContext(userId: string): Promise<MusicAIContext> {
  const userObjectId = new mongoose.Types.ObjectId(userId);

  const [user, totals, topTracks, topArtists, recentTracks, hours, weekdays, skipStats, platforms] = await Promise.all([
    User.findById(userObjectId).select("displayName favoriteGenres bio").lean(),
    StreamEntry.aggregate([
      { $match: { userId: userObjectId } },
      {
        $group: {
          _id: null,
          totalPlays: { $sum: 1 },
          totalMsPlayed: { $sum: "$msPlayed" },
          uniqueTracks: { $addToSet: "$spotifyTrackUri" },
          uniqueArtists: { $addToSet: "$artistName" },
          firstPlay: { $min: "$ts" },
          lastPlay: { $max: "$ts" },
          nightPlays: {
            $sum: {
              $cond: [
                { $or: [{ $gte: [{ $hour: "$ts" }, 22] }, { $lte: [{ $hour: "$ts" }, 4] }] },
                1,
                0,
              ],
            },
          },
        },
      },
      {
        $project: {
          totalPlays: 1,
          totalMsPlayed: 1,
          uniqueTrackCount: { $size: "$uniqueTracks" },
          uniqueArtistCount: { $size: "$uniqueArtists" },
          firstPlay: 1,
          lastPlay: 1,
          nightPlays: 1,
        },
      },
    ]),
    StreamEntry.aggregate([
      { $match: { userId: userObjectId } },
      { $group: { _id: "$spotifyTrackUri", trackName: { $first: "$trackName" }, artistName: { $first: "$artistName" }, playCount: { $sum: 1 }, lastPlayed: { $max: "$ts" } } },
      { $sort: { playCount: -1, lastPlayed: -1 } },
      { $limit: 12 },
      { $project: { _id: 0, trackName: 1, artistName: 1, playCount: 1, lastPlayed: 1 } },
    ]),
    StreamEntry.aggregate([
      { $match: { userId: userObjectId } },
      { $group: { _id: "$artistName", plays: { $sum: 1 } } },
      { $sort: { plays: -1 } },
      { $limit: 12 },
      { $project: { _id: 0, name: "$_id", plays: 1 } },
    ]),
    StreamEntry.find({ userId: userObjectId }).sort({ ts: -1 }).limit(15).select("trackName artistName ts -_id").lean(),
    StreamEntry.aggregate([
      { $match: { userId: userObjectId } },
      { $group: { _id: { $hour: "$ts" }, plays: { $sum: 1 } } },
      { $sort: { plays: -1 } },
      { $limit: 5 },
      { $project: { _id: 0, hour: "$_id", plays: 1 } },
    ]),
    StreamEntry.aggregate([
      { $match: { userId: userObjectId } },
      { $group: { _id: { $dayOfWeek: "$ts" }, plays: { $sum: 1 } } },
      { $sort: { plays: -1 } },
      { $limit: 5 },
    ]),
    StreamEntry.aggregate([
      { $match: { userId: userObjectId } },
      { $group: { _id: null, total: { $sum: 1 }, skipped: { $sum: { $cond: ["$skipped", 1, 0] } } } },
    ]),
    StreamEntry.aggregate([
      { $match: { userId: userObjectId, platform: { $nin: [null, ""] } } },
      { $group: { _id: "$platform", plays: { $sum: 1 } } },
      { $sort: { plays: -1 } },
      { $limit: 6 },
      { $project: { _id: 0, platform: "$_id", plays: 1 } },
    ]),
  ]);

  const total = totals[0];
  const skipped = skipStats[0];

  return {
    profile: {
      displayName: user?.displayName ?? "Listener",
      favoriteGenres: user?.favoriteGenres ?? [],
      bio: user?.bio ?? "",
    },
    stats: {
      totalPlays: total?.totalPlays ?? 0,
      totalHours: Math.round((total?.totalMsPlayed ?? 0) / 3_600_000),
      uniqueTrackCount: total?.uniqueTrackCount ?? 0,
      uniqueArtistCount: total?.uniqueArtistCount ?? 0,
      firstPlay: total?.firstPlay ?? null,
      lastPlay: total?.lastPlay ?? null,
      nightPct: total?.totalPlays ? Math.round((total.nightPlays / total.totalPlays) * 100) : 0,
    },
    topTracks,
    topArtists,
    recentTracks: recentTracks.map((track) => ({ trackName: track.trackName, artistName: track.artistName, ts: track.ts })),
    listeningPatterns: {
      topHours: hours,
      topWeekdays: weekdays.map((day) => ({ weekday: WEEKDAYS[(day._id - 1) % 7], plays: day.plays })),
      skippedRate: skipped?.total ? Math.round((skipped.skipped / skipped.total) * 100) : 0,
      platformBreakdown: platforms,
    },
  };
}

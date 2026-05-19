import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import mongoose from "mongoose";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/db";
import StreamEntry from "@/lib/models/StreamEntry";

function parseDate(raw: string | null, fallback: Date) {
  if (!raw) return fallback;
  const dt = new Date(raw);
  return Number.isNaN(dt.getTime()) ? fallback : dt;
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = req.nextUrl.searchParams;
  const now = new Date();
  const defaultStart = new Date(now.getFullYear(), 0, 1);
  const from = parseDate(searchParams.get("from"), defaultStart);
  const to = parseDate(searchParams.get("to"), now);

  await connectDB();
  const userId = new mongoose.Types.ObjectId(session.user.id);
  const rangeMatch = { userId, ts: { $gte: from, $lte: to } };

  const [topTrack, topArtist, decadeData, monthData, hiddenGem, daypartData, forgottenFavorite, totals] = await Promise.all([
    StreamEntry.aggregate<{ _id: string; artistName: string; plays: number }>([
      { $match: rangeMatch },
      { $group: { _id: "$trackName", artistName: { $first: "$artistName" }, plays: { $sum: 1 } } },
      { $sort: { plays: -1 } },
      { $limit: 1 },
    ]),
    StreamEntry.aggregate<{ _id: string; plays: number }>([
      { $match: rangeMatch },
      { $group: { _id: "$artistName", plays: { $sum: 1 } } },
      { $sort: { plays: -1 } },
      { $limit: 1 },
    ]),
    StreamEntry.aggregate<{ _id: number; count: number }>([
      { $match: { ...rangeMatch, releaseYear: { $type: "number" } } },
      { $project: { decade: { $multiply: [{ $floor: { $divide: ["$releaseYear", 10] } }, 10] } } },
      { $group: { _id: "$decade", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 },
    ]),
    StreamEntry.aggregate<{ _id: number; plays: number }>([
      { $match: rangeMatch },
      { $group: { _id: { $month: "$ts" }, plays: { $sum: 1 } } },
      { $sort: { plays: -1 } },
      { $limit: 1 },
    ]),
    StreamEntry.aggregate<{ trackName: string; artistName: string; plays: number }>([
      { $match: rangeMatch },
      { $group: { _id: { trackName: "$trackName", artistName: "$artistName" }, plays: { $sum: 1 } } },
      { $match: { plays: { $gte: 2, $lte: 4 } } },
      { $sort: { plays: -1 } },
      { $limit: 1 },
      { $project: { _id: 0, trackName: "$_id.trackName", artistName: "$_id.artistName", plays: 1 } },
    ]),

    StreamEntry.aggregate<{ _id: string; plays: number }>([
      { $match: rangeMatch },
      { $project: { hour: { $hour: "$ts" } } },
      {
        $project: {
          daypart: {
            $switch: {
              branches: [
                { case: { $and: [{ $gte: ["$hour", 6] }, { $lt: ["$hour", 12] }] }, then: "Morning" },
                { case: { $and: [{ $gte: ["$hour", 12] }, { $lt: ["$hour", 18] }] }, then: "Afternoon" },
                { case: { $and: [{ $gte: ["$hour", 18] }, { $lt: ["$hour", 23] }] }, then: "Evening" },
              ],
              default: "Late Night",
            },
          },
        },
      },
      { $group: { _id: "$daypart", plays: { $sum: 1 } } },
      { $sort: { plays: -1 } },
    ]),
    StreamEntry.aggregate<{ trackName: string; artistName: string; gapDays: number }>([
      { $match: rangeMatch },
      { $sort: { ts: 1 } },
      {
        $group: {
          _id: { trackName: "$trackName", artistName: "$artistName" },
          plays: { $sum: 1 },
          firstPlayed: { $first: "$ts" },
          lastPlayed: { $last: "$ts" },
        },
      },
      { $match: { plays: { $gte: 3 } } },
      { $project: { _id: 0, trackName: "$_id.trackName", artistName: "$_id.artistName", gapDays: { $divide: [{ $subtract: ["$lastPlayed", "$firstPlayed"] }, 1000 * 60 * 60 * 24] } } },
      { $sort: { gapDays: -1 } },
      { $limit: 1 },
    ]),
    StreamEntry.aggregate<{ _id: null; totalPlays: number; uniqueArtists: number; lateNightPlays: number }>([
      { $match: rangeMatch },
      {
        $group: {
          _id: null,
          totalPlays: { $sum: 1 },
          uniqueArtists: { $addToSet: "$artistName" },
          lateNightPlays: {
            $sum: {
              $cond: [
                { $or: [{ $lt: [{ $hour: "$ts" }, 6] }, { $gte: [{ $hour: "$ts" }, 23] }] },
                1,
                0,
              ],
            },
          },
        },
      },
      { $project: { totalPlays: 1, lateNightPlays: 1, uniqueArtists: { $size: "$uniqueArtists" } } },
    ]),

  ]);

  const favoriteEra = daypartData[0]?._id ?? "Unknown";
  const forgotten = forgottenFavorite[0];
  const total = totals[0];
  const lateNightRatio = total?.totalPlays ? total.lateNightPlays / total.totalPlays : 0;
  const artistDensity = total?.totalPlays ? total.uniqueArtists / total.totalPlays : 0;
  const personalityTitle = lateNightRatio > 0.35 ? "The Night Explorer" : artistDensity > 0.4 ? "The Curious Crate Digger" : "The Comfort Collector";
  const personalitySubtitle = lateNightRatio > 0.35
    ? "You come alive after dark, with most plays landing late-night."
    : artistDensity > 0.4
      ? "You rotate artists often and keep discovering fresh sounds."
      : "You know exactly what you love and revisit it with intention.";

  return NextResponse.json({
    from: from.toISOString(),
    to: to.toISOString(),
    topSong: {
      title: topTrack[0]?._id ?? "No track yet",
      subtitle: topTrack[0] ? `${topTrack[0].artistName} · ${topTrack[0].plays} plays` : "Play more music to unlock this slide",
    },
    topArtist: {
      title: topArtist[0]?._id ?? "No artist yet",
      subtitle: topArtist[0] ? `${topArtist[0].plays} total plays` : "Play more music to unlock this slide",
    },
    musicAge: {
      year: decadeData[0]?._id ? `${decadeData[0]._id}s` : "Unknown",
      subtitle: "Your listening center of gravity",
    },
    emotionalMonth: {
      month: monthData[0]?._id ?? null,
      subtitle: monthData[0] ? `Peak activity month with ${monthData[0].plays} plays` : "Not enough data in selected range",
    },
    hiddenGem: hiddenGem[0] ?? null,
    favoriteEra: {
      title: favoriteEra,
      subtitle: daypartData[0] ? `${daypartData[0].plays} plays in your strongest listening window` : "Not enough plays in selected range",
    },
    forgottenFavorite: forgotten
      ? {
          title: forgotten.trackName,
          subtitle: `${forgotten.artistName} · resurfaced after ${Math.round(forgotten.gapDays)} days`,
        }
      : { title: "No rediscovery yet", subtitle: "Keep listening to unlock long-gap rediscoveries" },
    personality: {
      title: personalityTitle,
      subtitle: personalitySubtitle,
    },
  });
}

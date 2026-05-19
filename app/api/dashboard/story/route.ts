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

  const [topTrack, topArtist, decadeData, monthData, hiddenGem] = await Promise.all([
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
  ]);

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
  });
}

import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { getSessionUserId } from "@/lib/get-session-user-id";
import { connectDB } from "@/lib/db";
import StreamEntry from "@/lib/models/StreamEntry";

function dateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function decadeLabel(decade: number) {
  return `${String(decade).slice(2)}s`;
}

export async function GET(req: NextRequest) {
  const userId = await getSessionUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const userObjectId = new mongoose.Types.ObjectId(userId);
  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
  thirtyDaysAgo.setHours(0, 0, 0, 0);

  const [streamAgg, artistAgg, moodAgg, decadeAgg] = await Promise.all([
    StreamEntry.aggregate<{ _id: string; value: number }>([
      { $match: { userId: userObjectId, ts: { $gte: thirtyDaysAgo } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$ts" } }, value: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
    StreamEntry.aggregate<{ _id: string; value: number }>([
      { $match: { userId: userObjectId, ts: { $gte: thirtyDaysAgo } } },
      { $group: { _id: "$artistName", value: { $sum: 1 } } },
      { $sort: { value: -1 } },
      { $limit: 4 },
    ]),
    StreamEntry.aggregate<{
      _id: number;
      count: number;
      calm: number;
      energetic: number;
      sad: number;
      happy: number;
    }>([
      { $match: { userId: userObjectId, ts: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: {
            $floor: {
              $divide: [{ $subtract: ["$ts", thirtyDaysAgo] }, 3 * 24 * 60 * 60 * 1000],
            },
          },
          count: { $sum: 1 },
          calm: { $sum: { $cond: [{ $and: [{ $gte: [{ $hour: "$ts" }, 6] }, { $lte: [{ $hour: "$ts" }, 11] }] }, 1, 0] } },
          energetic: { $sum: { $cond: [{ $and: [{ $gte: [{ $hour: "$ts" }, 18] }, { $lte: [{ $hour: "$ts" }, 21] }] }, 1, 0] } },
          sad: { $sum: { $cond: [{ $and: [{ $gte: [{ $hour: "$ts" }, 12] }, { $lte: [{ $hour: "$ts" }, 17] }] }, 1, 0] } },
          happy: { $sum: { $cond: [{ $or: [{ $gte: [{ $hour: "$ts" }, 22] }, { $lte: [{ $hour: "$ts" }, 5] }] }, 1, 0] } },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    StreamEntry.aggregate<{ _id: number; value: number }>([
      { $match: { userId: userObjectId, releaseYear: { $exists: true, $ne: null } } },
      { $group: { _id: { $multiply: [{ $floor: { $divide: ["$releaseYear", 10] } }, 10] }, value: { $sum: 1 } } },
    ]),
  ]);

  const streamMap = new Map(streamAgg.map((day) => [day._id, day.value]));
  const streamData = Array.from({ length: 30 }, (_, index) => {
    const day = new Date(thirtyDaysAgo);
    day.setDate(thirtyDaysAgo.getDate() + index);
    return { date: dateKey(day), value: streamMap.get(dateKey(day)) ?? 0 };
  });

  const moodMap = new Map(moodAgg.map((bucket) => [bucket._id, bucket]));
  const moodData = Array.from({ length: 10 }, (_, index) => {
    const bucket = moodMap.get(index);
    const total = Math.max(bucket?.count ?? 0, 1);
    return {
      happy: Math.round(((bucket?.happy ?? 0) / total) * 100),
      sad: Math.round(((bucket?.sad ?? 0) / total) * 100),
      energetic: Math.round(((bucket?.energetic ?? 0) / total) * 100),
      calm: Math.round(((bucket?.calm ?? 0) / total) * 100),
    };
  });

  const decadeMap = new Map(decadeAgg.map((item) => [item._id, item.value]));
  const decades = [1970, 1980, 1990, 2000, 2010, 2020];
  const maxDecade = Math.max(...decades.map((decade) => decadeMap.get(decade) ?? 0), 1);

  return NextResponse.json({
    streamData,
    genreData: artistAgg.map((artist) => ({ name: artist._id, value: artist.value })),
    genreCount: artistAgg.length,
    moodData,
    yearData: decades.map((decade) => ({
      year: decadeLabel(decade),
      value: Math.round(((decadeMap.get(decade) ?? 0) / maxDecade) * 100),
    })),
  });
}

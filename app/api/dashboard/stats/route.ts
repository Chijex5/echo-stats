import { NextRequest, NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/get-session-user-id";
import { connectDB } from "@/lib/db";
import StreamEntry from "@/lib/models/StreamEntry";
import mongoose from "mongoose";

export async function GET(req: NextRequest) {
  const userId = await getSessionUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const userObjectId = new mongoose.Types.ObjectId(userId);

  const [totals, dailyPlays] = await Promise.all([
    // Overall totals
    StreamEntry.aggregate([
      { $match: { userId: userObjectId } },
      {
        $group: {
          _id: null,
          totalPlays:    { $sum: 1 },
          totalMsPlayed: { $sum: "$msPlayed" },
          uniqueTracks:  { $addToSet: "$spotifyTrackUri" },
          uniqueArtists: { $addToSet: "$artistName" },
          firstPlay:     { $min: "$ts" },
          lastPlay:      { $max: "$ts" },
        },
      },
      {
        $project: {
          totalPlays: 1,
          totalMsPlayed: 1,
          uniqueTrackCount:  { $size: "$uniqueTracks" },
          uniqueArtistCount: { $size: "$uniqueArtists" },
          firstPlay: 1,
          lastPlay: 1,
        },
      },
    ]),

    // Daily play counts for streak calculation
    StreamEntry.aggregate([
      { $match: { userId: userObjectId } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$ts" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: -1 } },
      { $limit: 365 },
    ]),
  ]);

  // Calculate current streak
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const playDays = new Set(dailyPlays.map((d: { _id: string; count: number }) => d._id));

  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split("T")[0];
    if (playDays.has(key)) {
      streak++;
    } else if (i > 0) {
      break; // gap found
    }
  }

  // Night listening % (22:00 – 05:00)
  const [nightStats] = await StreamEntry.aggregate([
    { $match: { userId: userObjectId } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        nightPlays: {
          $sum: {
            $cond: [
              {
                $or: [
                  { $gte: [{ $hour: "$ts" }, 22] },
                  { $lte: [{ $hour: "$ts" }, 4] },
                ],
              },
              1,
              0,
            ],
          },
        },
      },
    },
  ]);

  const nightPct = nightStats
    ? Math.round((nightStats.nightPlays / nightStats.total) * 100)
    : 0;

  const data = totals[0] ?? {};

  return NextResponse.json({
    totalPlays:        data.totalPlays        ?? 0,
    totalHours:        Math.round((data.totalMsPlayed ?? 0) / 3_600_000),
    uniqueTrackCount:  data.uniqueTrackCount  ?? 0,
    uniqueArtistCount: data.uniqueArtistCount ?? 0,
    firstPlay:         data.firstPlay         ?? null,
    streak,
    nightPct,
  });
}
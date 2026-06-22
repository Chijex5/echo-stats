import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { getSessionUserId } from "@/lib/get-session-user-id";
import { connectDB } from "@/lib/db";
import StreamEntry from "@/lib/models/StreamEntry";

const GRADIENTS = [
  "from-red-500 to-orange-500",
  "from-blue-500 to-purple-500",
  "from-emerald-400 to-cyan-500",
  "from-pink-500 to-rose-400",
  "from-violet-500 to-indigo-500",
  "from-yellow-400 to-amber-500",
];

function dateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function monthLabel(date: Date) {
  return new Intl.DateTimeFormat("en", { month: "short", year: "numeric" }).format(date);
}

export async function GET(req: NextRequest) {
  const userId = await getSessionUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const userObjectId = new mongoose.Types.ObjectId(userId);

  const now = new Date();
  const heatmapStart = new Date(now);
  heatmapStart.setDate(heatmapStart.getDate() - 363);
  heatmapStart.setHours(0, 0, 0, 0);

  const snapshotStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const snapshotEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const [bounds, dailyAgg, snapshotTracks, snapshotArtist] = await Promise.all([
    StreamEntry.aggregate<{ _id: null; firstPlay: Date; lastPlay: Date }>([
      { $match: { userId: userObjectId } },
      { $group: { _id: null, firstPlay: { $min: "$ts" }, lastPlay: { $max: "$ts" } } },
    ]),
    StreamEntry.aggregate<{ _id: string; plays: number }>([
      { $match: { userId: userObjectId, ts: { $gte: heatmapStart } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$ts" } },
          plays: { $sum: 1 },
        },
      },
    ]),
    StreamEntry.aggregate<{ _id: string; trackName: string; artistName: string; plays: number }>([
      { $match: { userId: userObjectId, ts: { $gte: snapshotStart, $lt: snapshotEnd } } },
      {
        $group: {
          _id: "$spotifyTrackUri",
          trackName: { $first: "$trackName" },
          artistName: { $first: "$artistName" },
          plays: { $sum: 1 },
        },
      },
      { $sort: { plays: -1 } },
      { $limit: 3 },
    ]),
    StreamEntry.aggregate<{ _id: string; plays: number }>([
      { $match: { userId: userObjectId, ts: { $gte: snapshotStart, $lt: snapshotEnd } } },
      { $group: { _id: "$artistName", plays: { $sum: 1 } } },
      { $sort: { plays: -1 } },
      { $limit: 1 },
    ]),
  ]);

  const dailyMap = new Map(dailyAgg.map((day) => [day._id, day.plays]));
  const cells = Array.from({ length: 364 }, (_, index) => {
    const day = new Date(heatmapStart);
    day.setDate(heatmapStart.getDate() + index);
    const key = dateKey(day);
    return { date: key, plays: dailyMap.get(key) ?? 0 };
  });

  const maxPlays = Math.max(...cells.map((cell) => cell.plays), 1);
  const firstPlay = bounds[0]?.firstPlay ?? null;
  const lastPlay = bounds[0]?.lastPlay ?? null;
  const firstYear = firstPlay?.getFullYear() ?? now.getFullYear();
  const lastYear = lastPlay?.getFullYear() ?? now.getFullYear();
  const yearLabels = Array.from(
    { length: Math.min(lastYear - firstYear + 1, 8) },
    (_, index) => String(firstYear + Math.round((index * Math.max(lastYear - firstYear, 0)) / Math.max(Math.min(lastYear - firstYear, 7), 1)))
  ).filter((year, index, arr) => arr.indexOf(year) === index);

  return NextResponse.json({
    yearLabels: yearLabels.length ? yearLabels : [String(now.getFullYear())],
    cells: cells.map((cell) => ({
      ...cell,
      intensity: Math.max(0.06, cell.plays / maxPlays),
    })),
    selectedRange: {
      label: firstPlay && lastPlay
        ? `${monthLabel(firstPlay)} - ${monthLabel(lastPlay)}`
        : "No listening history yet",
      days: firstPlay && lastPlay
        ? Math.max(1, Math.ceil((lastPlay.getTime() - firstPlay.getTime()) / 86_400_000))
        : 0,
    },
    snapshot: {
      label: monthLabel(snapshotStart),
      tracks: snapshotTracks.map((track) => ({
        title: track.trackName,
        artist: track.artistName,
        plays: track.plays,
      })),
      collage: Array.from({ length: 9 }, (_, index) => GRADIENTS[index % GRADIENTS.length]),
      topArtist: snapshotArtist[0]?._id ?? "Still emerging",
    },
  });
}

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import mongoose from "mongoose";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/db";
import StreamEntry from "@/lib/models/StreamEntry";

const GRADIENTS = [
  "from-emerald-400 to-cyan-500",
  "from-blue-500 to-violet-600",
  "from-pink-500 to-orange-400",
  "from-amber-400 to-orange-500",
  "from-purple-500 to-indigo-500",
  "from-green-500 to-emerald-400",
];

const ACCENTS = [
  "from-emerald-400/30 to-spotify/20",
  "from-blue-500/30 to-violet-600/20",
  "from-pink-500/30 to-orange-500/20",
  "from-amber-400/30 to-orange-500/20",
  "from-purple-500/30 to-indigo-500/20",
  "from-cyan-500/30 to-blue-500/20",
];

const MOODS = ["Reflective", "Warm", "Restless", "Bright", "Nostalgic", "Focused"];

function colorFor(seed: string, palette = GRADIENTS) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return palette[hash % palette.length];
}

function monthName(month: number) {
  return new Intl.DateTimeFormat("en", { month: "long" }).format(new Date(2024, month - 1, 1));
}

function monthShort(month: number, year: number) {
  return new Intl.DateTimeFormat("en", { month: "short", year: "numeric" }).format(new Date(year, month - 1, 1));
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const userId = new mongoose.Types.ObjectId(session.user.id);

  const [months, yearHours] = await Promise.all([
    StreamEntry.aggregate<{
      _id: { year: number; month: number };
      plays: number;
      totalMs: number;
      artists: string[];
      topArtist: string;
      tracks: Array<{ title: string; artist: string; plays: number }>;
    }>([
      { $match: { userId } },
      {
        $group: {
          _id: {
            year: { $year: "$ts" },
            month: { $month: "$ts" },
            uri: "$spotifyTrackUri",
          },
          trackName: { $first: "$trackName" },
          artistName: { $first: "$artistName" },
          plays: { $sum: 1 },
          totalMs: { $sum: "$msPlayed" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1, plays: -1 } },
      {
        $group: {
          _id: { year: "$_id.year", month: "$_id.month" },
          plays: { $sum: "$plays" },
          totalMs: { $sum: "$totalMs" },
          artists: { $addToSet: "$artistName" },
          topArtist: { $first: "$artistName" },
          tracks: {
            $push: {
              title: "$trackName",
              artist: "$artistName",
              plays: "$plays",
            },
          },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
      { $limit: 24 },
    ]),
    StreamEntry.aggregate<{ _id: { year: number; month: number }; v: number }>([
      { $match: { userId } },
      {
        $group: {
          _id: { year: { $year: "$ts" }, month: { $month: "$ts" } },
          v: { $sum: "$msPlayed" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]),
  ]);

  const periods = months.slice(-10).map((period, index) => {
    const { year, month } = period._id;
    const moodIndex = (month + year + index) % MOODS.length;
    return {
      id: `${year}-${String(month).padStart(2, "0")}`,
      label: monthShort(month, year),
      year,
      monthIdx: month - 1,
      monthName: monthName(month),
      topGenre: period.topArtist || "Still emerging",
      mood: MOODS[moodIndex],
      moodScore: Math.min(9.8, Math.max(5.2, 5 + period.plays / 35)),
      totalHours: Math.round(period.totalMs / 3_600_000),
      uniqueArtists: period.artists.length,
      topArtist: period.topArtist || "Unknown artist",
      topArtistColor: colorFor(period.topArtist || String(index)),
      accent: colorFor(`${year}-${month}`, ACCENTS),
      tracks: period.tracks.slice(0, 3).map((track) => ({
        title: track.title,
        artist: track.artist,
        color: colorFor(track.title),
      })),
      story: index === months.length - 1
        ? { tag: "Recent chapter", line: "This is where your listening has been gathering lately." }
        : undefined,
    };
  });

  return NextResponse.json({
    periods,
    yearLabels: [...new Set(months.map((month) => String(month._id.year)))],
    yearHours: yearHours.map((point) => ({ v: Math.round(point.v / 3_600_000) })),
    insights: [
      {
        label: "Peak month",
        title: periods.toSorted((a, b) => b.totalHours - a.totalHours)[0]?.label ?? "No data yet",
        sub: "Your highest listening month in the archive.",
        accent: "text-spotify",
      },
      {
        label: "Most artists",
        title: periods.toSorted((a, b) => b.uniqueArtists - a.uniqueArtists)[0]?.label ?? "No data yet",
        sub: "The month with the widest artist spread.",
        accent: "text-cyan-300",
      },
      {
        label: "Current sound",
        title: periods.at(-1)?.topArtist ?? "Still emerging",
        sub: "Your latest monthly top artist.",
        accent: "text-violet-300",
      },
    ],
  });
}

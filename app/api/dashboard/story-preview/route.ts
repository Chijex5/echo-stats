import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import mongoose from "mongoose";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/db";
import StreamEntry from "@/lib/models/StreamEntry";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const userId = new mongoose.Types.ObjectId(session.user.id);
  const now = new Date();
  const yearStart = new Date(now.getFullYear(), 0, 1);

  const [newArtists, monthlyBars] = await Promise.all([
    StreamEntry.aggregate<{ _id: string }>([
      { $match: { userId } },
      { $group: { _id: "$artistName", firstPlayed: { $min: "$ts" } } },
      { $match: { firstPlayed: { $gte: yearStart } } },
      { $count: "count" },
    ]),
    StreamEntry.aggregate<{ _id: number; plays: number }>([
      { $match: { userId, ts: { $gte: yearStart } } },
      { $group: { _id: { $month: "$ts" }, plays: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
  ]);

  const maxPlays = Math.max(...monthlyBars.map((bar) => bar.plays), 1);

  return NextResponse.json({
    slideCount: 12,
    newArtists: newArtists[0]?.count ?? 0,
    platformCopy: "Instagram & TikTok",
    bars: monthlyBars.map((bar) => ({
      month: bar._id,
      heightPct: Math.max(8, Math.round((bar.plays / maxPlays) * 100)),
    })),
  });
}

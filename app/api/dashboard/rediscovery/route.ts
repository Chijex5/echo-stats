import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { getSessionUserId } from "@/lib/get-session-user-id";
import { connectDB } from "@/lib/db";
import StreamEntry from "@/lib/models/StreamEntry";

const CARDS = [
  {
    key: "forgottenFavorites",
    title: "Forgotten Favorites",
    desc: "See all tracks",
    color: "from-peach-400 to-orange-400",
    shadow: "shadow-orange-500/20",
  },
  {
    key: "comebackSongs",
    title: "Comeback Songs",
    desc: "Returned to your rotation",
    color: "from-cyan-400 to-blue-500",
    shadow: "shadow-cyan-500/20",
  },
  {
    key: "suddenlyAbandoned",
    title: "Suddenly Abandoned",
    desc: "Used to be on repeat",
    color: "from-red-400 to-rose-500",
    shadow: "shadow-red-500/20",
  },
  {
    key: "returningRecently",
    title: "Returning Recently",
    desc: "Slowly creeping back",
    color: "from-yellow-400 to-amber-500",
    shadow: "shadow-yellow-500/20",
  },
] as const;

export async function GET(req: NextRequest) {
  const userId = await getSessionUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const userObjectId = new mongoose.Types.ObjectId(userId);
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 86_400_000);
  const ninetyDaysAgo = new Date(now.getTime() - 90 * 86_400_000);
  const oneEightyDaysAgo = new Date(now.getTime() - 180 * 86_400_000);

  const [forgotten, comeback, abandoned, returning] = await Promise.all([
    StreamEntry.aggregate<{ count: number }>([
      { $match: { userId: userObjectId } },
      { $group: { _id: "$spotifyTrackUri", plays: { $sum: 1 }, lastPlayed: { $max: "$ts" } } },
      { $match: { plays: { $gte: 5 }, lastPlayed: { $lt: ninetyDaysAgo } } },
      { $count: "count" },
    ]),
    StreamEntry.aggregate<{ count: number }>([
      { $match: { userId: userObjectId } },
      {
        $group: {
          _id: "$spotifyTrackUri",
          recent: { $sum: { $cond: [{ $gte: ["$ts", thirtyDaysAgo] }, 1, 0] } },
          older: { $sum: { $cond: [{ $lt: ["$ts", ninetyDaysAgo] }, 1, 0] } },
        },
      },
      { $match: { recent: { $gt: 0 }, older: { $gt: 0 } } },
      { $count: "count" },
    ]),
    StreamEntry.aggregate<{ count: number }>([
      { $match: { userId: userObjectId, ts: { $gte: oneEightyDaysAgo } } },
      {
        $group: {
          _id: "$spotifyTrackUri",
          recent: { $sum: { $cond: [{ $gte: ["$ts", thirtyDaysAgo] }, 1, 0] } },
          previous: { $sum: { $cond: [{ $and: [{ $gte: ["$ts", oneEightyDaysAgo] }, { $lt: ["$ts", thirtyDaysAgo] }] }, 1, 0] } },
        },
      },
      { $match: { recent: 0, previous: { $gte: 5 } } },
      { $count: "count" },
    ]),
    StreamEntry.aggregate<{ count: number }>([
      { $match: { userId: userObjectId, ts: { $gte: ninetyDaysAgo } } },
      {
        $group: {
          _id: "$spotifyTrackUri",
          recent: { $sum: { $cond: [{ $gte: ["$ts", thirtyDaysAgo] }, 1, 0] } },
          prior: { $sum: { $cond: [{ $and: [{ $gte: ["$ts", ninetyDaysAgo] }, { $lt: ["$ts", thirtyDaysAgo] }] }, 1, 0] } },
        },
      },
      { $match: { recent: { $gt: 0 }, prior: { $gt: 0 } } },
      { $count: "count" },
    ]),
  ]);

  const counts = {
    forgottenFavorites: forgotten[0]?.count ?? 0,
    comebackSongs: comeback[0]?.count ?? 0,
    suddenlyAbandoned: abandoned[0]?.count ?? 0,
    returningRecently: returning[0]?.count ?? 0,
  };

  return NextResponse.json({
    cards: CARDS.map((card) => ({
      ...card,
      count: counts[card.key],
    })),
  });
}

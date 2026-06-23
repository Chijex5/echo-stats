import { NextRequest, NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/get-session-user-id";
import { connectDB } from "@/lib/db";
import StreamEntry from "@/lib/models/StreamEntry";
import mongoose from "mongoose";

export async function GET(req: NextRequest) {
  const userId = await getSessionUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const limit = Number(new URL(req.url).searchParams.get("limit") ?? "10");
  await connectDB();
  const userObjectId = new mongoose.Types.ObjectId(userId);
  const tracks = await StreamEntry.find({ userId: userObjectId }).sort({ ts: -1 }).limit(limit).select({ trackName: 1, artistName: 1, albumImageUrl: 1, ts: 1, _id: 0 }).lean();
  return NextResponse.json({ tracks });
}

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/db";
import StreamEntry from "@/lib/models/StreamEntry";
import mongoose from "mongoose";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const limit = Number(new URL(req.url).searchParams.get("limit") ?? "10");
  await connectDB();
  const userId = new mongoose.Types.ObjectId(session.user.id);
  const tracks = await StreamEntry.find({ userId }).sort({ ts: -1 }).limit(limit).select({ trackName: 1, artistName: 1, albumImageUrl: 1, ts: 1, _id: 0 }).lean();
  return NextResponse.json({ tracks });
}

import { NextRequest, NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/get-session-user-id";
import { connectDB } from "@/lib/db";
import StreamEntry from "@/lib/models/StreamEntry";
import User from "@/lib/models/User";
import mongoose from "mongoose";

// How often we nudge users to upload a fresh Spotify export. Spotify's
// extended-history exports are point-in-time snapshots, so periodically
// re-uploading is the only way to backfill plays the API sync missed.
const RESYNC_INTERVAL_DAYS = 30;

// ─── GET /api/user/import-status ─────────────────────────────────────────────
// Powers the re-sync entry points (web sidebar, mobile profile) and the
// mobile monthly reminder: when the user last imported, how much data they
// have, and whether a fresh export is due.

export async function GET(req: NextRequest) {
  const userId = await getSessionUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const userObjectId = new mongoose.Types.ObjectId(userId);

  const [user, totalEntries, latestEntry] = await Promise.all([
    User.findById(userId).select("lastImportAt").lean(),
    StreamEntry.countDocuments({ userId: userObjectId }),
    StreamEntry.findOne({ userId: userObjectId }).sort({ ts: -1 }).select("ts").lean(),
  ]);

  const lastImportAt = user?.lastImportAt ?? null;
  const daysSinceLastImport = lastImportAt
    ? Math.floor((Date.now() - lastImportAt.getTime()) / 86_400_000)
    : null;

  return NextResponse.json({
    lastImportAt,
    daysSinceLastImport,
    totalEntries,
    latestEntryTs: latestEntry?.ts ?? null,
    resyncIntervalDays: RESYNC_INTERVAL_DAYS,
    dueForResync: daysSinceLastImport === null || daysSinceLastImport >= RESYNC_INTERVAL_DAYS,
  });
}

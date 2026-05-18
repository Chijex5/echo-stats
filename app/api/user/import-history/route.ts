import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/db";
import StreamEntry from "@/lib/models/StreamEntry";
import mongoose from "mongoose";
import { z } from "zod";

// ─── Validation ───────────────────────────────────────────────────────────────

// Raw shape coming from Spotify export
const RawEntrySchema = z.object({
  ts:                                 z.string(),
  platform:                           z.string().optional().nullable(),
  ms_played:                          z.number(),
  master_metadata_track_name:         z.string().nullable(),
  master_metadata_album_artist_name:  z.string().nullable(),
  master_metadata_album_album_name:   z.string().nullable(),
  spotify_track_uri:                  z.string().nullable(),
  reason_start:                       z.string().optional().nullable(),
  reason_end:                         z.string().optional().nullable(),
  shuffle:                            z.boolean().optional().nullable(),
  skipped:                            z.boolean().optional().nullable(),
  offline:                            z.boolean().optional().nullable(),
});

const BatchSchema = z.object({
  entries: z.array(RawEntrySchema).min(1).max(2000),
});

type RawEntry = z.infer<typeof RawEntrySchema>;

// ─── Filter logic ─────────────────────────────────────────────────────────────

const MIN_MS_PLAYED = 10_000; // 10 seconds

function isValidPlay(entry: RawEntry): boolean {
  return (
    entry.ms_played >= MIN_MS_PLAYED &&           // actually listened
    entry.master_metadata_track_name !== null &&  // is a track (not episode/audiobook)
    entry.spotify_track_uri !== null              // has a valid URI
  );
}

function toDocument(entry: RawEntry, userId: mongoose.Types.ObjectId) {
  return {
    userId,
    ts:              new Date(entry.ts),
    platform:        entry.platform ?? "unknown",
    msPlayed:        entry.ms_played,
    trackName:       entry.master_metadata_track_name!,
    artistName:      entry.master_metadata_album_artist_name ?? "Unknown Artist",
    albumName:       entry.master_metadata_album_album_name  ?? "Unknown Album",
    spotifyTrackUri: entry.spotify_track_uri!,
    reasonStart:     entry.reason_start  ?? "",
    reasonEnd:       entry.reason_end    ?? "",
    shuffle:         entry.shuffle  ?? false,
    skipped:         entry.skipped  ?? false,
    offline:         entry.offline  ?? false,
  };
}

// ─── POST /api/user/import-history ───────────────────────────────────────────

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = BatchSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid batch", issues: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const userId = new mongoose.Types.ObjectId(session.user.id);
  const rawEntries = parsed.data.entries;

  // Filter out skips, accidental taps, episodes, audiobooks
  const valid = rawEntries.filter(isValidPlay);
  const docs   = valid.map((e) => toDocument(e, userId));

  await connectDB();

  // insertMany with ordered:false + skipDuplicates — previously imported
  // entries (same ts + uri + userId) are silently ignored thanks to the
  // unique compound index, so re-uploading the same file is safe.
  let inserted = 0;
  let duplicates = 0;

  if (docs.length > 0) {
    const result = await StreamEntry.insertMany(docs, {
      ordered: false,
      // Mongoose typings don't expose rawResult directly; cast it
    }).catch((err: unknown) => {
      // BulkWriteError: some docs inserted, some were duplicates
      if (
        typeof err === "object" &&
        err !== null &&
        ("code" in err || "name" in err || "result" in err) &&
        ((err as { code?: number }).code === 11000 ||
          (err as { name?: string }).name === "BulkWriteError")
      ) {
        inserted   = (err as { result?: { nInserted?: number } }).result?.nInserted  ?? 0;
        duplicates = docs.length - inserted;
        return null;
      }
      throw err; // real error — rethrow
    });

    if (result) {
      inserted   = result.length;
      duplicates = docs.length - inserted;
    }
  }

  return NextResponse.json({
    received:   rawEntries.length,
    filtered:   rawEntries.length - valid.length,   // below 10s / non-tracks
    inserted,
    duplicates,
  });
}
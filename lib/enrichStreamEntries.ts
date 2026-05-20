/**
 * enrichStreamEntries.ts
 *
 * Enriches StreamEntry documents with `genre` and `releaseYear` (+ precision/confidence)
 * by fetching from Spotify only when the data is missing.
 *
 * Strategy:
 *  1. Build a de-duplicated set of spotifyTrackURIs that still need enrichment.
 *  2. For each unique URI, check an in-memory cache first (populated as we go),
 *     so each track is fetched at most once per run.
 *  3. Fetch tracks in batches of 50 (Spotify's max) using /v1/tracks.
 *  4. For genres, collect unique artist IDs from those tracks and batch-fetch
 *     artists (50 at a time) via /v1/artists.
 *  5. Apply a token-bucket rate limiter: Spotify allows ~180 req/min on most
 *     endpoints; we cap at 150 req/min to stay safe.
 *  6. On 429, honour Retry-After and back off exponentially.
 *  7. Write results back with a single bulkWrite per batch.
 */

import mongoose from "mongoose";
import { connectDB } from "./db";
import StreamEntry, { IStreamEntry } from "./models/StreamEntry";
import { getValidSpotifyToken } from "./spotify-token";

// ─── Config ──────────────────────────────────────────────────────────────────

const MONGO_USER_ID = process.env.ENRICH_USER_ID!; // the user whose entries to enrich
const TRACK_BATCH   = 50;   // Spotify /v1/tracks max
const ARTIST_BATCH  = 50;   // Spotify /v1/artists max
const DB_WRITE_BATCH = 500; // bulkWrite chunk size

// Token bucket: max 150 requests/min → 1 token every 400 ms
const RATE_LIMIT_RPS        = 150 / 60;       // tokens per second
const RATE_LIMIT_INTERVAL_MS = Math.ceil(1000 / RATE_LIMIT_RPS); // ~400 ms
const MAX_RETRIES            = 5;

// ─── Token bucket ─────────────────────────────────────────────────────────────

let _lastRequestAt = 0;

async function rateLimit(): Promise<void> {
  const now  = Date.now();
  const wait = _lastRequestAt + RATE_LIMIT_INTERVAL_MS - now;
  if (wait > 0) await sleep(wait);
  _lastRequestAt = Date.now();
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

// ─── Spotify fetch with retry ─────────────────────────────────────────────────

async function spotifyFetch(
  url: string,
  token: string,
  retries = MAX_RETRIES
): Promise<any> {
  await rateLimit();

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (res.status === 429) {
    const retryAfter = Number(res.headers.get("Retry-After") ?? "2");
    const backoff    = retryAfter * 1000 + Math.random() * 500;
    console.warn(`[rate-limit] 429 — waiting ${backoff.toFixed(0)} ms`);
    await sleep(backoff);
    if (retries === 0) throw new Error("Exceeded retries after 429");
    return spotifyFetch(url, token, retries - 1);
  }

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Spotify ${res.status} for ${url}: ${body}`);
  }

  return res.json();
}

// ─── Spotify batch helpers ────────────────────────────────────────────────────

interface TrackInfo {
  releaseYear: number;
  releaseDatePrecision: "year" | "month" | "day";
  artistIds: string[];
}

async function fetchTracks(
  trackIds: string[],
  token: string
): Promise<Map<string, TrackInfo>> {
  const result = new Map<string, TrackInfo>();

  for (let i = 0; i < trackIds.length; i += TRACK_BATCH) {
    const chunk = trackIds.slice(i, i + TRACK_BATCH);
    const url   = `https://api.spotify.com/v1/tracks?ids=${chunk.join(",")}`;
    const data  = await spotifyFetch(url, token);

    for (const track of data.tracks ?? []) {
      if (!track) continue;
      const rawDate  = track.album?.release_date as string | undefined;
      const prec     = (track.album?.release_date_precision ?? "year") as
                         "year" | "month" | "day";
      const year     = rawDate ? parseInt(rawDate.split("-")[0], 10) : NaN;
      const artistIds: string[] = (track.artists ?? []).map((a: any) => a.id as string);

      if (!isNaN(year)) {
        result.set(track.id as string, { releaseYear: year, releaseDatePrecision: prec, artistIds });
      }
    }
  }

  return result;
}

async function fetchArtistGenres(
  artistIds: string[],
  token: string
): Promise<Map<string, string[]>> {
  const result = new Map<string, string[]>();
  const unique  = [...new Set(artistIds)];

  for (let i = 0; i < unique.length; i += ARTIST_BATCH) {
    const chunk = unique.slice(i, i + ARTIST_BATCH);
    const url   = `https://api.spotify.com/v1/artists?ids=${chunk.join(",")}`;
    const data  = await spotifyFetch(url, token);

    for (const artist of data.artists ?? []) {
      if (!artist) continue;
      result.set(artist.id as string, artist.genres as string[] ?? []);
    }
  }

  return result;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  await connectDB();

  const userId = new mongoose.Types.ObjectId(MONGO_USER_ID);
  const token  = await getValidSpotifyToken(MONGO_USER_ID);

  // ── 1. Find all entries that still need enrichment ──────────────────────────
  const needsEnrichment = await StreamEntry.find(
    {
      userId,
      $or: [
        { genre:       { $in: [null, undefined, ""] } },
        { releaseYear: { $in: [null, undefined]     } },
      ],
    },
    { spotifyTrackUri: 1 }   // projection: only fetch the URI field
  ).lean();

  if (needsEnrichment.length === 0) {
    console.log("Nothing to enrich.");
    process.exit(0);
  }

  // ── 2. Unique track IDs that need fetching ──────────────────────────────────
  type EnrichedPayload = {
    genre: string;
    releaseYear: number;
    releaseDatePrecision: "year" | "month" | "day";
    releaseYearConfidence: number;
  };

  const uriToTrackId = (uri: string): string => uri.split(":").pop()!;

  const uniqueTrackIds = [
    ...new Set(
      needsEnrichment
        .map((e) => e.spotifyTrackUri)
        .filter(Boolean)
        .map(uriToTrackId)
    ),
  ];

  console.log(
    `Enriching ${needsEnrichment.length} entries across ${uniqueTrackIds.length} unique tracks…`
  );

  // ── 3. Fetch all track metadata in batches ──────────────────────────────────
  const trackInfoMap = await fetchTracks(uniqueTrackIds, token);

  // ── 4. Collect all artist IDs and fetch genres ──────────────────────────────
  const allArtistIds = [...trackInfoMap.values()].flatMap((t) => t.artistIds);
  const artistGenreMap = await fetchArtistGenres(allArtistIds, token);

  // ── 5. Build final enriched map  trackId → payload ─────────────────────────
  const enrichedMap = new Map<string, EnrichedPayload>();

  for (const [trackId, info] of trackInfoMap) {
    const genres = info.artistIds.flatMap(
      (aid) => artistGenreMap.get(aid) ?? []
    );
    const genre = genres[0] ?? "unknown";

    const confidenceByPrecision: Record<string, number> = {
      day: 1.0, month: 0.9, year: 0.75,
    };

    enrichedMap.set(trackId, {
      genre,
      releaseYear: info.releaseYear,
      releaseDatePrecision: info.releaseDatePrecision,
      releaseYearConfidence: confidenceByPrecision[info.releaseDatePrecision] ?? 0.5,
    });
  }

  // ── 6. BulkWrite back to DB in chunks ──────────────────────────────────────
  const docs = needsEnrichment as (IStreamEntry & { _id: mongoose.Types.ObjectId })[];
  let updated = 0;
  let skipped = 0;

  for (let i = 0; i < docs.length; i += DB_WRITE_BATCH) {
    const chunk = docs.slice(i, i + DB_WRITE_BATCH);

    const ops = chunk
      .map((doc) => {
        const trackId = uriToTrackId(doc.spotifyTrackUri);
        const payload = enrichedMap.get(trackId);
        if (!payload) return null;

        return {
          updateOne: {
            filter: { _id: doc._id },
            update: {
              $set: {
                genre:                 payload.genre,
                releaseYear:           payload.releaseYear,
                releaseDatePrecision:  payload.releaseDatePrecision,
                releaseYearConfidence: payload.releaseYearConfidence,
              },
            },
          },
        };
      })
      .filter(Boolean) as mongoose.mongo.AnyBulkWriteOperation<IStreamEntry>[];

    skipped += chunk.length - ops.length;

    if (ops.length > 0) {
      const result = await StreamEntry.bulkWrite(
        ops as mongoose.AnyBulkWriteOperation<IStreamEntry>[],
        { ordered: false }
      );
      updated += result.modifiedCount;
    }

    const pct = (((i + chunk.length) / docs.length) * 100).toFixed(1);
    console.log(`  Progress: ${pct}% (${updated} updated, ${skipped} skipped so far)`);
  }

  console.log(`\nDone. Updated: ${updated}, Skipped (no Spotify data): ${skipped}`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
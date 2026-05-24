/**
 * enrichStreamEntries.ts
 *
 * Backfills `genre`, `releaseYear`, `albumImageUrl`, and `artistImageUrl`
 * on StreamEntry documents.
 *
 * Strategy per unique spotifyTrackUri:
 *   1. If ANY document for that URI already has all fields filled → copy them
 *      to all other documents missing them (no Spotify call needed).
 *   2. Otherwise → fetch from Spotify, then write to ALL documents for that URI.
 *
 * artistImageUrl is tracked by artist ID (not track URI) via a module-level
 * artistDataCache. If two tracks share a primary artist, the /artists call is
 * made once and the image URL is reused for all matching tracks.
 *
 * Resilience:
 *   - ETIMEDOUT / network errors → retried with exponential backoff
 *   - 429 rate-limit             → respects Retry-After header, then exponential backoff
 *   - Progress written to DB incrementally — safe to kill and resume
 *
 * Usage:
 *   MONGODB_URI=mongodb://...      \
 *   SPOTIFY_CLIENT_ID=...          \
 *   SPOTIFY_CLIENT_SECRET=...      \
 *   npx tsx enrichStreamEntries.ts
 *
 * Optional env vars:
 *   BATCH_SIZE          – MongoDB bulk-write batch size        (default: 100)
 *   SPOTIFY_CONCURRENCY – parallel Spotify requests at a time  (default: 1)
 *   IMAGE_SIZE          – "large" (640px) | "medium" (300px) | "small" (64px) (default: large)
 *   DRY_RUN             – set to "true" to skip writes         (default: false)
 */

import mongoose, { AnyBulkWriteOperation } from "mongoose";
import StreamEntry, { IStreamEntry } from "./models/StreamEntry";

// ─── Config ──────────────────────────────────────────────────────────────────

const MONGODB_URI           = process.env.MONGODB_URI!;
const SPOTIFY_CLIENT_ID     = process.env.SPOTIFY_CLIENT_ID!;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET!;
const BATCH_SIZE            = parseInt(process.env.BATCH_SIZE ?? "100", 10);
const CONCURRENCY           = parseInt(process.env.SPOTIFY_CONCURRENCY ?? "1", 10);
const DRY_RUN               = process.env.DRY_RUN === "true";
const IMAGE_SIZE            = (process.env.IMAGE_SIZE ?? "large") as "large" | "medium" | "small";

const IMAGE_SIZE_INDEX: Record<"large" | "medium" | "small", number> = {
  large:  0, // 640 × 640
  medium: 1, // 300 × 300
  small:  2, // 64  × 64
};

// ─── Types ───────────────────────────────────────────────────────────────────

interface TrackMeta {
  genre:                 string;
  releaseYear:           number;
  releaseDatePrecision:  "year" | "month" | "day";
  releaseYearConfidence: number;
  albumImageUrl:         string | null;
  /** Primary artist's profile image. Cached by artist ID across all batches. */
  artistImageUrl:        string | null;
}

interface SpotifyToken {
  access_token: string;
  expires_at:   number; // epoch ms
}

interface SpotifyImage  { url: string; width: number; height: number; }

interface SpotifyArtist {
  id:     string;
  name:   string;
  genres: string[];
  images: SpotifyImage[];
}

interface SpotifyTrack {
  id:      string;
  artists: Array<{ id: string; name: string }>;
  album: {
    release_date:           string;
    release_date_precision: string;
    images:                 SpotifyImage[];
  };
}

// ─── Artist-level cache (module-level, persists across all batch calls) ───────
//
// Keyed by Spotify artist ID. Populated once per artist, reused for every
// track that shares that primary artist — even across separate chunk fetches.

interface ArtistData {
  genres:     string[];
  imageUrl:   string | null;
}

const artistDataCache = new Map<string, ArtistData>();

// ─── Spotify helpers ─────────────────────────────────────────────────────────

function sleep(ms: number) {
  return new Promise<void>(resolve => setTimeout(resolve, ms));
}

/** Error codes that indicate a transient network failure worth retrying. */
const RETRYABLE_CODES = new Set([
  "ETIMEDOUT", "ECONNRESET", "ECONNREFUSED", "ENOTFOUND", "EAI_AGAIN",
]);

function getRetryableCode(err: unknown): string | null {
  const code =
    (err as NodeJS.ErrnoException & { cause?: NodeJS.ErrnoException })?.cause?.code ??
    (err as NodeJS.ErrnoException)?.code ??
    "";
  if (RETRYABLE_CODES.has(code)) return code;
  if (String(err).includes("fetch failed")) return "fetch failed";
  return null;
}

/**
 * fetch() wrapper that retries on transient network errors with exponential backoff.
 */
async function fetchWithRetry(
  url: string,
  init: RequestInit,
  attempt = 0,
): Promise<Response> {
  const MAX_RETRIES = 8;

  try {
    return await fetch(url, init);
  } catch (err: unknown) {
    if (attempt >= MAX_RETRIES) throw err;

    const code = getRetryableCode(err);
    if (!code) throw err;

    const waitMs = Math.min(2_000 * 2 ** attempt, 60_000);
    process.stdout.write(
      `\n  ⚠  Network error (${code}) — waiting ${(waitMs / 1000).toFixed(0)}s then retry ${attempt + 1}/${MAX_RETRIES}…`
    );
    await sleep(waitMs);
    process.stdout.write(" retrying\n");

    return fetchWithRetry(url, init, attempt + 1);
  }
}

let _token: SpotifyToken | null = null;

async function getSpotifyToken(): Promise<string> {
  if (_token && Date.now() < _token.expires_at - 10_000) return _token.access_token;

  const creds = Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString("base64");
  const res = await fetchWithRetry("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization:  `Basic ${creds}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!res.ok) throw new Error(`Spotify auth failed: ${res.status} ${await res.text()}`);
  const json = await res.json() as { access_token: string; expires_in: number };

  _token = { access_token: json.access_token, expires_at: Date.now() + json.expires_in * 1000 };
  return _token.access_token;
}

function parseTrackId(uri: string): string {
  return uri.startsWith("spotify:track:") ? uri.split(":")[2] : uri;
}

/**
 * Fetches a Spotify API URL with retry for both network errors and 429 rate-limits.
 */
async function spotifyFetch(url: string, token: string, attempt = 0): Promise<Response> {
  const MAX_RETRIES = 8;

  const res = await fetchWithRetry(url, { headers: { Authorization: `Bearer ${token}` } });

  if (res.status === 429) {
    if (attempt >= MAX_RETRIES) throw new Error(`Spotify rate limit persists after ${MAX_RETRIES} retries: ${url}`);

    const retryAfterSec = parseInt(res.headers.get("Retry-After") ?? "0", 10);
    const waitMs = retryAfterSec > 0
      ? retryAfterSec * 1000 + 200
      : Math.min(1_000 * 2 ** attempt, 60_000);

    process.stdout.write(
      `\n  ⏳ 429 rate-limited — waiting ${(waitMs / 1000).toFixed(1)}s (attempt ${attempt + 1}/${MAX_RETRIES})…`
    );
    await sleep(waitMs);
    process.stdout.write(" retrying\n");

    const freshToken = await getSpotifyToken();
    return spotifyFetch(url, freshToken, attempt + 1);
  }

  return res;
}

/**
 * Fetch metadata for up to 50 track URIs in one Spotify /tracks call.
 *
 * Artist data (genres + profile image) is looked up via `artistDataCache` first.
 * Only artist IDs absent from the cache trigger a /artists call, so tracks that
 * share a primary artist with any previously processed track never cause a
 * redundant fetch — even across separate chunk invocations.
 */
async function fetchSpotifyBatch(uris: string[]): Promise<Map<string, TrackMeta>> {
  const token = await getSpotifyToken();
  const ids   = uris.map(parseTrackId).join(",");

  // ── 1. Tracks (album images + artist IDs) ─────────────────────────────────
  const tracksRes = await spotifyFetch(`https://api.spotify.com/v1/tracks?ids=${ids}`, token);
  if (!tracksRes.ok) throw new Error(`Spotify /tracks failed: ${tracksRes.status}`);
  const tracksJson = await tracksRes.json() as { tracks: Array<SpotifyTrack | null> };

  // ── 2. Artist data — only fetch IDs not already in artistDataCache ─────────
  const uncachedArtistIds = new Set<string>();
  for (const t of tracksJson.tracks) {
    if (t) {
      const primaryId = t.artists[0]?.id;
      if (primaryId && !artistDataCache.has(primaryId)) {
        uncachedArtistIds.add(primaryId);
      }
    }
  }

  if (uncachedArtistIds.size > 0) {
    const imgIdx   = IMAGE_SIZE_INDEX[IMAGE_SIZE];
    const artistIds = [...uncachedArtistIds];

    for (let i = 0; i < artistIds.length; i += 50) {
      const chunk  = artistIds.slice(i, i + 50).join(",");
      const artRes = await spotifyFetch(`https://api.spotify.com/v1/artists?ids=${chunk}`, token);
      if (!artRes.ok) throw new Error(`Spotify /artists failed: ${artRes.status}`);
      const artJson = await artRes.json() as { artists: Array<SpotifyArtist | null> };

      for (const a of artJson.artists) {
        if (!a) continue;
        const images    = a.images ?? [];
        const imageUrl  = (images[imgIdx] ?? images[0])?.url ?? null;
        artistDataCache.set(a.id, { genres: a.genres, imageUrl });
      }
    }
  }

  // ── 3. Assemble per-URI result ─────────────────────────────────────────────
  const imgIdx = IMAGE_SIZE_INDEX[IMAGE_SIZE];
  const result = new Map<string, TrackMeta>();

  for (let i = 0; i < tracksJson.tracks.length; i++) {
    const track = tracksJson.tracks[i];
    if (!track) continue;

    // Genre: first non-empty genre from primary artist, fall back to other artists
    let genre = "unknown";
    for (const artist of track.artists) {
      const cached = artistDataCache.get(artist.id);
      if (cached && cached.genres.length > 0) { genre = cached.genres[0]; break; }
    }

    // Artist image: primary artist only
    const primaryArtistData  = artistDataCache.get(track.artists[0]?.id ?? "");
    const artistImageUrl     = primaryArtistData?.imageUrl ?? null;

    const raw           = track.album.release_date;
    const precision     = track.album.release_date_precision as "year" | "month" | "day";
    const year          = parseInt(raw.slice(0, 4), 10);
    const confidence    = precision === "day" ? 1.0 : precision === "month" ? 0.9 : 0.7;
    const images        = track.album.images ?? [];
    const albumImageUrl = (images[imgIdx] ?? images[0])?.url ?? null;

    result.set(uris[i], {
      genre,
      releaseYear:           year,
      releaseDatePrecision:  precision,
      releaseYearConfidence: confidence,
      albumImageUrl,
      artistImageUrl,
    });
  }

  return result;
}

// ─── Concurrency helper ───────────────────────────────────────────────────────

async function pMap<T, R>(items: T[], fn: (item: T) => Promise<R>, concurrency: number): Promise<R[]> {
  const results: R[] = [];
  let idx = 0;
  async function worker() {
    while (idx < items.length) {
      const i = idx++;
      results[i] = await fn(items[i]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, worker));
  return results;
}

// ─── Shared filter helpers ────────────────────────────────────────────────────

/** Fields that mark a document as needing backfill. */
const INCOMPLETE_OR = [
  { genre:          { $in: [null, "", "unknown"] } },
  { releaseYear:    { $exists: false } },
  { releaseYear:    null },
  { albumImageUrl:  { $exists: false } },
  { albumImageUrl:  null },
  { artistImageUrl: { $exists: false } },
  { artistImageUrl: null },
];

function buildSetFromMeta(meta: TrackMeta) {
  return {
    genre:                 meta.genre,
    releaseYear:           meta.releaseYear,
    releaseDatePrecision:  meta.releaseDatePrecision,
    releaseYearConfidence: meta.releaseYearConfidence,
    ...(meta.albumImageUrl  != null ? { albumImageUrl:  meta.albumImageUrl  } : {}),
    ...(meta.artistImageUrl != null ? { artistImageUrl: meta.artistImageUrl } : {}),
  };
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  if (!MONGODB_URI)           throw new Error("MONGODB_URI is required");
  if (!SPOTIFY_CLIENT_ID)     throw new Error("SPOTIFY_CLIENT_ID is required");
  if (!SPOTIFY_CLIENT_SECRET) throw new Error("SPOTIFY_CLIENT_SECRET is required");

  console.log("Connecting to MongoDB…");
  await mongoose.connect(MONGODB_URI);
  console.log("Connected.\n");

  // ── Step 1: find all unique URIs missing any field ─────────────────────────
  console.log("Finding URIs with missing metadata…");

  const incompleteUris: string[] = await StreamEntry.distinct("spotifyTrackUri", {
    $or: INCOMPLETE_OR,
  });

  console.log(`Found ${incompleteUris.length} unique URIs that need backfilling.\n`);
  if (incompleteUris.length === 0) {
    console.log("Nothing to do. Exiting.");
    await mongoose.disconnect();
    return;
  }

  // ── Step 2: check which URIs already have complete data in another doc ─────
  console.log("Checking which URIs already have metadata in the DB…");

  type AggResult = {
    _id:                   string;
    genre:                 string;
    releaseYear:           number;
    releaseDatePrecision:  string;
    releaseYearConfidence: number;
    albumImageUrl:         string | null;
    artistImageUrl:        string | null;
  };

  const existing: AggResult[] = await StreamEntry.aggregate([
    {
      $match: {
        spotifyTrackUri: { $in: incompleteUris },
        genre:           { $nin: [null, "", "unknown"] },
        releaseYear:     { $exists: true, $ne: null },
        albumImageUrl:   { $exists: true, $ne: null },
        artistImageUrl:  { $exists: true, $ne: null },
      },
    },
    {
      $group: {
        _id:                   "$spotifyTrackUri",
        genre:                 { $first: "$genre" },
        releaseYear:           { $first: "$releaseYear" },
        releaseDatePrecision:  { $first: "$releaseDatePrecision" },
        releaseYearConfidence: { $first: "$releaseYearConfidence" },
        albumImageUrl:         { $first: "$albumImageUrl" },
        artistImageUrl:        { $first: "$artistImageUrl" },
      },
    },
  ]);

  const cachedMeta = new Map<string, TrackMeta>(
    existing.map(r => [r._id, {
      genre:                 r.genre,
      releaseYear:           r.releaseYear,
      releaseDatePrecision:  r.releaseDatePrecision as "year" | "month" | "day",
      releaseYearConfidence: r.releaseYearConfidence,
      albumImageUrl:         r.albumImageUrl,
      artistImageUrl:        r.artistImageUrl,
    }])
  );

  const urisNeedingSpotify = incompleteUris.filter(u => !cachedMeta.has(u));

  console.log(`  ${cachedMeta.size} URIs already have data in DB (will copy)`);
  console.log(`  ${urisNeedingSpotify.length} URIs need a Spotify fetch`);
  console.log(`  Image size:  ${IMAGE_SIZE} (${["640px","300px","64px"][IMAGE_SIZE_INDEX[IMAGE_SIZE]]})`);
  console.log(`  Concurrency: ${CONCURRENCY}  |  Batch size: ${BATCH_SIZE}\n`);

  // ── Step 3: fetch from Spotify, write to DB incrementally ─────────────────
  if (urisNeedingSpotify.length > 0) {
    console.log("Fetching from Spotify and writing incrementally…");

    const chunks: string[][] = [];
    for (let i = 0; i < urisNeedingSpotify.length; i += 50) {
      chunks.push(urisNeedingSpotify.slice(i, i + 50));
    }

    let fetched      = 0;
    let totalWritten = 0;
    let pendingOps: AnyBulkWriteOperation<IStreamEntry>[] = [];

    async function flushPending() {
      if (pendingOps.length === 0 || DRY_RUN) {
        if (DRY_RUN && pendingOps.length > 0) console.log(`  [DRY RUN] Would write ${pendingOps.length} ops`);
        pendingOps = [];
        return;
      }
      const res = await StreamEntry.bulkWrite(pendingOps, { ordered: false });
      totalWritten += res.modifiedCount;
      pendingOps = [];
    }

    await pMap(chunks, async (chunk) => {
      const batchResult = await fetchSpotifyBatch(chunk);

      for (const [uri, meta] of batchResult) {
        cachedMeta.set(uri, meta);
        pendingOps.push({
          updateMany: {
            filter: { spotifyTrackUri: uri, $or: INCOMPLETE_OR },
            update: { $set: buildSetFromMeta(meta) },
          },
        });
      }

      fetched += chunk.length;
      process.stdout.write(
        `\r  Fetched ${fetched}/${urisNeedingSpotify.length} tracks, written ~${totalWritten} docs…`
      );

      if (pendingOps.length >= BATCH_SIZE) await flushPending();
    }, CONCURRENCY);

    await flushPending();
    console.log(`\n\nSpotify fetch + write done. Total docs updated: ~${totalWritten}\n`);
  }

  // ── Step 4: copy cached data to any remaining incomplete docs ──────────────
  if (cachedMeta.size > 0) {
    console.log("Copying cached metadata to remaining incomplete docs…");

    let copyOps: AnyBulkWriteOperation<IStreamEntry>[] = [];
    let copyTotal = 0;

    async function flushCopy() {
      if (copyOps.length === 0 || DRY_RUN) { copyOps = []; return; }
      const res = await StreamEntry.bulkWrite(copyOps, { ordered: false });
      copyTotal += res.modifiedCount;
      copyOps = [];
    }

    for (const uri of incompleteUris) {
      const meta = cachedMeta.get(uri);
      if (!meta) continue;

      copyOps.push({
        updateMany: {
          filter: { spotifyTrackUri: uri, $or: INCOMPLETE_OR },
          update: { $set: buildSetFromMeta(meta) },
        },
      });

      if (copyOps.length >= BATCH_SIZE) await flushCopy();
    }

    await flushCopy();
    if (copyTotal > 0) console.log(`  Copied to ${copyTotal} additional docs.\n`);
  }

  console.log(`✅  Done.${DRY_RUN ? " (DRY RUN — no writes)" : ""}`);
  await mongoose.disconnect();
}

main().catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});
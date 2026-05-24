import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import mongoose from "mongoose";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/db";
import StreamEntry from "@/lib/models/StreamEntry";
import { getValidSpotifyToken } from "@/lib/spotify-token";

// ─── Types ────────────────────────────────────────────────────────────────────

type SpotifyImage = {
  url: string;
  height: number | null;
  width: number | null;
};

type SpotifyTrack = {
  type?: string;
  name: string;
  uri: string;
  duration_ms: number;
  artists?: { id: string; name: string }[];
  album?: {
    name: string;
    release_date?: string;
    release_date_precision?: "year" | "month" | "day";
    images?: SpotifyImage[];
  };
};

type SpotifyArtist = {
  id: string;
  name: string;
  genres: string[];
  images: SpotifyImage[];
};

type CurrentlyPlayingResponse = {
  is_playing?: boolean;
  item?: SpotifyTrack | null;
};

type RecentlyPlayedResponse = {
  items?: Array<{
    played_at: string;
    track: SpotifyTrack | null;
  }>;
};

type TrackSummary = {
  trackName: string;
  artistName: string;
  albumImageUrl: string | null;
};

type ArtistMeta = {
  genre: string;
  artistImageUrl: string | null;
};

type SpotifyErrorInfo = {
  status: number;
  message: string;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function releaseConfidence(precision?: "year" | "month" | "day") {
  if (precision === "day")   return 1;
  if (precision === "month") return 0.8;
  if (precision === "year")  return 0.6;
  return null;
}

function releaseYearFromTrack(track: SpotifyTrack) {
  const precision   = track.album?.release_date_precision;
  const releaseDate = track.album?.release_date;
  if (!releaseDate) {
    return { releaseYear: null, releaseDatePrecision: null, releaseYearConfidence: null };
  }

  const year = Number.parseInt(releaseDate.slice(0, 4), 10);
  if (!Number.isFinite(year) || year < 1900 || year > new Date().getFullYear() + 1) {
    return { releaseYear: null, releaseDatePrecision: null, releaseYearConfidence: null };
  }

  return {
    releaseYear:           year,
    releaseDatePrecision:  precision ?? null,
    releaseYearConfidence: releaseConfidence(precision),
  };
}

/** Spotify sorts images largest → smallest; index 0 is best quality. */
function pickImage(images?: SpotifyImage[]): string | null {
  return images?.[0]?.url ?? null;
}

function toTrackSummary(track: SpotifyTrack): TrackSummary {
  return {
    trackName:     track.name,
    artistName:    track.artists?.map((a) => a.name).filter(Boolean).join(", ") || "Unknown Artist",
    albumImageUrl: pickImage(track.album?.images),
  };
}

async function getSpotifyErrorInfo(response: Response): Promise<SpotifyErrorInfo> {
  const fallback = { status: response.status, message: response.statusText || "Unknown Spotify error" };
  try {
    const payload = await response.clone().json();
    const message =
      typeof payload?.error?.message === "string" ? payload.error.message :
      typeof payload?.error === "string"           ? payload.error :
      fallback.message;
    return { status: response.status, message };
  } catch {
    return fallback;
  }
}

async function fetchSpotifyPlayback(accessToken: string) {
  const headers = { Authorization: `Bearer ${accessToken}` };
  return Promise.all([
    fetch("https://api.spotify.com/v1/me/player/currently-playing",          { headers, cache: "no-store" }),
    fetch("https://api.spotify.com/v1/me/player/recently-played?limit=50",   { headers, cache: "no-store" }),
  ]);
}

/**
 * Fetches genre + profile image for a set of artist IDs in one /artists call.
 * At most 50 IDs — safe since recently-played is capped at 50 tracks.
 *
 * Returns an empty map (graceful degradation) if the request fails, so a
 * Spotify hiccup never blocks the core sync.
 */
async function fetchArtistMeta(
  artistIds: string[],
  accessToken: string,
): Promise<Map<string, ArtistMeta>> {
  const result = new Map<string, ArtistMeta>();
  if (artistIds.length === 0) return result;

  try {
    // Deduplicate and cap at 50 (Spotify hard limit per call)
    const ids = [...new Set(artistIds)].slice(0, 50).join(",");
    const res = await fetch(`https://api.spotify.com/v1/artists?ids=${ids}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    });

    if (!res.ok) {
      console.warn(`[sync] /artists fetch failed: ${res.status} — genre/artistImageUrl will be omitted`);
      return result;
    }

    const json = (await res.json()) as { artists: Array<SpotifyArtist | null> };

    for (const artist of json.artists) {
      if (!artist) continue;
      result.set(artist.id, {
        genre:          artist.genres?.[0] ?? "unknown",
        artistImageUrl: pickImage(artist.images),
      });
    }
  } catch (err) {
    console.warn("[sync] /artists fetch threw — genre/artistImageUrl will be omitted:", err);
  }

  return result;
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    console.log("[sync] No valid session or user ID found");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let userId: mongoose.Types.ObjectId;
  try {
    userId = new mongoose.Types.ObjectId(session.user.id);
  } catch {
    return NextResponse.json({ error: "Invalid user id" }, { status: 400 });
  }

  let accessToken: string;
  try {
    accessToken = await getValidSpotifyToken(session.user.id);
  } catch (err) {
    console.log("[sync] Token refresh failed:", err);
    return NextResponse.json(
      { error: "Spotify token refresh failed. Please sign in again." },
      { status: 401 },
    );
  }

  let [nowPlayingRes, recentlyPlayedRes] = await fetchSpotifyPlayback(accessToken);

  if (recentlyPlayedRes.status === 401) {
    try {
      accessToken = await getValidSpotifyToken(session.user.id, { forceRefresh: true });
      [nowPlayingRes, recentlyPlayedRes] = await fetchSpotifyPlayback(accessToken);
    } catch (err) {
      console.log("[sync] Forced token refresh failed:", err);
    }
  }

  if (recentlyPlayedRes.status === 401) {
    const error = await getSpotifyErrorInfo(recentlyPlayedRes);
    console.log("[sync] Spotify recently played unauthorized for user", session.user.id, error);
    return NextResponse.json(
      { error: "Spotify authorization failed. Please reconnect your account." },
      { status: 401 },
    );
  }

  if (!recentlyPlayedRes.ok) {
    console.log("[sync] Failed to fetch recently played tracks from Spotify");
    return NextResponse.json(
      { error: "Failed to fetch recently played tracks from Spotify" },
      { status: 502 },
    );
  }

  // ── Now-playing ────────────────────────────────────────────────────────────
  let nowPlaying: TrackSummary | null = null;
  const nowPlayingAuth = {
    authorized:        true,
    reconnectRequired: false,
    status:            nowPlayingRes.status,
    message:           null as string | null,
  };

  if (nowPlayingRes.status === 401 || nowPlayingRes.status === 403) {
    const error = await getSpotifyErrorInfo(nowPlayingRes);
    nowPlayingAuth.authorized        = false;
    nowPlayingAuth.reconnectRequired = true;
    nowPlayingAuth.message           = error.message;
    console.log("[sync] Spotify now playing unauthorized; continuing recent sync", {
      userId: session.user.id, ...error,
    });
  } else if (nowPlayingRes.status === 200) {
    const payload = (await nowPlayingRes.json()) as CurrentlyPlayingResponse;
    if (payload.is_playing && payload.item?.type === "track") {
      nowPlaying = toTrackSummary(payload.item);
    }
  } else if (nowPlayingRes.status !== 204 && !nowPlayingRes.ok) {
    const error = await getSpotifyErrorInfo(nowPlayingRes);
    nowPlayingAuth.authorized = false;
    nowPlayingAuth.status     = error.status;
    nowPlayingAuth.message    = error.message;
    console.log("[sync] Spotify now playing unavailable; continuing recent sync", {
      userId: session.user.id, ...error,
    });
  }

  // ── Recently played ────────────────────────────────────────────────────────
  const recentlyPlayedPayload = (await recentlyPlayedRes.json()) as RecentlyPlayedResponse;
  const recentItems           = recentlyPlayedPayload.items ?? [];
  const latestPlayed          = recentItems.find((item) => item.track?.type === "track");

  const validItems = recentItems.filter(
    (item) => item.track?.type === "track" && item.track.uri && item.played_at,
  );

  // ── Artist metadata (genre + artistImageUrl) ───────────────────────────────
  // Collect the primary artist ID for every valid track, then batch-fetch once.
  const primaryArtistIds = validItems
    .map((item) => item.track?.artists?.[0]?.id)
    .filter((id): id is string => Boolean(id));

  const artistMetaMap = await fetchArtistMeta(primaryArtistIds, accessToken);

  // ── Build bulk-write ops ───────────────────────────────────────────────────
  const ops = validItems.map((item) => {
    const track       = item.track as SpotifyTrack;
    const releaseMeta = releaseYearFromTrack(track);

    const releaseFields = {
      ...(releaseMeta.releaseYear           !== null ? { releaseYear:           releaseMeta.releaseYear           } : {}),
      ...(releaseMeta.releaseDatePrecision  !== null ? { releaseDatePrecision:  releaseMeta.releaseDatePrecision  } : {}),
      ...(releaseMeta.releaseYearConfidence !== null ? { releaseYearConfidence: releaseMeta.releaseYearConfidence } : {}),
    };

    const albumImg    = pickImage(track.album?.images);
    const primaryId   = track.artists?.[0]?.id;
    const artistMeta  = primaryId ? artistMetaMap.get(primaryId) : undefined;

    const enrichedFields = {
      ...(albumImg                  ? { albumImageUrl:  albumImg                  } : {}),
      ...(artistMeta?.artistImageUrl ? { artistImageUrl: artistMeta.artistImageUrl } : {}),
      ...(artistMeta?.genre          ? { genre:          artistMeta.genre          } : {}),
    };

    return {
      updateOne: {
        filter: {
          userId,
          ts:              new Date(item.played_at),
          spotifyTrackUri: track.uri,
        },
        update: {
          $setOnInsert: {
            userId,
            ts:              new Date(item.played_at),
            platform:        "spotify-live-sync",
            msPlayed:        Math.max(0, track.duration_ms ?? 0),
            trackName:       track.name,
            artistName:      track.artists?.map((a) => a.name).join(", ") || "Unknown Artist",
            albumName:       track.album?.name || "Unknown Album",
            spotifyTrackUri: track.uri,
            ...releaseFields,
            ...enrichedFields,
            reasonStart:     "",
            reasonEnd:       "",
            shuffle:         false,
            skipped:         false,
            offline:         false,
          },
        },
        upsert: true,
      },
    };
  });

  await connectDB();
  const result = ops.length > 0 ? await StreamEntry.bulkWrite(ops, { ordered: false }) : null;

  return NextResponse.json({
    nowPlaying,
    lastPlayed:  latestPlayed?.track ? toTrackSummary(latestPlayed.track) : null,
    spotifyAuth: { nowPlaying: nowPlayingAuth },
    sync: {
      processed: ops.length,
      inserted:  result?.upsertedCount ?? 0,
      syncedAt:  new Date().toISOString(),
    },
  });
}
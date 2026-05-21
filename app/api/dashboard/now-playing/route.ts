import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import mongoose from "mongoose";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/db";
import StreamEntry from "@/lib/models/StreamEntry";
import { getValidSpotifyToken } from "@/lib/spotify-token";

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
  artists?: { name: string }[];
  album?: {
    name: string;
    release_date?: string;
    release_date_precision?: "year" | "month" | "day";
    images?: SpotifyImage[]; // ← NEW
  };
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
  albumImageUrl: string | null; // ← NEW
};

type SpotifyErrorInfo = {
  status: number;
  message: string;
};

function releaseConfidence(precision?: "year" | "month" | "day") {
  if (precision === "day") return 1;
  if (precision === "month") return 0.8;
  if (precision === "year") return 0.6;
  return null;
}

function releaseYearFromTrack(track: SpotifyTrack) {
  const precision = track.album?.release_date_precision;
  const releaseDate = track.album?.release_date;
  if (!releaseDate) {
    return { releaseYear: null, releaseDatePrecision: null, releaseYearConfidence: null };
  }

  const year = Number.parseInt(releaseDate.slice(0, 4), 10);
  if (!Number.isFinite(year) || year < 1900 || year > new Date().getFullYear() + 1) {
    return { releaseYear: null, releaseDatePrecision: null, releaseYearConfidence: null };
  }

  return {
    releaseYear: year,
    releaseDatePrecision: precision ?? null,
    releaseYearConfidence: releaseConfidence(precision),
  };
}

// ── Picks the largest album art Spotify provides (first in the array) ──────────
function albumImageUrl(track: SpotifyTrack): string | null {
  const images = track.album?.images;
  if (!images?.length) return null;
  // Spotify sorts images largest → smallest; index 0 is the best quality
  return images[0].url ?? null;
}

async function fetchSpotifyPlayback(accessToken: string) {
  const headers = { Authorization: `Bearer ${accessToken}` };

  return Promise.all([
    fetch("https://api.spotify.com/v1/me/player/currently-playing", {
      headers,
      cache: "no-store",
    }),
    fetch("https://api.spotify.com/v1/me/player/recently-played?limit=50", {
      headers,
      cache: "no-store",
    }),
  ]);
}

async function getSpotifyErrorInfo(response: Response): Promise<SpotifyErrorInfo> {
  const fallback = {
    status: response.status,
    message: response.statusText || "Unknown Spotify error",
  };

  try {
    const payload = await response.clone().json();
    const message =
      typeof payload?.error?.message === "string"
        ? payload.error.message
        : typeof payload?.error === "string"
          ? payload.error
          : fallback.message;

    return { status: response.status, message };
  } catch {
    return fallback;
  }
}

function toTrackSummary(track: SpotifyTrack): TrackSummary {
  return {
    trackName: track.name,
    artistName: track.artists?.map((a) => a.name).filter(Boolean).join(", ") || "Unknown Artist",
    albumImageUrl: albumImageUrl(track), // ← NEW
  };
}

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
      { status: 401 }
    );
  }

  let [nowPlayingRes, recentlyPlayedRes] = await fetchSpotifyPlayback(accessToken);
  console.log("[sync] Initial Spotify fetch results", {
    userId: session.user.id,
    nowPlayingStatus: nowPlayingRes,
    recentlyPlayedStatus: recentlyPlayedRes
  });

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
      { status: 401 }
    );
  }

  if (!recentlyPlayedRes.ok) {
    console.log("[sync] Failed to fetch recently played tracks from Spotify");
    return NextResponse.json(
      { error: "Failed to fetch recently played tracks from Spotify" },
      { status: 502 }
    );
  }

  let nowPlaying: TrackSummary | null = null;
  const nowPlayingAuth = {
    authorized: true,
    reconnectRequired: false,
    status: nowPlayingRes.status,
    message: null as string | null,
  };

  if (nowPlayingRes.status === 401 || nowPlayingRes.status === 403) {
    const error = await getSpotifyErrorInfo(nowPlayingRes);
    nowPlayingAuth.authorized = false;
    nowPlayingAuth.reconnectRequired = true;
    nowPlayingAuth.message = error.message;
    console.log("[sync] Spotify now playing unauthorized; continuing recent sync", {
      userId: session.user.id,
      ...error,
    });
  } else if (nowPlayingRes.status === 200) {
    const payload = (await nowPlayingRes.json()) as CurrentlyPlayingResponse;
    if (payload.is_playing && payload.item?.type === "track") {
      // toTrackSummary now captures albumImageUrl from the full item payload
      nowPlaying = toTrackSummary(payload.item);
    }
  } else if (nowPlayingRes.status !== 204 && !nowPlayingRes.ok) {
    const error = await getSpotifyErrorInfo(nowPlayingRes);
    nowPlayingAuth.authorized = false;
    nowPlayingAuth.status = error.status;
    nowPlayingAuth.message = error.message;
    console.log("[sync] Spotify now playing unavailable; continuing recent sync", {
      userId: session.user.id,
      ...error,
    });
  }

  const recentlyPlayedPayload = (await recentlyPlayedRes.json()) as RecentlyPlayedResponse;
  const recentItems = recentlyPlayedPayload.items ?? [];
  const latestPlayed = recentItems.find((item) => item.track?.type === "track");

  const ops = recentItems
    .filter(
      (item) =>
        item.track?.type === "track" &&
        item.track.uri &&
        item.played_at
    )
    .map((item) => {
      const track = item.track as SpotifyTrack;
      const releaseMeta = releaseYearFromTrack(track);
      const releaseFields = {
        ...(releaseMeta.releaseYear !== null
          ? { releaseYear: releaseMeta.releaseYear }
          : {}),
        ...(releaseMeta.releaseDatePrecision !== null
          ? { releaseDatePrecision: releaseMeta.releaseDatePrecision }
          : {}),
        ...(releaseMeta.releaseYearConfidence !== null
          ? { releaseYearConfidence: releaseMeta.releaseYearConfidence }
          : {}),
      };

      // Only include albumImageUrl in the document if Spotify actually returned one
      const imageUrl = albumImageUrl(track);
      const imageFields = imageUrl ? { albumImageUrl: imageUrl } : {};

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
              ...imageFields, // ← NEW
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
  const result =
    ops.length > 0 ? await StreamEntry.bulkWrite(ops, { ordered: false }) : null;

  return NextResponse.json({
    nowPlaying,
    lastPlayed: latestPlayed?.track ? toTrackSummary(latestPlayed.track) : null,
    spotifyAuth: {
      nowPlaying: nowPlayingAuth,
    },
    sync: {
      processed: ops.length,
      inserted:  result?.upsertedCount ?? 0,
      syncedAt:  new Date().toISOString(),
    },
  });
}
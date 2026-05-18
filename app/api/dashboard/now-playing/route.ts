import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import mongoose from "mongoose";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/db";
import StreamEntry from "@/lib/models/StreamEntry";
import { getValidSpotifyToken } from "@/lib/spotify-token";

type SpotifyTrack = {
  type?: string;
  name: string;
  uri: string;
  duration_ms: number;
  artists?: { name: string }[];
  album?: { name: string };
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
};

function toTrackSummary(track: SpotifyTrack): TrackSummary {
  return {
    trackName: track.name,
    artistName: track.artists?.map((a) => a.name).filter(Boolean).join(", ") || "Unknown Artist",
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

  // ── Always get a fresh token from DB, never trust session.accessToken ──
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

  const headers = { Authorization: `Bearer ${accessToken}` };

  const [nowPlayingRes, recentlyPlayedRes] = await Promise.all([
    fetch("https://api.spotify.com/v1/me/player/currently-playing", {
      headers,
      cache: "no-store",
    }),
    fetch("https://api.spotify.com/v1/me/player/recently-played?limit=50", {
      headers,
      cache: "no-store",
    }),
  ]);

  // A 401 here after a fresh token means the user revoked app access
  if (nowPlayingRes.status === 401 || recentlyPlayedRes.status === 401) {
    console.log("[sync] Spotify access revoked for user", session.user.id, nowPlayingRes);
    return NextResponse.json(
      { error: "Spotify access revoked. Please reconnect your account." },
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
  if (nowPlayingRes.status === 200) {
    const payload = (await nowPlayingRes.json()) as CurrentlyPlayingResponse;
    if (payload.is_playing && payload.item?.type === "track") {
      nowPlaying = toTrackSummary(payload.item);
    }
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
    sync: {
      processed: ops.length,
      inserted:  result?.upsertedCount ?? 0,
      syncedAt:  new Date().toISOString(),
    },
  });
}

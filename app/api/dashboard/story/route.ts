import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import mongoose from "mongoose";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/db";
import StreamEntry from "@/lib/models/StreamEntry";
import { getValidSpotifyToken } from "@/lib/spotify-token";

function parseDate(raw: string | null, fallback: Date) {
  if (!raw) return fallback;
  const dt = new Date(raw);
  return Number.isNaN(dt.getTime()) ? fallback : dt;
}

type ReleasePrecision = "year" | "month" | "day";
type TrackReleaseAgg = {
  _id: string;
  plays: number;
  trackName: string;
  artistName: string;
  albumName: string;
  releaseYear?: number;
  releaseDatePrecision?: ReleasePrecision | null;
  releaseYearConfidence?: number | null;
};

type SpotifyTracksResponse = {
  tracks?: Array<{
    uri: string;
    album?: {
      release_date?: string;
      release_date_precision?: ReleasePrecision;
    };
  } | null>;
};

const DISTORTED_VERSION_RE = /\b(remaster(?:ed)?|live)\b/i;

function parseSpotifyTrackId(uri: string): string | null {
  if (uri.startsWith("spotify:track:")) return uri.split(":")[2] ?? null;
  if (uri.includes("open.spotify.com/track/")) {
    const maybeId = uri.split("/track/")[1]?.split("?")[0] ?? null;
    return maybeId || null;
  }
  return null;
}

function releaseConfidence(precision?: ReleasePrecision | null) {
  if (precision === "day") return 1;
  if (precision === "month") return 0.8;
  if (precision === "year") return 0.6;
  return null;
}

function normalizeReleaseYear(
  releaseDate?: string,
  precision?: ReleasePrecision
): { releaseYear: number | null; releaseDatePrecision: ReleasePrecision | null; releaseYearConfidence: number | null } {
  if (!releaseDate) return { releaseYear: null, releaseDatePrecision: null, releaseYearConfidence: null };
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

function isDistortedVersion(trackName: string, albumName: string) {
  return DISTORTED_VERSION_RE.test(trackName) || DISTORTED_VERSION_RE.test(albumName);
}

async function fetchTrackReleaseMetadata(userMongoId: string, uris: string[]) {
  const token = await getValidSpotifyToken(userMongoId);
  const dedupedUris = Array.from(new Set(uris));
  const uriById = new Map<string, string>();
  for (const uri of dedupedUris) {
    const id = parseSpotifyTrackId(uri);
    if (id) uriById.set(id, uri);
  }

  const ids = Array.from(uriById.keys());
  const map = new Map<string, { releaseYear: number; releaseDatePrecision: ReleasePrecision | null; releaseYearConfidence: number | null }>();
  for (let i = 0; i < ids.length; i += 50) {
    const batch = ids.slice(i, i + 50);
    const res = await fetch(`https://api.spotify.com/v1/tracks?ids=${batch.join(",")}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) continue;

    const payload = (await res.json()) as SpotifyTracksResponse;
    for (const track of payload.tracks ?? []) {
      if (!track?.uri) continue;
      const normalized = normalizeReleaseYear(
        track.album?.release_date,
        track.album?.release_date_precision
      );
      if (!normalized.releaseYear) continue;
      map.set(track.uri, {
        releaseYear: normalized.releaseYear,
        releaseDatePrecision: normalized.releaseDatePrecision,
        releaseYearConfidence: normalized.releaseYearConfidence,
      });
    }
  }

  return map;
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = req.nextUrl.searchParams;
  const now = new Date();
  const defaultStart = new Date(now.getFullYear(), 0, 1);
  const from = parseDate(searchParams.get("from"), defaultStart);
  const to = parseDate(searchParams.get("to"), now);

  await connectDB();
  const userId = new mongoose.Types.ObjectId(session.user.id);
  const rangeMatch = { userId, ts: { $gte: from, $lte: to } };

  const [topTrack, topArtist, trackReleaseAgg, monthData, hiddenGem, daypartData, forgottenFavorite, totals] = await Promise.all([
    StreamEntry.aggregate<{ _id: string; artistName: string; plays: number; albumImageUrl: string | null }>([
      { $match: rangeMatch },
      { $group: { _id: "$trackName", artistName: { $first: "$artistName" }, plays: { $sum: 1 }, albumImageUrl: { $first: "$albumImageUrl" } } },
      { $sort: { plays: -1 } },
      { $limit: 1 },
    ]),
    StreamEntry.aggregate<{ _id: string; plays: number }>([
      { $match: rangeMatch },
      { $group: { _id: "$artistName", plays: { $sum: 1 } } },
      { $sort: { plays: -1 } },
      { $limit: 1 },
    ]),
    StreamEntry.aggregate<TrackReleaseAgg>([
      { $match: rangeMatch },
      {
        $group: {
          _id: "$spotifyTrackUri",
          plays: { $sum: 1 },
          trackName: { $first: "$trackName" },
          artistName: { $first: "$artistName" },
          albumName: { $first: "$albumName" },
          releaseYear: { $first: "$releaseYear" },
          releaseDatePrecision: { $first: "$releaseDatePrecision" },
          releaseYearConfidence: { $first: "$releaseYearConfidence" },
        },
      },
      { $match: { _id: { $type: "string", $ne: "" } } },
    ]),
    StreamEntry.aggregate<{ _id: number; plays: number }>([
      { $match: rangeMatch },
      { $group: { _id: { $month: "$ts" }, plays: { $sum: 1 } } },
      { $sort: { plays: -1 } },
      { $limit: 1 },
    ]),
    StreamEntry.aggregate<{ trackName: string; artistName: string; plays: number; albumImageUrl: string | null }>([
      { $match: rangeMatch },
      { $group: { _id: { trackName: "$trackName", artistName: "$artistName", albumImageUrl: "$albumImageUrl" }, plays: { $sum: 1 } } },
      { $match: { plays: { $gte: 2, $lte: 4 } } },
      { $sort: { plays: -1 } },
      { $limit: 1 },
      { $project: { _id: 0, trackName: "$_id.trackName", artistName: "$_id.artistName", albumImageUrl: "$_id.albumImageUrl", plays: 1 } },
    ]),

    StreamEntry.aggregate<{ _id: string; plays: number }>([
      { $match: rangeMatch },
      { $project: { hour: { $hour: "$ts" } } },
      {
        $project: {
          daypart: {
            $switch: {
              branches: [
                { case: { $and: [{ $gte: ["$hour", 6] }, { $lt: ["$hour", 12] }] }, then: "Morning" },
                { case: { $and: [{ $gte: ["$hour", 12] }, { $lt: ["$hour", 18] }] }, then: "Afternoon" },
                { case: { $and: [{ $gte: ["$hour", 18] }, { $lt: ["$hour", 23] }] }, then: "Evening" },
              ],
              default: "Late Night",
            },
          },
        },
      },
      { $group: { _id: "$daypart", plays: { $sum: 1 } } },
      { $sort: { plays: -1 } },
    ]),
    StreamEntry.aggregate<{ trackName: string; artistName: string; gapDays: number; albumImageUrl: string | null }>([
      { $match: rangeMatch },
      { $sort: { ts: 1 } },
      {
        $group: {
          _id: { trackName: "$trackName", artistName: "$artistName",  albumImageUrl: "$albumImageUrl" },
          plays: { $sum: 1 },
          firstPlayed: { $first: "$ts" },
          lastPlayed: { $last: "$ts" },
        },
      },
      { $match: { plays: { $gte: 3 } } },
      { $project: { _id: 0, trackName: "$_id.trackName", artistName: "$_id.artistName", gapDays: { $divide: [{ $subtract: ["$lastPlayed", "$firstPlayed"] }, 1000 * 60 * 60 * 24] }, albumImageUrl: "$_id.albumImageUrl" } },
      { $sort: { gapDays: -1 } },
      { $limit: 1 },
    ]),
    StreamEntry.aggregate<{ _id: null; totalPlays: number; uniqueArtists: number; lateNightPlays: number }>([
      { $match: rangeMatch },
      {
        $group: {
          _id: null,
          totalPlays: { $sum: 1 },
          uniqueArtists: { $addToSet: "$artistName" },
          lateNightPlays: {
            $sum: {
              $cond: [
                { $or: [{ $lt: [{ $hour: "$ts" }, 6] }, { $gte: [{ $hour: "$ts" }, 23] }] },
                1,
                0,
              ],
            },
          },
        },
      },
      { $project: { totalPlays: 1, lateNightPlays: 1, uniqueArtists: { $size: "$uniqueArtists" } } },
    ]),

  ]);

  const favoriteEra = daypartData[0]?._id ?? "Unknown";
  const forgotten = forgottenFavorite[0];
  const total = totals[0];
  const lateNightRatio = total?.totalPlays ? total.lateNightPlays / total.totalPlays : 0;
  const artistDensity = total?.totalPlays ? total.uniqueArtists / total.totalPlays : 0;
  const totalTrackPlays = trackReleaseAgg.reduce((sum, row) => sum + row.plays, 0);
  const nonDistortedTracks = trackReleaseAgg.filter(
    (row) => !isDistortedVersion(row.trackName ?? "", row.albumName ?? "")
  );

  const missingMetadataUris = nonDistortedTracks
    .filter((row) => !Number.isFinite(row.releaseYear))
    .map((row) => row._id);

  let releaseMetadataMap = new Map<string, { releaseYear: number; releaseDatePrecision: ReleasePrecision | null; releaseYearConfidence: number | null }>();
  if (missingMetadataUris.length > 0) {
    try {
      releaseMetadataMap = await fetchTrackReleaseMetadata(session.user.id, missingMetadataUris);
      if (releaseMetadataMap.size > 0) {
        const metadataOps = Array.from(releaseMetadataMap.entries()).map(([uri, metadata]) => ({
          updateMany: {
            filter: { userId, spotifyTrackUri: uri, $or: [{ releaseYear: { $exists: false } }, { releaseYear: null }] },
            update: {
              $set: {
                releaseYear: metadata.releaseYear,
                releaseDatePrecision: metadata.releaseDatePrecision,
                releaseYearConfidence: metadata.releaseYearConfidence,
              },
            },
          },
        }));
        await StreamEntry.bulkWrite(metadataOps, { ordered: false });
      }
    } catch {
      // Best-effort enrichment; continue with available metadata.
    }
  }

  let eligiblePlays = 0;
  let weightedYearSum = 0;
  let weightedConfidenceSum = 0;

  for (const row of nonDistortedTracks) {
    const backfilled = releaseMetadataMap.get(row._id);
    const releaseYear =
      Number.isFinite(row.releaseYear) ? Number(row.releaseYear) : backfilled?.releaseYear ?? null;
    if (!releaseYear || releaseYear < 1900 || releaseYear > now.getFullYear() + 1) continue;

    const trackConfidence =
      row.releaseYearConfidence ??
      backfilled?.releaseYearConfidence ??
      releaseConfidence(row.releaseDatePrecision ?? backfilled?.releaseDatePrecision ?? null) ??
      0.5;

    eligiblePlays += row.plays;
    weightedYearSum += releaseYear * row.plays;
    weightedConfidenceSum += trackConfidence * row.plays;
  }

  const weightedAvgReleaseYear = eligiblePlays > 0 ? weightedYearSum / eligiblePlays : null;
  const inferredMusicAge =
    weightedAvgReleaseYear !== null
      ? Math.max(0, Math.round(now.getFullYear() - weightedAvgReleaseYear + 18))
      : null;
  const playCoveragePct = totalTrackPlays > 0 ? Math.round((eligiblePlays / totalTrackPlays) * 100) : 0;
  const confidencePct = eligiblePlays > 0 ? Math.round((weightedConfidenceSum / eligiblePlays) * 100) : 0;
  const noTrackIds = trackReleaseAgg.length === 0;
  const musicAgeSubtitle =
    inferredMusicAge !== null
      ? `Inferred (not real age) from Spotify release dates · ${playCoveragePct}% play coverage · ${confidencePct}% confidence.`
      : noTrackIds
        ? "No track IDs in this range, so music age cannot be inferred reliably."
        : "Not enough release-date metadata yet to infer music age reliably.";

  const personalityTitle = lateNightRatio > 0.35 ? "The Night Explorer" : artistDensity > 0.4 ? "The Curious Crate Digger" : "The Comfort Collector";
  const personalitySubtitle = lateNightRatio > 0.35
    ? "You come alive after dark, with most plays landing late-night."
    : artistDensity > 0.4
      ? "You rotate artists often and keep discovering fresh sounds."
      : "You know exactly what you love and revisit it with intention.";

  return NextResponse.json({
    from: from.toISOString(),
    to: to.toISOString(),
    topSong: {
      title: topTrack[0]?._id ?? "No track yet",
      albumImageUrl: topTrack[0]?.albumImageUrl ?? undefined,
      subtitle: topTrack[0] ? `${topTrack[0].artistName} · ${topTrack[0].plays} plays` : "Play more music to unlock this slide",
    },
    topArtist: {
      title: topArtist[0]?._id ?? "No artist yet",
      subtitle: topArtist[0] ? `${topArtist[0].plays} total plays` : "Play more music to unlock this slide",
    },
    musicAge: {
      year: inferredMusicAge !== null ? String(inferredMusicAge) : "Unknown",
      subtitle: musicAgeSubtitle,
      weightedReleaseYear: weightedAvgReleaseYear !== null ? Number(weightedAvgReleaseYear.toFixed(1)) : null,
      confidence: inferredMusicAge !== null ? confidencePct : null,
      coverage: playCoveragePct,
      inferred: inferredMusicAge !== null,
    },
    emotionalMonth: {
      month: monthData[0]?._id ?? null,
      subtitle: monthData[0] ? `Peak activity month with ${monthData[0].plays} plays` : "Not enough data in selected range",
    },
    hiddenGem: hiddenGem[0] ?? null,
    favoriteEra: {
      title: favoriteEra,
      subtitle: daypartData[0] ? `${daypartData[0].plays} plays in your strongest listening window` : "Not enough plays in selected range",
    },
    forgottenFavorite: forgotten
      ? {
          title: forgotten.trackName,
          albumImageUrl: forgotten?.albumImageUrl ?? undefined,
          subtitle: `${forgotten.artistName} · resurfaced after ${Math.round(forgotten.gapDays)} days`,
        }
      : { title: "No rediscovery yet", subtitle: "Keep listening to unlock long-gap rediscoveries" },
    personality: {
      title: personalityTitle,
      subtitle: personalitySubtitle,
    },
  });
}

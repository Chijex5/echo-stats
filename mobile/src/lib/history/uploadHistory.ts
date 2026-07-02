import { File } from "expo-file-system";
import type * as DocumentPicker from "expo-document-picker";
import { apiFetch } from "@/lib/api/client";

// Shared Spotify streaming-history upload pipeline, used by both the
// onboarding import screen and the re-sync screen. The server dedupes on a
// unique (userId, ts, spotifyTrackUri) index, so re-uploading files that
// overlap already-imported history is always safe — overlapping plays come
// back counted as `duplicates`.

export interface RawEntry {
  ts: string;
  platform?: string | null;
  ms_played: number;
  master_metadata_track_name: string | null;
  master_metadata_album_artist_name: string | null;
  master_metadata_album_album_name: string | null;
  spotify_track_uri: string | null;
  reason_start?: string | null;
  reason_end?: string | null;
  shuffle?: boolean | null;
  skipped?: boolean | null;
  offline?: boolean | null;
}

export interface UploadTotals {
  totalReceived: number;
  totalFiltered: number;
  totalInserted: number;
  totalDuplicates: number;
  yearSpan: number;
}

export type UploadProgress = (pct: number, label: string) => void;

const BATCH_SIZE = 2_000;

function chunk<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) chunks.push(arr.slice(i, i + size));
  return chunks;
}

export function getYearSpan(entries: RawEntry[]): number {
  const years = entries.map((e) => new Date(e.ts).getFullYear()).filter((y) => !isNaN(y));
  return years.length ? Math.max(...years) - Math.min(...years) + 1 : 0;
}

/** Picks the JSON files out of a document-picker result, or null if none. */
export function filterJsonAssets(assets: DocumentPicker.DocumentPickerAsset[]) {
  const json = assets.filter((a) => a.mimeType === "application/json" || a.name.endsWith(".json"));
  return json.length ? json : null;
}

/**
 * Reads and parses the picked export files. Progress covers the 0–40 band
 * (each completed file advances evenly — a single text() read exposes no
 * per-byte progress).
 */
export async function readHistoryAssets(
  assets: DocumentPicker.DocumentPickerAsset[],
  onProgress: UploadProgress
): Promise<RawEntry[]> {
  const allEntries: RawEntry[] = [];

  for (let i = 0; i < assets.length; i++) {
    const asset = assets[i];
    onProgress(Math.round((i / assets.length) * 40), `Reading ${asset.name}…`);

    const text = await new File(asset.uri).text();

    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      throw new Error(`${asset.name} is not valid JSON.`);
    }
    if (!Array.isArray(parsed)) {
      throw new Error(`${asset.name} doesn't look like a Spotify streaming history file.`);
    }
    allEntries.push(...(parsed as RawEntry[]));

    onProgress(Math.round(((i + 1) / assets.length) * 40), `Reading ${asset.name}…`);
  }

  return allEntries;
}

/** Uploads entries in batches; progress covers the 40–100 band. */
export async function uploadHistoryEntries(entries: RawEntry[], onProgress: UploadProgress): Promise<UploadTotals> {
  const batches = chunk(entries, BATCH_SIZE);
  const totals: UploadTotals = {
    totalReceived: 0,
    totalFiltered: 0,
    totalInserted: 0,
    totalDuplicates: 0,
    yearSpan: getYearSpan(entries),
  };

  for (let b = 0; b < batches.length; b++) {
    onProgress(Math.round(40 + (b / batches.length) * 60), `Uploading batch ${b + 1} of ${batches.length}…`);

    const res = await apiFetch("/api/user/import-history", {
      method: "POST",
      body: JSON.stringify({ entries: batches[b] }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error ?? `Batch ${b + 1} failed.`);
    }

    const data = await res.json();
    totals.totalReceived += data.received;
    totals.totalFiltered += data.filtered;
    totals.totalInserted += data.inserted;
    totals.totalDuplicates += data.duplicates;

    onProgress(Math.round(40 + ((b + 1) / batches.length) * 60), `Uploading batch ${b + 1} of ${batches.length}…`);
  }

  onProgress(100, "Done");
  return totals;
}

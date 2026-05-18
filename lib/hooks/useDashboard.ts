import useSWR from "swr";

// ─── Shared fetcher ────────────────────────────────────────────────────────

const fetcher = <T>(url: string): Promise<T> =>
  fetch(url).then((r) => {
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return r.json() as Promise<T>;
  });

// ─── Top Tracks ────────────────────────────────────────────────────────────

export type Trend = "up" | "down" | "same";

export interface TopTrack {
  uri: string;
  trackName: string;
  artistName: string;
  albumName: string;
  playCount: number;
  previousPlayCount: number;
  totalMs: number;
  lastPlayed: string;
  firstPlayed: string;
  trend: Trend;
  color: string;
}

export interface TopTracksResponse {
  tracks: TopTrack[];
}

export function useTopTracks(limit = 10) {
  return useSWR<TopTracksResponse>(
    `/api/dashboard/top-tracks?limit=${limit}`,
    fetcher<TopTracksResponse>,
    { revalidateOnFocus: false }
  );
}

// ─── Dashboard Stats ───────────────────────────────────────────────────────

export interface DashboardStatsResponse {
  totalPlays: number;
  totalHours: number;
  uniqueTrackCount: number;
  uniqueArtistCount: number;
  firstPlay: string | null;
  streak: number;
  nightPct: number;
}

export function useDashboardStats() {
  return useSWR<DashboardStatsResponse>(
    "/api/dashboard/stats",
    fetcher<DashboardStatsResponse>,
    { revalidateOnFocus: false }
  );
}

// ─── Top Artists ───────────────────────────────────────────────────────────

export interface SparklinePoint {
  v: number;
}

export interface TopArtist {
  name: string;
  initials: string;
  plays: number;
  delta: number;
  trend: Trend;
  deltaLabel: string;
  color: string;
  sparkline: SparklinePoint[];
}

export interface TopArtistsResponse {
  artists: TopArtist[];
}

export function useTopArtists(limit = 8) {
  return useSWR<TopArtistsResponse>(
    `/api/dashboard/top-artists?limit=${limit}`,
    fetcher<TopArtistsResponse>,
    { revalidateOnFocus: false }
  );
}

// ─── Heatmap ───────────────────────────────────────────────────────────────

export interface HeatmapCell {
  date: string;
  plays: number;
}

export interface HeatmapResponse {
  cells: HeatmapCell[];
}

export function useHeatmap() {
  return useSWR<HeatmapResponse>(
    "/api/dashboard/heatmap",
    fetcher<HeatmapResponse>,
    { revalidateOnFocus: false }
  );
}

// ─── Insights ──────────────────────────────────────────────────────────────

export interface HiddenGem {
  _id: string;
  trackName: string;
  artistName: string;
  plays: number;
}

export interface GenreDrift {
  from: string | null;  // top artist name, previous 30 days
  to: string | null;    // top artist name, current 30 days
  drifted: boolean;
}

export interface EmotionalProfile {
  calm: number;       // % of plays in 06:00–11:59
  neutral: number;    // % of plays in 12:00–17:59
  energetic: number;  // % of plays in 18:00–21:59
  intense: number;    // % of plays in 22:00–05:59
  dominantLabel: "Calm" | "Neutral" | "High Energy" | "Late Night";
}

export interface DecadeBar {
  decade: number;     // e.g. 2010
  label: string;      // e.g. "2010s"
  count: number;
  heightPct: number;  // 0–100 relative to the tallest bar
  isTop: boolean;
}

export interface FavoriteDecade {
  bars: DecadeBar[];
  topDecade: string;  // e.g. "2010s"
  topPct: number;     // % of total decade plays
}

export interface FirstSong {
  trackName: string;
  artistName: string;
  ts: string; // ISO date string
}

export interface LongestStreak {
  trackName: string;
  artistName: string;
  days: number;
}

export interface InsightsResponse {
  hiddenGem: HiddenGem | null;
  genreDrift: GenreDrift;
  emotionalProfile: EmotionalProfile;
  favoriteDecade: FavoriteDecade;
  firstSong: FirstSong | null;
  longestStreak: LongestStreak | null;
}

export function useInsights() {
  return useSWR<InsightsResponse>(
    "/api/dashboard/insights",
    fetcher<InsightsResponse>,
    { revalidateOnFocus: false }
  );
}

// ─── Now Playing + Sync ──────────────────────────────────────────────────────

export interface NowPlayingSyncTrack {
  trackName: string;
  artistName: string;
}

export interface NowPlayingSyncResponse {
  nowPlaying: NowPlayingSyncTrack | null;
  lastPlayed: NowPlayingSyncTrack | null;
  sync: {
    processed: number;
    inserted: number;
    syncedAt: string;
  };
}

export function useNowPlayingSync(refreshIntervalMs = 60_000) {
  return useSWR<NowPlayingSyncResponse>(
    "/api/dashboard/now-playing",
    fetcher<NowPlayingSyncResponse>,
    {
      revalidateOnFocus: false,
      refreshInterval: refreshIntervalMs,
    }
  );
}

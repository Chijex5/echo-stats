import useSWR from "swr";
import { UserMusicAnalysis } from "../musicAnalysis";

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
  albumImageUrl: string | null;
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
  albumImageUrl: string | null;
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
  albumImageUrl: string | null;
  ts: string; // ISO date string
}

export interface LongestStreak {
  trackName: string;
  artistName: string;
  albumImageUrl: string | null;
  days: number;
}

export interface InsightsResponse {
  hiddenGem: HiddenGem | null;
  genreDrift: GenreDrift;
  emotionalProfile: EmotionalProfile;
  favoriteDecade: FavoriteDecade;
  firstSong: FirstSong | null;
  analysisResult: UserMusicAnalysis;
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
  albumImageUrl: string | null;
}

export interface NowPlayingSyncResponse {
  nowPlaying: NowPlayingSyncTrack | null;
  lastPlayed: NowPlayingSyncTrack | null;
  spotifyAuth?: {
    nowPlaying: {
      authorized: boolean;
      reconnectRequired: boolean;
      status: number;
      message: string | null;
    };
  };
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

// ─── Timeline Explorer ─────────────────────────────────────────────────────

export interface TimelineCell {
  date: string;
  plays: number;
  intensity: number;
}

export interface TimelineSnapshotTrack {
  title: string;
  artist: string;
  plays: number;
}

export interface TimelineResponse {
  yearLabels: string[];
  cells: TimelineCell[];
  selectedRange: {
    label: string;
    days: number;
  };
  snapshot: {
    label: string;
    tracks: TimelineSnapshotTrack[];
    collage: string[];
    topArtist: string;
  };
}

export function useTimelineExplorer() {
  return useSWR<TimelineResponse>(
    "/api/dashboard/timeline",
    fetcher<TimelineResponse>,
    { revalidateOnFocus: false }
  );
}

// ─── Visual Analytics ──────────────────────────────────────────────────────

export interface StreamPoint {
  date: string;
  value: number;
}

export interface GenrePoint {
  name: string;
  value: number;
}

export interface MoodPoint {
  happy: number;
  sad: number;
  energetic: number;
  calm: number;
}

export interface YearPoint {
  year: string;
  value: number;
}

export interface VisualAnalyticsResponse {
  streamData: StreamPoint[];
  genreData: GenrePoint[];
  genreCount: number;
  moodData: MoodPoint[];
  yearData: YearPoint[];
}

export function useVisualAnalytics() {
  return useSWR<VisualAnalyticsResponse>(
    "/api/dashboard/visual-analytics",
    fetcher<VisualAnalyticsResponse>,
    { revalidateOnFocus: false }
  );
}

// ─── Rediscovery ───────────────────────────────────────────────────────────

export interface RediscoveryCard {
  key: string;
  title: string;
  count: number;
  desc: string;
  color: string;
  shadow: string;
}

export interface RediscoveryResponse {
  cards: RediscoveryCard[];
}

export function useRediscovery() {
  return useSWR<RediscoveryResponse>(
    "/api/dashboard/rediscovery",
    fetcher<RediscoveryResponse>,
    { revalidateOnFocus: false }
  );
}

// ─── Story Preview ─────────────────────────────────────────────────────────

export interface StoryPreviewBar {
  month: number;
  heightPct: number;
}

export interface StoryPreviewResponse {
  slideCount: number;
  newArtists: number;
  platformCopy: string;
  bars: StoryPreviewBar[];
}

export function useStoryPreview() {
  return useSWR<StoryPreviewResponse>(
    "/api/dashboard/story-preview",
    fetcher<StoryPreviewResponse>,
    { revalidateOnFocus: false }
  );
}

// ─── Dedicated Timeline Page ───────────────────────────────────────────────

export interface TimelinePageTrack {
  title: string;
  artist: string;
  albumImageUrl?: string;
  color: string;
}

export interface TimelinePagePeriod {
  id: string;
  label: string;
  year: number;
  monthIdx: number;
  monthName: string;
  topGenre: string;
  mood: string;
  moodScore: number;
  totalHours: number;
  uniqueArtists: number;
  topArtist: string;
  topArtistColor: string;
  accent: string;
  tracks: TimelinePageTrack[];
  story?: {
    tag: string;
    line: string;
  };
}

export interface TimelinePageInsight {
  label: string;
  title: string;
  sub: string;
  accent: string;
}

export interface TimelinePageResponse {
  periods: TimelinePagePeriod[];
  yearLabels: string[];
  yearHours: Array<{ year: string; v: number }>;
  range?: {
    startYear: number;
    endYear: number;
  };
  insights: TimelinePageInsight[];
}

export function useTimelinePage() {
  return useSWR<TimelinePageResponse>(
    "/api/dashboard/timeline-page",
    fetcher<TimelinePageResponse>,
    { revalidateOnFocus: false }
  );
}

// ─── Story Mode ───────────────────────────────────────────────────────────

export interface StoryModeResponse {
  from: string;
  to: string;
  topSong: { title: string; subtitle: string };
  topArtist: { title: string; subtitle: string };
  musicAge: {
    year: string;
    subtitle: string;
    weightedReleaseYear?: number | null;
    confidence?: number | null;
    coverage?: number;
    inferred?: boolean;
  };
  emotionalMonth: { month: number | null; subtitle: string };
  hiddenGem: { trackName: string; artistName: string; plays: number } | null;
  favoriteEra: { title: string; subtitle: string };
  forgottenFavorite: { title: string; subtitle: string };
  personality: { title: string; subtitle: string };
}

export function useStoryMode(from?: string, to?: string) {
  const qs = new URLSearchParams();
  if (from) qs.set("from", from);
  if (to) qs.set("to", to);
  const suffix = qs.toString() ? `?${qs.toString()}` : "";

  return useSWR<StoryModeResponse>(
    `/api/dashboard/story${suffix}`,
    fetcher<StoryModeResponse>,
    { revalidateOnFocus: false }
  );
}

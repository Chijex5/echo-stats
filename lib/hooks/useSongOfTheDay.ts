import useSWR from "swr";

// ─── Shared fetcher ────────────────────────────────────────────────────────

const fetcher = <T>(url: string): Promise<T> =>
  fetch(url).then((r) => {
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return r.json() as Promise<T>;
  });

// ─── Icon name union — matches the string literals the route emits ─────────
// The component maps these to Lucide icons client-side.

export type AlgoIconName = "Calendar" | "Heart" | "Moon" | "Sparkles" | "CloudRain";
export type StoryIconName = "Repeat" | "Moon" | "Calendar" | "CloudRain";

// ─── Sub-shapes ────────────────────────────────────────────────────────────

export interface SotdSong {
  uri: string;
  title: string;
  artist: string;
  album: string;
  released: string;
  gradientFrom: string; // hex colour, e.g. "#3B82F6"
  gradientTo: string;
  gradientClass: string; // Tailwind gradient class
}

export interface SotdStats {
  pastPlays: number;
  lastPlayed: string;         // human label e.g. "124 days ago"
  lastPlayedDate: string;     // ISO date string
  daysSinceLastPlay: number;
  favoriteMonth: string;      // e.g. "September 2024"
  peakMonthPlays: number;
  nightPct: number;           // 0–100
  dominantSeason: string;     // "spring" | "summer" | "autumn" | "winter"
  totalMinutes: number;
}

export interface StoryBeat {
  stat: string;
  label: string;
  icon: StoryIconName;
}

export interface SnapshotTrack {
  title: string;
  artist: string;
  color: string; // Tailwind gradient class
}

export interface SnapshotArtist {
  name: string;
  initials: string;
  plays: number;
  color: string;
}

export interface MemorySnapshot {
  snapshotTracks: SnapshotTrack[];   // top 4 co-played tracks
  snapshotCollage: string[];         // up to 9 gradient classes for the photo grid
  topArtist: SnapshotArtist | null;
  peakMonthHours: number;
  peakMonthLabel: string;
}

export interface AlgoReason {
  icon: AlgoIconName;
  label: string;
  desc: string;
}

export interface HourHeatPoint {
  hour: number; // 0–23
  v: number;    // play count
}

export interface MonthTrendPoint {
  m: string;  // 3-char month e.g. "Jan"
  v: number;  // play count
}

export interface RepeatCurvePoint {
  v: number; // days that had this repeat count
}

export interface MoodReconstruction {
  hourHeat: HourHeatPoint[];
  peakHourLabel: string;          // e.g. "12:00 AM"
  monthTrend: MonthTrendPoint[];  // 12 points
  repeatCurve: RepeatCurvePoint[];
  maxRepeatsInOneDay: number;
}

export interface RelatedTrack {
  title: string;
  artist: string;
  color: string;
  tag: string;
  lastPlayed: string;
}

export interface DailyRitual {
  streakDays: number;
  totalRediscovered: number;
  avgAffinityScore: number;
  savedToLibrary: number;
}

// ─── Root response ─────────────────────────────────────────────────────────

export interface SongOfTheDayResponse {
  song: SotdSong;
  stats: SotdStats;
  storyBeats: StoryBeat[];
  memorySnapshot: MemorySnapshot;
  algoReasons: AlgoReason[];
  affinityScore: number;
  affinityLabel: string;
  moodReconstruction: MoodReconstruction;
  related: RelatedTrack[];
  dailyRitual: DailyRitual;
}

// ─── Hook ──────────────────────────────────────────────────────────────────

export function useSongOfTheDay() {
  return useSWR<SongOfTheDayResponse>(
    "/api/dashboard/song-of-the-day",
    fetcher<SongOfTheDayResponse>,
    {
      revalidateOnFocus: false,
      // Refresh once per hour at most; the song changes daily so this is safe
      dedupingInterval: 60 * 60 * 1000,
    }
  );
}
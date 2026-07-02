// Response types ported verbatim from the web app's lib/hooks/useDashboard.ts
// and app/api/dashboard/profile/route.ts. Field names and shapes must match
// the API exactly — these are wire-format types, not Mongoose document types
// (ObjectId/Date become string over JSON).

export type Trend = "up" | "down" | "same";

// ─── Top Tracks ────────────────────────────────────────────────────────────

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

// ─── Top Artists ───────────────────────────────────────────────────────────

export interface SparklinePoint {
  v: number;
}

export interface TopArtist {
  name: string;
  initials: string;
  plays: number;
  imageUrl: string | null;
  delta: number;
  trend: Trend;
  deltaLabel: string;
  color: string;
  sparkline: SparklinePoint[];
}

export interface TopArtistsResponse {
  artists: TopArtist[];
}

// ─── Heatmap ───────────────────────────────────────────────────────────────

export interface HeatmapCell {
  date: string;
  plays: number;
}

export interface HeatmapResponse {
  cells: HeatmapCell[];
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
  from: string | null;
  to: string | null;
  drifted: boolean;
}

export interface EmotionalProfile {
  calm: number;
  neutral: number;
  energetic: number;
  intense: number;
  dominantLabel: "Calm" | "Neutral" | "High Energy" | "Late Night";
}

export interface DecadeBar {
  decade: number;
  label: string;
  count: number;
  heightPct: number;
  isTop: boolean;
}

export interface FavoriteDecade {
  bars: DecadeBar[];
  topDecade: string;
  topPct: number;
}

export interface FirstSong {
  trackName: string;
  artistName: string;
  albumImageUrl: string | null;
  ts: string;
}

export interface LongestStreak {
  trackName: string;
  artistName: string;
  albumImageUrl: string | null;
  days: number;
}

export interface MusicAgeProfile {
  avgTrackAgeYears: number;
  weightedAvgTrackAgeYears: number;
  eraBreakdown: Record<string, { msPlayed: number; percentage: number }>;
  dominantReleaseYear: number | null;
}

export interface GenreNode {
  genre: string;
  msPlayed: number;
  percentage: number;
  score: number;
}

export interface GenreEdge {
  source: string;
  target: string;
  weight: number;
  affinityScore: number;
}

export interface GenreProfile {
  nodes: GenreNode[];
  edges: GenreEdge[];
  dnaEdges: [string, string, number][];
  topGenres: string[];
}

export interface UserMusicAnalysis {
  userId: string;
  totalStreams: number;
  totalMsPlayed: number;
  totalHoursPlayed: number;
  musicAge: MusicAgeProfile;
  genreProfile: GenreProfile;
  analyzedAt: string;
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

// ─── Now Playing + Sync ─────────────────────────────────────────────────────

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

// ─── Import Status ──────────────────────────────────────────────────────────

export interface ImportStatusResponse {
  lastImportAt: string | null;
  daysSinceLastImport: number | null;
  totalEntries: number;
  latestEntryTs: string | null;
  resyncIntervalDays: number;
  dueForResync: boolean;
}

// ─── Timeline Explorer ──────────────────────────────────────────────────────

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

// ─── Visual Analytics ───────────────────────────────────────────────────────

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

// ─── Rediscovery ─────────────────────────────────────────────────────────────

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

// ─── Story Preview ───────────────────────────────────────────────────────────

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

// ─── Dedicated Timeline Page ─────────────────────────────────────────────────

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
  topArtistImageUrl?: string;
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

// ─── Story Mode ───────────────────────────────────────────────────────────────

export interface StoryModeResponse {
  from: string;
  to: string;
  topSong: { title: string; albumImageUrl?: string; subtitle: string };
  topArtist: { title: string; subtitle: string; artistImageUrl?: string };
  musicAge: {
    year: string;
    subtitle: string;
    weightedReleaseYear?: number | null;
    confidence?: number | null;
    coverage?: number;
    inferred?: boolean;
  };
  emotionalMonth: { month: number | null; subtitle: string };
  hiddenGem: { trackName: string; albumImageUrl?: string; artistName: string; plays: number } | null;
  favoriteEra: { title: string; subtitle: string };
  forgottenFavorite: { title: string; albumImageUrl?: string; subtitle: string };
  personality: { title: string; subtitle: string };
}

// ─── Song of the Day ─────────────────────────────────────────────────────────

export type SotdAlgoIconName = "Calendar" | "Heart" | "Moon" | "Sparkles" | "CloudRain";
export type SotdStoryIconName = "Repeat" | "Moon" | "Calendar" | "CloudRain";

export interface SotdSong {
  uri: string;
  title: string;
  artist: string;
  albumImageUrl: string | null;
  artistImageUrl?: string;
  album: string;
  released: string;
  gradientFrom: string;
  gradientTo: string;
  gradientClass: string;
}

export interface SotdStats {
  pastPlays: number;
  lastPlayed: string;
  lastPlayedDate: string;
  daysSinceLastPlay: number;
  favoriteMonth: string;
  peakMonthPlays: number;
  nightPct: number;
  dominantSeason: string;
  totalMinutes: number;
}

export interface SotdStoryBeat {
  stat: string;
  label: string;
  icon: SotdStoryIconName;
}

export interface SotdSnapshotTrack {
  title: string;
  albumImageUrl?: string | null;
  artistImageUrl?: string;
  artist: string;
  color: string;
}

export interface SotdSnapshotArtist {
  name: string;
  initials: string;
  plays: number;
  color: string;
  imageUrl?: string | null;
}

export interface SotdMemorySnapshot {
  snapshotTracks: SotdSnapshotTrack[];
  snapshotCollage: string[];
  topArtist: SotdSnapshotArtist | null;
  peakMonthHours: number;
  peakMonthLabel: string;
}

export interface SotdAlgoReason {
  icon: SotdAlgoIconName;
  label: string;
  desc: string;
}

export interface SotdHourHeatPoint {
  hour: number;
  v: number;
}

export interface SotdMonthTrendPoint {
  m: string;
  v: number;
}

export interface SotdRepeatCurvePoint {
  v: number;
}

export interface SotdMoodReconstruction {
  hourHeat: SotdHourHeatPoint[];
  peakHourLabel: string;
  monthTrend: SotdMonthTrendPoint[];
  repeatCurve: SotdRepeatCurvePoint[];
  maxRepeatsInOneDay: number;
}

export interface SotdRelatedTrack {
  title: string;
  albumImageUrl?: string | null;
  artistImageUrl?: string;
  artist: string;
  color: string;
  tag: string;
  lastPlayed: string;
}

export interface SotdDailyRitual {
  streakDays: number;
  totalRediscovered: number;
  avgAffinityScore: number;
  savedToLibrary: number;
}

export interface SongOfTheDayResponse {
  song: SotdSong;
  stats: SotdStats;
  storyBeats: SotdStoryBeat[];
  memorySnapshot: SotdMemorySnapshot;
  algoReasons: SotdAlgoReason[];
  affinityScore: number;
  affinityLabel: string;
  moodReconstruction: SotdMoodReconstruction;
  related: SotdRelatedTrack[];
  dailyRitual: SotdDailyRitual;
}

// ─── Profile ───────────────────────────────────────────────────────────────
// Ported from app/api/dashboard/profile/route.ts's actual NextResponse.json
// payload — milestones is an OBJECT with 5 named keys, not an array.

export type SongMoment = {
  trackName: string;
  artistName: string;
  ts?: string;
  firstPlayed?: string;
  plays?: number;
} | null;

export interface ProfileResponse {
  user: {
    name: string;
    email: string;
    avatarUrl: string | null;
    spotifyProduct: string;
    connectedAt: string | null;
    accountAge: string;
  };
  summary: {
    totalSongsAnalyzed: number;
    yearsImported: number;
    totalArtistsDiscovered: number;
    favoriteGenre: string;
    listeningStreak: number;
    connectedDate: string;
    totalHoursListened: number;
    totalPlays: number;
  };
  identity: {
    listeningPersonality: string;
    musicAge: string;
    favoriteDecade: string;
    hiddenGenre: string;
    topListeningHour: string;
    topListeningSeason: string;
  };
  milestones: {
    firstImportedSong: SongMoment;
    firstSyncedSong: SongMoment;
    oldestFavoriteTrack: SongMoment;
    longestObsession: SongMoment;
    latestGenreShift: { from: string | null; to: string | null };
  };
  services: {
    spotifyConnected: boolean;
    lastSync: string | null;
    syncHealth: string;
    archiveImported: boolean;
    storageUsed: string;
  };
  highlights: {
    topAlbums: Array<{ _id: string; plays: number; albumImageUrl?: string; artistName: string }>;
    mostPlayedArtist: { _id: string; artistImageUrl?: string; plays: number } | null;
    favoriteSongThisYear: { _id: string; trackName: string; artistName: string; plays: number } | null;
    forgottenFavoriteCount: number;
  };
}

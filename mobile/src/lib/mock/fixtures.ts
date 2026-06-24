import type {
  DashboardStatsResponse,
  TopTracksResponse,
  TopArtistsResponse,
  HeatmapResponse,
  InsightsResponse,
  NowPlayingSyncResponse,
  TimelineResponse,
  TimelinePageResponse,
  VisualAnalyticsResponse,
  RediscoveryResponse,
  StoryPreviewResponse,
  StoryModeResponse,
  ProfileResponse,
  SongOfTheDayResponse,
  Trend,
} from "@/lib/api/hooks/types";

// Fixtures for EXPO_PUBLIC_MOCK=1 dev preview mode — keyed by API pathname
// (no query string). Shapes are hand-built to match every field each screen
// actually reads (not just the TS type), including the specific class-string
// vocabularies (ArtistAvatar's GRADIENT_HEX, timelineColors.ts, sotdColors.ts)
// each color/accent field is looked up against.

const TRACK_NAMES = [
  "Midnight Static", "Paper Lanterns", "Velvet Static", "Slow Burn", "Neon Rust",
  "Quiet Riot, Pt. II", "Holographic", "Borrowed Time", "Tideline", "Afterglow",
  "Marigold", "Static Bloom", "Coastal Drift", "Embers", "Satellite",
];
const ARTIST_FOR_TRACK = [
  "Glass Horizon", "Coastal Drift", "Nova Bloom", "Echo Valley", "The Wires",
  "Marigold", "Kilo Moon", "Pale Fire", "Driftwood", "Glass Horizon",
  "Nova Bloom", "Echo Valley", "The Wires", "Kilo Moon", "Pale Fire",
];
const ALBUM_FOR_TRACK = [
  "Afterglow", "Tideline", "Static Bloom", "Embers", "Voltage",
  "Quiet Riot", "Satellite", "Borrowed Time", "Driftwood", "Afterglow",
  "Static Bloom", "Embers", "Voltage", "Satellite", "Borrowed Time",
];
const TRENDS: Trend[] = ["up", "down", "same"];

const topTracksFixture: TopTracksResponse = {
  tracks: TRACK_NAMES.map((trackName, i) => {
    const playCount = 420 - i * 19;
    const trend = TRENDS[i % TRENDS.length];
    const previousPlayCount = trend === "up" ? playCount - 30 : trend === "down" ? playCount + 25 : playCount;
    return {
      uri: `spotify:track:mock-${i}`,
      trackName,
      artistName: ARTIST_FOR_TRACK[i],
      albumName: ALBUM_FOR_TRACK[i],
      playCount,
      previousPlayCount,
      totalMs: (180 + i * 7) * 1000,
      albumImageUrl: null,
      lastPlayed: new Date(Date.now() - i * 36e5).toISOString(),
      firstPlayed: new Date(Date.now() - (400 + i * 30) * 86400000).toISOString(),
      trend,
      color: "from-blue-500 to-violet-600",
    };
  }),
};

const ARTIST_NAMES = [
  "Glass Horizon", "Nova Bloom", "Echo Valley", "The Wires", "Kilo Moon",
  "Pale Fire", "Marigold", "Coastal Drift", "Driftwood", "Static Low",
];
const ARTIST_GRADIENT_KEYS = [
  "from-red-500 to-orange-500", "from-purple-500 to-indigo-500", "from-pink-500 to-rose-400",
  "from-emerald-400 to-cyan-500", "from-blue-500 to-cyan-400", "from-amber-500 to-orange-400",
  "from-green-500 to-emerald-400", "from-red-600 to-pink-600", "from-violet-500 to-purple-600",
  "from-sky-400 to-blue-600",
];

const topArtistsFixture: TopArtistsResponse = {
  artists: ARTIST_NAMES.map((name, i) => {
    const plays = 980 - i * 64;
    const trend = TRENDS[i % TRENDS.length];
    const delta = trend === "up" ? 12 + i : trend === "down" ? -(8 + i) : 0;
    return {
      name,
      initials: name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase(),
      plays,
      imageUrl: null,
      delta,
      trend,
      deltaLabel: trend === "up" ? `+${delta}% this month` : trend === "down" ? `${delta}% this month` : "Steady this month",
      color: ARTIST_GRADIENT_KEYS[i],
      sparkline: Array.from({ length: 8 }, (_, j) => ({ v: 30 + ((i * 7 + j * 13) % 60) })),
    };
  }),
};

const heatmapFixture: HeatmapResponse = {
  cells: Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 86400000).toISOString().slice(0, 10),
    plays: Math.round(4 + 10 * Math.abs(Math.sin(i / 3))),
  })),
};

const ERA_KEYS = ["pre-70s", "70s", "80s", "90s", "2000s", "2010s", "2020s+"];
const ERA_PCTS = [1, 2, 6, 14, 22, 30, 25];

const insightsFixture: InsightsResponse = {
  hiddenGem: {
    _id: "mock-gem-1",
    trackName: "Borrowed Time",
    albumImageUrl: null,
    artistName: "Pale Fire",
    plays: 7,
  },
  genreDrift: { from: "indie folk", to: "synthwave", drifted: true },
  emotionalProfile: { calm: 28, neutral: 22, energetic: 35, intense: 15, dominantLabel: "High Energy" },
  favoriteDecade: {
    bars: [
      { decade: 1980, label: "80s", count: 120, heightPct: 35, isTop: false },
      { decade: 1990, label: "90s", count: 180, heightPct: 52, isTop: false },
      { decade: 2000, label: "2000s", count: 260, heightPct: 75, isTop: false },
      { decade: 2010, label: "2010s", count: 340, heightPct: 100, isTop: true },
      { decade: 2020, label: "2020s", count: 210, heightPct: 61, isTop: false },
    ],
    topDecade: "2010s",
    topPct: 34,
  },
  firstSong: {
    trackName: "Coastal Drift",
    artistName: "Driftwood",
    albumImageUrl: null,
    ts: "2019-03-14T08:22:00.000Z",
  },
  analysisResult: {
    userId: "mock-user-1",
    totalStreams: 18432,
    totalMsPlayed: 612.4 * 3600 * 1000,
    totalHoursPlayed: 612.4,
    musicAge: {
      avgTrackAgeYears: 9.6,
      weightedAvgTrackAgeYears: 7.2,
      eraBreakdown: Object.fromEntries(
        ERA_KEYS.map((k, i) => [k, { msPlayed: ERA_PCTS[i] * 1e8, percentage: ERA_PCTS[i] }])
      ),
      dominantReleaseYear: 2017,
    },
    genreProfile: {
      nodes: [
        { genre: "indie folk", msPlayed: 9.2e8, percentage: 24, score: 0.9 },
        { genre: "synthwave", msPlayed: 7.4e8, percentage: 19, score: 0.82 },
        { genre: "dream pop", msPlayed: 6.1e8, percentage: 16, score: 0.74 },
        { genre: "alt rock", msPlayed: 5.3e8, percentage: 14, score: 0.68 },
        { genre: "lo-fi", msPlayed: 4.2e8, percentage: 11, score: 0.6 },
        { genre: "ambient", msPlayed: 3.1e8, percentage: 8, score: 0.5 },
        { genre: "electropop", msPlayed: 2.3e8, percentage: 6, score: 0.4 },
        { genre: "post-rock", msPlayed: 1.6e8, percentage: 4, score: 0.3 },
      ],
      edges: [],
      dnaEdges: [
        ["indie folk", "dream pop", 0.6],
        ["synthwave", "electropop", 0.5],
      ],
      topGenres: ["indie folk", "synthwave", "dream pop"],
    },
    analyzedAt: new Date().toISOString(),
  },
  longestStreak: {
    trackName: "Static Bloom",
    artistName: "Nova Bloom",
    albumImageUrl: null,
    days: 14,
  },
};

const nowPlayingFixture: NowPlayingSyncResponse = {
  nowPlaying: { trackName: "Midnight Static", artistName: "Glass Horizon", albumImageUrl: null },
  lastPlayed: { trackName: "Paper Lanterns", artistName: "Coastal Drift", albumImageUrl: null },
  sync: { processed: 12, inserted: 3, syncedAt: new Date().toISOString() },
};

const timelineExplorerFixture: TimelineResponse = {
  yearLabels: ["2023", "2024", "2025"],
  cells: Array.from({ length: 371 }, (_, i) => ({
    date: new Date(Date.now() - (370 - i) * 86400000).toISOString().slice(0, 10),
    plays: Math.round(Math.max(0, 8 * Math.abs(Math.sin(i / 9)) - 1)),
    intensity: Math.abs(Math.sin(i / 9)),
  })),
  selectedRange: { label: "Last 12 months", days: 365 },
  snapshot: {
    label: "Spring 2025",
    tracks: [
      { title: "Midnight Static", artist: "Glass Horizon", plays: 42 },
      { title: "Holographic", artist: "Kilo Moon", plays: 31 },
      { title: "Embers", artist: "Echo Valley", plays: 27 },
    ],
    collage: [],
    topArtist: "Glass Horizon",
  },
};

const PERIOD_GRADIENT_KEYS = [
  "from-emerald-400 to-cyan-500", "from-blue-500 to-violet-600", "from-pink-500 to-orange-400",
  "from-amber-400 to-orange-500", "from-purple-500 to-indigo-500", "from-green-500 to-emerald-400",
];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const MOODS = ["Energetic", "Calm", "Nostalgic", "Upbeat", "Reflective"];

function buildPeriods(): TimelinePageResponse["periods"] {
  const periods: TimelinePageResponse["periods"] = [];
  const now = new Date();
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const idx = 13 - i;
    periods.push({
      id: `period-${d.getFullYear()}-${d.getMonth()}`,
      label: `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`,
      year: d.getFullYear(),
      monthIdx: d.getMonth(),
      monthName: MONTH_NAMES[d.getMonth()],
      topGenre: ["indie folk", "synthwave", "dream pop"][idx % 3],
      mood: MOODS[idx % MOODS.length],
      moodScore: 4 + (idx % 6),
      totalHours: 30 + idx * 3,
      uniqueArtists: 18 + idx,
      topArtist: ARTIST_NAMES[idx % ARTIST_NAMES.length],
      topArtistColor: PERIOD_GRADIENT_KEYS[idx % PERIOD_GRADIENT_KEYS.length],
      accent: "from-emerald-400 to-cyan-500",
      tracks: [
        { title: TRACK_NAMES[idx % TRACK_NAMES.length], artist: ARTIST_FOR_TRACK[idx % ARTIST_FOR_TRACK.length], color: PERIOD_GRADIENT_KEYS[(idx + 1) % PERIOD_GRADIENT_KEYS.length] },
        { title: TRACK_NAMES[(idx + 3) % TRACK_NAMES.length], artist: ARTIST_FOR_TRACK[(idx + 3) % ARTIST_FOR_TRACK.length], color: PERIOD_GRADIENT_KEYS[(idx + 2) % PERIOD_GRADIENT_KEYS.length] },
      ],
      story: idx % 4 === 0 ? { tag: "Throwback", line: "The month you discovered three new favorite artists." } : undefined,
    });
  }
  return periods;
}

const timelinePageFixture: TimelinePageResponse = {
  periods: buildPeriods(),
  yearLabels: ["2024", "2025"],
  yearHours: [
    { year: "2024", v: 320 },
    { year: "2025", v: 292 },
  ],
  range: { startYear: 2024, endYear: 2025 },
  insights: [
    { label: "Biggest jump", title: "Synthwave surged 18% this spring", sub: "Your most dramatic genre shift in a year.", accent: "text-spotify" },
    { label: "New discovery", title: "Kilo Moon entered your top 10", sub: "First appeared three months ago.", accent: "text-cyan-300" },
    { label: "Late-night listening", title: "32% of plays happen after 11pm", sub: "Higher than your yearly average.", accent: "text-violet-300" },
  ],
};

const visualAnalyticsFixture: VisualAnalyticsResponse = {
  streamData: Array.from({ length: 12 }, (_, i) => ({
    date: `2025-${String(i + 1).padStart(2, "0")}`,
    value: 40 + Math.round(20 * Math.sin(i / 2)),
  })),
  genreData: [
    { name: "indie folk", value: 24 },
    { name: "synthwave", value: 19 },
    { name: "dream pop", value: 16 },
  ],
  genreCount: 18,
  moodData: [{ happy: 30, sad: 12, energetic: 35, calm: 23 }],
  yearData: [
    { year: "2023", value: 280 },
    { year: "2024", value: 320 },
    { year: "2025", value: 292 },
  ],
};

const rediscoveryFixture: RediscoveryResponse = {
  cards: [
    { key: "forgotten-1", title: "Forgotten favorites", count: 47, desc: "Tracks you loved but haven't played in 6+ months.", color: "rgba(24,216,126,0.8)", shadow: "rgba(24,216,126,0.3)" },
    { key: "rising-1", title: "Rising again", count: 12, desc: "Old tracks creeping back into rotation.", color: "rgba(96,165,250,0.8)", shadow: "rgba(96,165,250,0.3)" },
    { key: "deep-cut-1", title: "Deep cuts", count: 63, desc: "Played once or twice, never since.", color: "rgba(167,139,250,0.8)", shadow: "rgba(167,139,250,0.3)" },
    { key: "anniversary-1", title: "One year ago today", count: 8, desc: "What you were obsessed with this time last year.", color: "rgba(251,113,133,0.8)", shadow: "rgba(251,113,133,0.3)" },
  ],
};

const storyPreviewFixture: StoryPreviewResponse = {
  slideCount: 8,
  newArtists: 34,
  platformCopy: "Your year in music, replayed.",
  bars: Array.from({ length: 12 }, (_, i) => ({ month: i + 1, heightPct: 20 + Math.round(60 * Math.abs(Math.sin(i))) })),
};

const storyModeFixture: StoryModeResponse = {
  from: "2025-01-01",
  to: "2025-06-24",
  topSong: { title: "Midnight Static", albumImageUrl: undefined, subtitle: "Glass Horizon · played 318 times" },
  topArtist: { title: "Glass Horizon", subtitle: "980 plays across 6 months", artistImageUrl: undefined },
  musicAge: { year: "2016", subtitle: "Your music skews indie-era 2010s", weightedReleaseYear: 2017, confidence: 0.82, coverage: 0.91, inferred: false },
  emotionalMonth: { month: 3, subtitle: "March was your most energetic month" },
  hiddenGem: { trackName: "Borrowed Time", albumImageUrl: undefined, artistName: "Pale Fire", plays: 7 },
  favoriteEra: { title: "2010s", subtitle: "34% of everything you played" },
  forgottenFavorite: { title: "Coastal Drift", albumImageUrl: undefined, subtitle: "Driftwood · last played 214 days ago" },
  personality: { title: "The Night Wanderer", subtitle: "Calm, late-night, emotionally driven listening." },
};

const profileFixture: ProfileResponse = {
  user: {
    name: "Alex Rivers",
    email: "alex.rivers@example.com",
    avatarUrl: null,
    spotifyProduct: "premium",
    connectedAt: "2019-03-14T08:22:00.000Z",
    accountAge: "6 years",
  },
  summary: {
    totalSongsAnalyzed: 18432,
    yearsImported: 6,
    totalArtistsDiscovered: 612,
    favoriteGenre: "indie folk",
    listeningStreak: 23,
    connectedDate: "March 14, 2019",
    totalHoursListened: 612.4,
    totalPlays: 18432,
  },
  identity: {
    listeningPersonality: "The Night Wanderer",
    musicAge: "9.6 years",
    favoriteDecade: "2010s",
    hiddenGenre: "dream pop",
    topListeningHour: "11 PM",
    topListeningSeason: "Autumn",
  },
  milestones: {
    firstImportedSong: { trackName: "Coastal Drift", artistName: "Driftwood", ts: "2019-03-14T08:22:00.000Z" },
    firstSyncedSong: { trackName: "Midnight Static", artistName: "Glass Horizon", ts: "2024-01-02T19:10:00.000Z" },
    oldestFavoriteTrack: { trackName: "Borrowed Time", artistName: "Pale Fire", firstPlayed: "2019-04-02T10:00:00.000Z" },
    longestObsession: { trackName: "Static Bloom", artistName: "Nova Bloom", plays: 318 },
    latestGenreShift: { from: "indie folk", to: "synthwave" },
  },
  services: {
    spotifyConnected: true,
    lastSync: new Date().toISOString(),
    syncHealth: "Healthy",
    archiveImported: true,
    storageUsed: "182 MB",
  },
  highlights: {
    topAlbums: [
      { _id: "Afterglow", plays: 318, albumImageUrl: undefined, artistName: "Glass Horizon" },
      { _id: "Static Bloom", plays: 260, albumImageUrl: undefined, artistName: "Nova Bloom" },
      { _id: "Embers", plays: 214, albumImageUrl: undefined, artistName: "Echo Valley" },
      { _id: "Voltage", plays: 190, albumImageUrl: undefined, artistName: "The Wires" },
      { _id: "Satellite", plays: 168, albumImageUrl: undefined, artistName: "Kilo Moon" },
      { _id: "Borrowed Time", plays: 142, albumImageUrl: undefined, artistName: "Pale Fire" },
    ],
    mostPlayedArtist: { _id: "Glass Horizon", artistImageUrl: undefined, plays: 980 },
    favoriteSongThisYear: { _id: "mock-track-0", trackName: "Midnight Static", artistName: "Glass Horizon", plays: 142 },
    forgottenFavoriteCount: 47,
  },
};

const songOfTheDayFixture: SongOfTheDayResponse = {
  song: {
    uri: "spotify:track:mock-sotd",
    title: "Coastal Drift",
    artist: "Driftwood",
    albumImageUrl: null,
    artistImageUrl: undefined,
    album: "Tideline",
    released: "2014",
    gradientFrom: "#3B82F6",
    gradientTo: "#7C3AED",
    gradientClass: "from-blue-500 to-violet-600",
  },
  stats: {
    pastPlays: 86,
    lastPlayed: "214 days ago",
    lastPlayedDate: new Date(Date.now() - 214 * 86400000).toISOString(),
    daysSinceLastPlay: 214,
    favoriteMonth: "August",
    peakMonthPlays: 22,
    nightPct: 41,
    dominantSeason: "Summer",
    totalMinutes: 312,
  },
  storyBeats: [
    { stat: "86 plays", label: "across 6 years", icon: "Repeat" },
    { stat: "41%", label: "played after midnight", icon: "Moon" },
    { stat: "August 2021", label: "your peak month", icon: "Calendar" },
    { stat: "3 rainy days", label: "this was your go-to", icon: "CloudRain" },
  ],
  memorySnapshot: {
    snapshotTracks: [
      { title: "Coastal Drift", albumImageUrl: null, artist: "Driftwood", color: "from-pink-500 to-orange-400" },
      { title: "Tideline", albumImageUrl: null, artist: "Driftwood", color: "from-purple-500 to-indigo-500" },
      { title: "Midnight Static", albumImageUrl: null, artist: "Glass Horizon", color: "from-emerald-500 to-teal-400" },
    ],
    snapshotCollage: [],
    topArtist: { name: "Driftwood", initials: "DW", plays: 86, color: "from-amber-400 to-orange-500", imageUrl: null },
    peakMonthHours: 9.4,
    peakMonthLabel: "August 2021",
  },
  algoReasons: [
    { icon: "Calendar", label: "Seasonal echo", desc: "You played this often in summers past." },
    { icon: "Moon", label: "Late-night favorite", desc: "Most plays happened after 11pm." },
    { icon: "Sparkles", label: "Forgotten gem", desc: "Untouched for over 200 days." },
  ],
  affinityScore: 78,
  affinityLabel: "Strong nostalgic pull",
  moodReconstruction: {
    hourHeat: Array.from({ length: 24 }, (_, h) => ({ hour: h, v: Math.round(20 * Math.abs(Math.sin(h / 4))) })),
    peakHourLabel: "11 PM",
    monthTrend: MONTH_NAMES.slice(0, 12).map((m, i) => ({ m: m.slice(0, 3), v: 10 + Math.round(15 * Math.abs(Math.sin(i / 2))) })),
    repeatCurve: Array.from({ length: 10 }, (_, i) => ({ v: Math.round(8 * Math.abs(Math.cos(i / 2))) })),
    maxRepeatsInOneDay: 5,
  },
  related: [
    { title: "Tideline", albumImageUrl: null, artist: "Driftwood", color: "from-blue-500 to-violet-600", tag: "Same artist", lastPlayed: "180 days ago" },
    { title: "Quiet Riot, Pt. II", albumImageUrl: null, artist: "Marigold", color: "from-violet-500 to-pink-500", tag: "Similar mood", lastPlayed: "92 days ago" },
    { title: "Embers", albumImageUrl: null, artist: "Echo Valley", color: "from-cyan-400 to-blue-500", tag: "Forgotten favorite", lastPlayed: "301 days ago" },
  ],
  dailyRitual: {
    streakDays: 5,
    totalRediscovered: 47,
    avgAffinityScore: 71,
    savedToLibrary: 12,
  },
};

const FIXTURES: Record<string, unknown> = {
  "/api/dashboard/stats": { totalPlays: 18432, totalHours: 612.4, uniqueTrackCount: 2847, uniqueArtistCount: 612, firstPlay: "2019-03-14T00:00:00.000Z", streak: 23, nightPct: 34 } satisfies DashboardStatsResponse,
  "/api/dashboard/top-tracks": topTracksFixture,
  "/api/dashboard/top-artists": topArtistsFixture,
  "/api/dashboard/heatmap": heatmapFixture,
  "/api/dashboard/insights": insightsFixture,
  "/api/dashboard/now-playing": nowPlayingFixture,
  "/api/dashboard/timeline": timelineExplorerFixture,
  "/api/dashboard/timeline-page": timelinePageFixture,
  "/api/dashboard/visual-analytics": visualAnalyticsFixture,
  "/api/dashboard/rediscovery": rediscoveryFixture,
  "/api/dashboard/story-preview": storyPreviewFixture,
  "/api/dashboard/story": storyModeFixture,
  "/api/dashboard/profile": profileFixture,
  "/api/dashboard/song-of-the-day": songOfTheDayFixture,
};

export function getMockResponse(path: string): unknown {
  const pathname = path.split("?")[0];
  return FIXTURES[pathname];
}

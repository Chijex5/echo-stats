import { ObjectId } from 'mongodb';

// ── Genre grouping map ─────────────────────────────────────────────
const GENRE_GROUP_MAP: Record<string, string> = {
  // Afrobeats family
  'afrobeats': 'afrobeats',
  'afro adura': 'afrobeats',
  'afropop': 'afrobeats',
  'afroswing': 'afrobeats',
  'afrobeat': 'afrobeats',
  'afro soul': 'afrobeats',
  'afrogospel': 'afrobeats',
  'afropiano': 'afrobeats',
  'asakaa': 'afrobeats',
  'alté': 'afrobeats',
  'highlife': 'afrobeats',
  'hiplife': 'afrobeats',
  'bongo flava': 'afrobeats',
  'bongo piano': 'afrobeats',
  'gengetone': 'afrobeats',
  'azonto': 'afrobeats',
  'fújì': 'afrobeats',

  // Hip-hop family
  'hiphop': 'hiphop',
  'hip-hop': 'hiphop',
  'rap': 'hiphop',
  'trap': 'hiphop',
  'grime': 'hiphop',
  'uk drill': 'hiphop',
  'nigerian drill': 'hiphop',
  'brooklyn drill': 'hiphop',
  'chicago drill': 'hiphop',
  'new york drill': 'hiphop',
  'melodic rap': 'hiphop',
  'emo rap': 'hiphop',
  'old school hiphop': 'hiphop',
  'southern hiphop': 'hiphop',
  'east coast hiphop': 'hiphop',
  'west coast hiphop': 'hiphop',
  'g-funk': 'hiphop',
  'crunk': 'hiphop',
  'christian hiphop': 'hiphop',
  'indonesian hiphop': 'hiphop',
  'norwegian hiphop': 'hiphop',

  // R&B / Soul family
  'rnb': 'rnb',
  'r&b': 'rnb',
  'soul': 'rnb',
  'alternative rnb': 'rnb',
  'indie rnb': 'rnb',
  'uk rnb': 'rnb',
  'motown': 'rnb',
  'doo-wop': 'rnb',
  'adult standards': 'rnb',

  // Electronic family
  'electronic': 'electronic',
  'edm': 'electronic',
  'house': 'electronic',
  'french house': 'electronic',
  'tropical house': 'electronic',
  'future bass': 'electronic',
  'lo-fi': 'electronic',
  'amapiano': 'electronic',
  'dancehall': 'electronic',
  'moombahton': 'electronic',
  'slap house': 'electronic',
  'big room': 'electronic',
  'eurodance': 'electronic',
  'nightcore': 'electronic',
  'brazilian bass': 'electronic',
  'phonk': 'electronic',

  // Pop family
  'pop': 'pop',
  'soft pop': 'pop',
  'art pop': 'pop',
  'bedroom pop': 'pop',
  'k-pop': 'pop',
  'j-pop': 'pop',
  'city pop': 'pop',
  'dansk pop': 'pop',
  'swedish pop': 'pop',
  'norwegian pop': 'pop',
  'europop': 'pop',
  'latin pop': 'pop',
  'baroque pop': 'pop',

  // Indie / Alternative family
  'indie': 'indie',
  'alternative rock': 'indie',
  'indie rock': 'indie',
  'folk': 'indie',
  'ambient folk': 'indie',
  'yacht rock': 'indie',

  // Rock / Metal family
  'rock': 'rock',
  'pop punk': 'rock',
  'rap rock': 'rock',
  'nu metal': 'rock',
  'heavy metal': 'rock',
  'metalcore': 'rock',
  'melodic hardcore': 'rock',
  'symphonic metal': 'rock',
  'power metal': 'rock',
  'christian rock': 'rock',
  'emo': 'rock',

  // Jazz / Classical family
  'jazz': 'jazz',
  'orchestral': 'jazz',
  'choral': 'jazz',
  'score': 'jazz',
  'soundtrack': 'jazz',
  'musicals': 'jazz',

  // Latin family
  'latin': 'latin',
  'reggaeton': 'latin',
  'zouk': 'latin',

  // J-music family
  'j-rock': 'jmusic',
  'visual kei': 'jmusic',
  'anime': 'jmusic',
  'japanese indie': 'jmusic',
};

function groupGenre(raw: string): string {
  const normalized = normalizeGenre(raw);
  return GENRE_GROUP_MAP[normalized] ?? normalized; // ungrouped genres keep their name
}

// ── Genre DNA graph ────────────────────────────────────────────────
const DNA_EDGES: [string, string, number][] = [
  ['soul', 'rnb', 0.9],
  ['soul', 'indie', 0.75],
  ['soul', 'hiphop', 0.7],
  ['soul', 'jazz', 0.6],
  ['indie', 'folk', 0.7],
  ['hiphop', 'electronic', 0.55],
  ['hiphop', 'rnb', 0.65],
  ['jazz', 'electronic', 0.4],
  ['indie', 'rnb', 0.5],
  ['soul', 'afrobeats', 0.5],
  ['hiphop', 'afrobeats', 0.55],
];

// ── Types ──────────────────────────────────────────────────────────
export interface StreamRecord {
  _id: ObjectId;
  userId: ObjectId;
  ts: Date;
  msPlayed: number;
  trackName: string;
  artistName: string;
  albumName: string;
  spotifyTrackUri: string;
  releaseYear?: number;
  releaseYearConfidence?: number;
  genre?: string;
  platform: string;
  shuffle: boolean;
  skipped: boolean;
  offline: boolean;
  reasonStart: string;
  reasonEnd: string;
  releaseDatePrecision?: string;
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
  userId: ObjectId;
  totalStreams: number;
  totalMsPlayed: number;
  totalHoursPlayed: number;
  musicAge: MusicAgeProfile;
  genreProfile: GenreProfile;
  analyzedAt: Date;
}

// ── Helpers ────────────────────────────────────────────────────────
function classifyEra(releaseYear: number): string {
  if (releaseYear < 1970) return 'pre-70s';
  if (releaseYear < 1980) return '70s';
  if (releaseYear < 1990) return '80s';
  if (releaseYear < 2000) return '90s';
  if (releaseYear < 2010) return '2000s';
  if (releaseYear < 2020) return '2010s';
  return '2020s+';
}

function normalizeGenre(raw: string): string {
  return raw
    .toLowerCase()
    .trim()
    .replace(/afro\s+adura/i, 'afrobeats')
    .replace(/afropop/i, 'afrobeats')
    .replace(/r&b|r'n'b/i, 'rnb')
    .replace(/hip.?hop/i, 'hiphop')
    .replace(/electronica?/i, 'electronic');
}

function buildGenreProfile(
  streams: StreamRecord[],
  graph: Map<string, Map<string, number>>,
): GenreProfile {
  // 1. Accumulate msPlayed per MAJOR GROUP (not raw genre)
  const groupMs: Record<string, number> = {};
  for (const s of streams) {
    if (!s.genre) continue;
    const group = groupGenre(s.genre);
    groupMs[group] = (groupMs[group] ?? 0) + s.msPlayed;
  }

  if (Object.keys(groupMs).length === 0) {
    return { nodes: [], edges: [], dnaEdges: [], topGenres: [] };
  }

  // 2. Filter out groups with less than 0.5% of total listening — noise floor
  const genreTotal = Object.values(groupMs).reduce((a, b) => a + b, 0);
  const minMs = genreTotal * 0.005;
  const filteredMs = Object.fromEntries(
    Object.entries(groupMs).filter(([, ms]) => ms >= minMs)
  );

  if (Object.keys(filteredMs).length === 0) {
    return { nodes: [], edges: [], dnaEdges: [], topGenres: [] };
  }

  const filteredTotal = Object.values(filteredMs).reduce((a, b) => a + b, 0);
  const maxMs = Math.max(...Object.values(filteredMs));

  // 3. Build nodes
  const nodes: GenreNode[] = Object.entries(filteredMs).map(([genre, ms]) => ({
    genre,
    msPlayed: ms,
    percentage: parseFloat(((ms / filteredTotal) * 100).toFixed(1)),
    score: parseFloat((ms / maxMs).toFixed(4)),
  }));

  // 4. Build edges — only between groups that survived the noise floor
  //    Minimum strokeWidth maps to 0.5 via the affinityScore floor below
  const listenedGroups = Object.keys(filteredMs);
  const edges: GenreEdge[] = [];
  const dnaEdges: [string, string, number][] = [];
  const seen = new Set<string>();

  for (let i = 0; i < listenedGroups.length; i++) {
    for (let j = i + 1; j < listenedGroups.length; j++) {
      const groupA = listenedGroups[i];
      const groupB = listenedGroups[j];

      const key = [groupA, groupB].sort().join('|');
      if (seen.has(key)) continue;
      seen.add(key);

      const baseWeight =
        graph.get(groupA)?.get(groupB) ??
        graph.get(groupB)?.get(groupA) ??
        0.3;

      const scoreA = filteredMs[groupA] / maxMs;
      const scoreB = filteredMs[groupB] / maxMs;
      const rawAffinity = baseWeight * Math.sqrt(scoreA * scoreB);

      // ── Floor at 0.5 so no edge disappears visually ──────────────
      // Map rawAffinity (0–1) → displayScore (0.5–1.0)
      const affinityScore = parseFloat(
        (0.5 + rawAffinity * 0.5).toFixed(4)
      );

      edges.push({ source: groupA, target: groupB, weight: baseWeight, affinityScore });
      dnaEdges.push([groupA, groupB, affinityScore]);
    }
  }

  const topGenres = [...nodes]
    .sort((a, b) => b.msPlayed - a.msPlayed)
    .slice(0, 5)
    .map((n) => n.genre);

  return { nodes, edges, dnaEdges, topGenres };
}

function buildGenreGraph(): Map<string, Map<string, number>> {
  const graph = new Map<string, Map<string, number>>();
  for (const [a, b, weight] of DNA_EDGES) {
    if (!graph.has(a)) graph.set(a, new Map());
    if (!graph.has(b)) graph.set(b, new Map());
    graph.get(a)!.set(b, weight);
    graph.get(b)!.set(a, weight);
  }
  return graph;
}

// ── Music age builder ──────────────────────────────────────────────
export function buildMusicAgeProfile(streams: StreamRecord[]): MusicAgeProfile {
  const streamsWithYear = streams.filter(
    (s) => s.releaseYear && (s.releaseYearConfidence ?? 1) >= 0.5,
  );

  if (streamsWithYear.length === 0) {
    return {
      avgTrackAgeYears: 0,
      weightedAvgTrackAgeYears: 0,
      eraBreakdown: {},
      dominantReleaseYear: null,
    };
  }

  let totalAge = 0;
  let weightedAgeSum = 0;
  let weightedMsSum = 0;
  const eraMs: Record<string, number> = {};
  const releaseYearMs: Record<number, number> = {};

  for (const s of streamsWithYear) {
    const streamYear = new Date(s.ts).getFullYear();
    const age = streamYear - s.releaseYear!;
    totalAge += age;
    weightedAgeSum += age * s.msPlayed;
    weightedMsSum += s.msPlayed;

    const era = classifyEra(s.releaseYear!);
    eraMs[era] = (eraMs[era] ?? 0) + s.msPlayed;
    releaseYearMs[s.releaseYear!] = (releaseYearMs[s.releaseYear!] ?? 0) + s.msPlayed;
  }

  const eraTotal = Object.values(eraMs).reduce((a, b) => a + b, 0);
  const eraBreakdown = Object.fromEntries(
    Object.entries(eraMs).map(([era, ms]) => [
      era,
      { msPlayed: ms, percentage: parseFloat(((ms / eraTotal) * 100).toFixed(1)) },
    ]),
  );

  const dominantReleaseYear = parseInt(
    Object.entries(releaseYearMs).sort(([, a], [, b]) => b - a)[0][0],
  );

  return {
    avgTrackAgeYears: parseFloat((totalAge / streamsWithYear.length).toFixed(1)),
    weightedAvgTrackAgeYears: parseFloat((weightedAgeSum / weightedMsSum).toFixed(1)),
    eraBreakdown,
    dominantReleaseYear,
  };
}

// ── Main export ────────────────────────────────────────────────────
export function analyzeUserMusic(
  userId: ObjectId,
  streams: StreamRecord[],
): UserMusicAnalysis {
  const graph = buildGenreGraph();
  const totalMsPlayed = streams.reduce((sum, s) => sum + s.msPlayed, 0);

  return {
    userId,
    totalStreams: streams.length,
    totalMsPlayed,
    totalHoursPlayed: parseFloat((totalMsPlayed / 3_600_000).toFixed(2)),
    musicAge: buildMusicAgeProfile(streams),
    genreProfile: buildGenreProfile(streams, graph),
    analyzedAt: new Date(),
  };
}
// Single source of truth for every "Tailwind gradient-class-string → hex pair"
// lookup used across the app. The web API hashes deterministic gradients into
// Tailwind classes (e.g. "from-emerald-400 to-cyan-500") because it renders
// CSS; RN has no `bg-gradient-to-br` equivalent, so each surface that needs a
// LinearGradient decodes the class string back to hex here instead of
// re-declaring its own lookup table.
//
// The tables below stay namespaced per API/route rather than merged into one
// flat map: several routes independently generate their own gradient
// sequences and reuse the same Tailwind class string for a different color
// pair (e.g. "from-pink-500 to-orange-400" means one thing in the
// song-of-the-day route's GRADIENT_PALETTE and another in its
// SNAPSHOT_PALETTE) — flattening would silently pick the wrong color.
import { colors } from "./tokens";

// app/api/dashboard/timeline-page/route.ts GRADIENTS
const TIMELINE_GRADIENT_HEX: Record<string, [string, string]> = {
  "from-emerald-400 to-cyan-500": ["#34d399", "#06b6d4"],
  "from-blue-500 to-violet-600": ["#3b82f6", "#7c3aed"],
  "from-pink-500 to-orange-400": ["#ec4899", "#fb923c"],
  "from-amber-400 to-orange-500": ["#fbbf24", "#f97316"],
  "from-purple-500 to-indigo-500": ["#a855f7", "#6366f1"],
  "from-green-500 to-emerald-400": ["#22c55e", "#34d399"],
};

export function timelineGradientFor(colorClass: string): [string, string] {
  return TIMELINE_GRADIENT_HEX[colorClass] ?? [colors.echoGreen, colors.echoTeal];
}

// Text-color accent classes used by timeline-page insight cards
const INSIGHT_ACCENT_HEX: Record<string, string> = {
  "text-spotify": colors.spotify,
  "text-cyan-300": colors.accentCyan,
  "text-violet-300": colors.accentViolet,
};

export function insightAccentFor(accentClass: string): string {
  return INSIGHT_ACCENT_HEX[accentClass] ?? colors.echoGreen;
}

// app/api/dashboard/song-of-the-day/route.ts GRADIENT_PALETTE — used for
// related[].color. song.gradientFrom/gradientTo are already literal hex.
const SOTD_GRADIENT_HEX: Record<string, [string, string]> = {
  "from-blue-500 to-violet-600": ["#3B82F6", "#7C3AED"],
  "from-pink-500 to-orange-400": ["#EC4899", "#F97316"],
  "from-emerald-500 to-cyan-400": ["#10B981", "#06B6D4"],
  "from-amber-400 to-red-500": ["#F59E0B", "#EF4444"],
  "from-violet-500 to-pink-500": ["#8B5CF6", "#EC4899"],
  "from-cyan-400 to-blue-500": ["#06B6D4", "#3B82F6"],
  "from-orange-500 to-amber-400": ["#F97316", "#FBBF24"],
  "from-red-500 to-pink-500": ["#EF4444", "#EC4899"],
};

export function sotdGradientFor(colorClass: string): [string, string] {
  return SOTD_GRADIENT_HEX[colorClass] ?? [colors.echoGreen, colors.echoTeal];
}

// Same route's SNAPSHOT_PALETTE — used for snapshotTracks[].color,
// snapshotCollage[], and topArtist.color. Deliberately separate from
// SOTD_GRADIENT_HEX above (see file header).
const SOTD_SNAPSHOT_GRADIENT_HEX: Record<string, [string, string]> = {
  "from-pink-500 to-orange-400": ["#ec4899", "#fb923c"],
  "from-purple-500 to-indigo-500": ["#a855f7", "#6366f1"],
  "from-emerald-500 to-teal-400": ["#10b981", "#2dd4bf"],
  "from-amber-400 to-orange-500": ["#fbbf24", "#f97316"],
  "from-blue-500 to-cyan-500": ["#3b82f6", "#06b6d4"],
  "from-rose-400 to-pink-500": ["#fb7185", "#ec4899"],
  "from-violet-500 to-fuchsia-500": ["#8b5cf6", "#d946ef"],
  "from-indigo-500 to-purple-500": ["#6366f1", "#a855f7"],
  "from-yellow-500 to-amber-600": ["#eab308", "#d97706"],
};

export function sotdSnapshotGradientFor(colorClass: string): [string, string] {
  return SOTD_SNAPSHOT_GRADIENT_HEX[colorClass] ?? [colors.echoGreen, colors.echoTeal];
}

// TopArtist.color (top-artists route) — keyed the same way, own palette.
const ARTIST_AVATAR_GRADIENT_HEX: Record<string, [string, string]> = {
  "from-red-500 to-orange-500": ["#ef4444", "#f97316"],
  "from-purple-500 to-indigo-500": ["#a855f7", "#6366f1"],
  "from-pink-500 to-rose-400": ["#ec4899", "#fb7185"],
  "from-emerald-400 to-cyan-500": ["#34d399", "#06b6d4"],
  "from-blue-500 to-cyan-400": ["#3b82f6", "#22d3ee"],
  "from-amber-500 to-orange-400": ["#f59e0b", "#fb923c"],
  "from-green-500 to-emerald-400": ["#22c55e", "#34d399"],
  "from-red-600 to-pink-600": ["#dc2626", "#db2777"],
  "from-violet-500 to-purple-600": ["#8b5cf6", "#9333ea"],
  "from-sky-400 to-blue-600": ["#38bdf8", "#2563eb"],
};

export function artistAvatarGradientFor(colorClass: string): [string, string] {
  return ARTIST_AVATAR_GRADIENT_HEX[colorClass] ?? [colors.echoGreen, colors.echoTeal];
}

// Profile album-art placeholder tiles have no source API palette to decode —
// this is a fixed decorative rotation, cycled by index.
const ALBUM_PLACEHOLDER_GRADIENTS: [string, string][] = [
  ["#6ee7b7", "#0f172a"],
  ["#d8b4fe", "#000000"],
  ["#a5b4fc", "#0f172a"],
  ["#fde68a", "#1c1917"],
  ["#a7f3d0", "#000000"],
  ["#e9d5ff", "#18181b"],
];

export function albumPlaceholderGradient(index: number): [string, string] {
  return ALBUM_PLACEHOLDER_GRADIENTS[index % ALBUM_PLACEHOLDER_GRADIENTS.length];
}

// Fallback avatar gradient (profile "most played artist" tile) when there's
// no source image and no per-artist color from the API.
export const FALLBACK_ARTIST_GRADIENT: [string, string] = [colors.echoGreen, colors.accentBlue];

// Profile hero avatar ring — purely decorative, no source API palette.
export const PROFILE_RING_GRADIENT: [string, string, string] = [
  colors.echoGreen,
  colors.accentBlue,
  colors.accentPurple,
];

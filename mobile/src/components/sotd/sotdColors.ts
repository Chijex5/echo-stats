import { colors } from "@/lib/theme/tokens";

// Maps the song-of-the-day API's hashed Tailwind gradient-class strings
// (see GRADIENT_PALETTE in app/api/dashboard/song-of-the-day/route.ts) to
// literal hex pairs — RN has no equivalent for `bg-gradient-to-br` classes.
// `song.gradientFrom`/`gradientTo` are already literal hex from that same
// palette, so this lookup is only needed for `related[].color`.
const GRADIENT_PALETTE_HEX: Record<string, [string, string]> = {
  "from-blue-500 to-violet-600": ["#3B82F6", "#7C3AED"],
  "from-pink-500 to-orange-400": ["#EC4899", "#F97316"],
  "from-emerald-500 to-cyan-400": ["#10B981", "#06B6D4"],
  "from-amber-400 to-red-500": ["#F59E0B", "#EF4444"],
  "from-violet-500 to-pink-500": ["#8B5CF6", "#EC4899"],
  "from-cyan-400 to-blue-500": ["#06B6D4", "#3B82F6"],
  "from-orange-500 to-amber-400": ["#F97316", "#FBBF24"],
  "from-red-500 to-pink-500": ["#EF4444", "#EC4899"],
};

export function gradientFor(colorClass: string): [string, string] {
  return GRADIENT_PALETTE_HEX[colorClass] ?? [colors.echoGreen, colors.echoTeal];
}

// SNAPSHOT_PALETTE in the same route — used for snapshotTracks[].color,
// snapshotCollage[], and topArtist.color.
const SNAPSHOT_PALETTE_HEX: Record<string, [string, string]> = {
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

export function snapshotGradientFor(colorClass: string): [string, string] {
  return SNAPSHOT_PALETTE_HEX[colorClass] ?? [colors.echoGreen, colors.echoTeal];
}

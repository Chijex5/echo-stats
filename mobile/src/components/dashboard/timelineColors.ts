import { colors } from "@/lib/theme/tokens";

// Maps the timeline-page API's hashed Tailwind gradient-class strings
// (see GRADIENTS in app/api/dashboard/timeline-page/route.ts) to literal hex
// pairs — RN has no equivalent for `bg-gradient-to-br` utility classes.
const TIMELINE_GRADIENT_HEX: Record<string, [string, string]> = {
  "from-emerald-400 to-cyan-500": ["#34d399", "#06b6d4"],
  "from-blue-500 to-violet-600": ["#3b82f6", "#7c3aed"],
  "from-pink-500 to-orange-400": ["#ec4899", "#fb923c"],
  "from-amber-400 to-orange-500": ["#fbbf24", "#f97316"],
  "from-purple-500 to-indigo-500": ["#a855f7", "#6366f1"],
  "from-green-500 to-emerald-400": ["#22c55e", "#34d399"],
};

export function gradientFor(colorClass: string): [string, string] {
  return TIMELINE_GRADIENT_HEX[colorClass] ?? [colors.echoGreen, colors.echoTeal];
}

const INSIGHT_ACCENT_HEX: Record<string, string> = {
  "text-spotify": colors.spotify,
  "text-cyan-300": "#67e8f9",
  "text-violet-300": "#c4b5fd",
};

export function insightAccentFor(accentClass: string): string {
  return INSIGHT_ACCENT_HEX[accentClass] ?? colors.echoGreen;
}

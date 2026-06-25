const TAILWIND_TO_HEX: Record<string, string> = {
  // Emerald
  "emerald-300": "#6ee7b7",
  "emerald-400": "#34d399",
  "emerald-500": "#10b981",
  "emerald-600": "#059669",
  // Cyan
  "cyan-300": "#67e8f9",
  "cyan-400": "#22d3ee",
  "cyan-500": "#06b6d4",
  "cyan-600": "#0891b2",
  // Purple
  "purple-300": "#d8b4fe",
  "purple-400": "#c084fc",
  "purple-500": "#a855f7",
  "purple-600": "#9333ea",
  // Violet
  "violet-400": "#a78bfa",
  "violet-500": "#8b5cf6",
  // Blue
  "blue-400": "#60a5fa",
  "blue-500": "#3b82f6",
  // Pink
  "pink-400": "#f472b6",
  "pink-500": "#ec4899",
  // Rose
  "rose-400": "#fb7185",
  "rose-500": "#f43f5e",
  // Red
  "red-400": "#f87171",
  "red-500": "#ef4444",
  // Amber
  "amber-400": "#fbbf24",
  "amber-500": "#f59e0b",
  // Yellow
  "yellow-400": "#facc15",
  "yellow-500": "#eab308",
  // Green
  "green-400": "#4ade80",
  "green-500": "#22c55e",
  // Sky
  "sky-400": "#38bdf8",
  "sky-500": "#0ea5e9",
  // Indigo
  "indigo-400": "#818cf8",
  "indigo-500": "#6366f1",
  // Teal
  "teal-400": "#2dd4bf",
  "teal-500": "#14b8a6",
  // Lime
  "lime-400": "#a3e635",
  "lime-500": "#84cc16",
  // Slate
  "slate-400": "#94a3b8",
  "slate-500": "#64748b",
  // White / black
  "white": "#ffffff",
  "black": "#000000",
};

/**
 * Resolves a color value from the backend.
 * Handles:
 *   - plain hex:       "#34d399"           → "#34d399"
 *   - single class:    "emerald-400"       → "#34d399"
 *   - gradient string: "from-emerald-400 to-cyan-500" → first stop hex
 *   - unknown:         anything else       → fallback
 */
export function resolveColor(value: string | null | undefined, fallback = "#1db954"): string {
  if (!value) return fallback;

  // Already a hex
  if (value.startsWith("#")) return value;

  // Gradient string — extract the "from-X" color
  if (value.includes("from-")) {
    const match = value.match(/from-([\w]+-\d+)/);
    if (match) {
      const hex = TAILWIND_TO_HEX[match[1]];
      if (hex) return hex;
    }
  }

  // Plain single class like "emerald-400"
  const direct = TAILWIND_TO_HEX[value];
  if (direct) return direct;

  return fallback;
}
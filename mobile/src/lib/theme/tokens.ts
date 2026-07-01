// The single design-token source for the mobile app. Tailwind/NativeWind
// classes (mobile/tailwind.config.js) cover styling in JSX; this file mirrors
// the same values as plain JS for the handful of RN APIs that only accept
// raw numbers/strings — LinearGradient colors, BlurView tints, StyleSheet
// shadow props, Skia/victory-native chart props. Keep the two in sync by
// hand; nothing outside this pair of files should declare a new color,
// spacing, radius, or font-size literal.

export const colors = {
  // Brand
  echoGreen: "#18d87e",
  echoTeal: "#0fb7a3",
  echoDeep: "#02221a",
  spotify: "#1DB954",
  spotifyLight: "#22e065",
  spotifyDark: "#168f42",
  // Text/icon color for content painted on top of a solid Spotify-green surface
  onSpotify: "#05210f",

  // Neutrals
  background: "#0a0a0a",
  backgroundElevated: "#0d130d",
  foreground: "#ededed",

  // Semantic accents — shared vocabulary for trend/mood/category coloring
  // (insight cards, stat deltas, personality charts) instead of each screen
  // picking its own ad hoc hex.
  accentBlue: "#60a5fa",
  accentPurple: "#a78bfa",
  accentRed: "#f87171",
  accentAmber: "#f59e0b",
  accentCyan: "#67e8f9",
  accentCyanStrong: "#22d3ee",
  accentViolet: "#c4b5fd",
  accentPink: "#ec4899",
  accentRose: "#fb7185",
  accentEmerald: "#34d399",
  accentSky: "#38bdf8",
  accentYellow: "#fde047",

  white: "#ffffff",
  black: "#000000",

  // Aliases for direction-of-change semantics (top-tracks/artists trend
  // arrows, comparisons) so call sites read by intent, not by hue.
  positive: "#18d87e",
  negative: "#f87171",
} as const;

// Cyclic category palettes shared by rank-ordered charts (genre bars, era
// breakdown bars) — each replaces a component-local hardcoded hex array.
export const palettes = {
  chartCategory: [
    colors.echoGreen,
    colors.accentBlue,
    colors.accentPurple,
    colors.accentAmber,
    colors.accentRed,
    colors.accentEmerald,
    colors.accentRose,
    colors.accentSky,
  ],
  era: [
    colors.accentRed,
    colors.accentAmber,
    colors.accentYellow,
    colors.accentEmerald,
    colors.accentBlue,
    colors.accentPurple,
    colors.echoGreen,
  ],
  // Fixed per-slide accents for Story Mode — order matches buildSlides.ts's
  // slide sequence (top song, top artist, music age, favorite era, forgotten
  // favorite, emotional month, hidden gem, personality).
  storySlides: [
    colors.echoGreen,
    colors.accentBlue,
    colors.accentPurple,
    colors.accentAmber,
    colors.accentPink,
    colors.accentRose,
    colors.accentCyanStrong,
    colors.accentEmerald,
  ],
} as const;

export const backgroundGradient = ["#07110b", "#0c0f12", "#0b1410"] as const;

// Alpha ramps for glass surfaces, borders, and scrims. Components should call
// these helpers instead of writing `rgba(255,255,255,0.06)` inline — same
// formula, one place to retune the whole app's translucency.
export const alpha = {
  white: (opacity: number) => `rgba(255,255,255,${opacity})`,
  black: (opacity: number) => `rgba(0,0,0,${opacity})`,
  spotify: (opacity: number) => `rgba(24,216,126,${opacity})`,
  teal: (opacity: number) => `rgba(15,183,163,${opacity})`,
} as const;

/** @deprecated use `alpha.white` */
export const white = alpha.white;

// Shared surfaces for the app's bottom sheets (see components/ui/BottomSheet)
export const overlay = {
  scrim: alpha.black(0.8),
  sheetPanel: "rgba(9,11,15,0.98)",
} as const;

// Spacing scale, in px, for inline RN styles that can't use Tailwind
// (absolute-position offsets, chart/gauge geometry, etc). Mirrors the
// `spacing` values below in tailwind.config.js.
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  "4xl": 40,
  "5xl": 48,
  // Shared scroll-screen content insets, replacing the paddingHorizontal:20 /
  // paddingTop:72 / paddingBottom:140 triple that used to be copy-pasted
  // into every tab's ScrollView. Prefer `<ScreenScroll>` (components/ui) or
  // the `px-screen-x pt-screen-top pb-screen-bottom` classes in JSX; these
  // raw numbers exist only for non-className call sites.
  screenX: 20,
  screenTop: 72,
  screenBottom: 140,
} as const;

// Radius scale, in px, for inline RN styles that can't use Tailwind classes
// (circular avatars computed as dim/2, chart geometry, etc). JSX should
// prefer the `rounded-xl` / `rounded-2xl` / `rounded-3xl` / `rounded-sheet`
// classes from tailwind.config.js — those three plain sizes are repeated
// here so non-className call sites have the same numbers.
export const radius = {
  xl: 12,
  "2xl": 18,
  "3xl": 24,
  sheet: 28,
  full: 999,
} as const;

// Font-size scale, in px, mirroring tailwind.config.js `fontSize` (named by
// literal pixel size, e.g. `text-11`, to avoid colliding with Tailwind's own
// default xs/sm/base/lg/xl/2xl/3xl scale used elsewhere in the app). Use the
// Tailwind `text-*` classes in JSX; reach for these only where a component
// needs a raw number (e.g. an SVG/Skia <Text> size prop).
export const fontSize = {
  9: 9,
  10: 10,
  11: 11,
  12: 12,
  13: 13,
  14: 14,
  15: 15,
  17: 17,
  20: 20,
  26: 26,
  30: 30,
} as const;

export const shadows = {
  spotifyCta: {
    shadowColor: colors.echoGreen,
    shadowOpacity: 0.12,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  glowSpotify: {
    shadowColor: colors.spotify,
    shadowOpacity: 0.5,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },
  // Soft ambient shadow for hero art / floating cards (SotdHero, story slides)
  ambient: {
    shadowColor: colors.background,
    shadowOpacity: 0.4,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
} as const;

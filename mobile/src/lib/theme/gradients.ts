// Client-only color assignment. The backend sends arbitrary decorative hint
// strings on some fields (e.g. TopArtist.color = "from-emerald-400 to-
// cyan-500") that are Tailwind gradient-class names meant for the *web*
// app's CSS — they are not real color values, and passing one straight into
// a native color/backgroundColor prop throws "not a valid color or brush"
// at runtime. Mobile never renders those strings: instead, every screen
// that wants a decorative color for a backend item hashes a stable
// identifier from that item (its name/title/key — never the backend's
// color-ish field) into our own token palette, so the same item always
// gets the same color without ever trusting a backend-supplied string as a
// literal color.
import { colors, palettes } from "./tokens";

function hashIndex(key: string, length: number): number {
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) % length;
}

/** A single palette color, stable for a given identifier. */
export function colorForKey(key: string): string {
  return palettes.chartCategory[hashIndex(key, palettes.chartCategory.length)];
}

/** A two-stop gradient built from adjacent palette colors, stable for a given identifier. */
export function gradientForKey(key: string): [string, string] {
  const stops = palettes.chartCategory;
  const i = hashIndex(key, stops.length);
  return [stops[i], stops[(i + 1) % stops.length]];
}

// Color math for depth-shading a single palette color (planet orbs, filled
// discs): mix toward white for a lit highlight, toward black for a shadowed
// rim. Operates only on our own token hexes — never backend strings.
function mixHex(hex: string, target: string, t: number): string {
  const parse = (h: string) => {
    const n = h.replace("#", "");
    return [parseInt(n.slice(0, 2), 16), parseInt(n.slice(2, 4), 16), parseInt(n.slice(4, 6), 16)];
  };
  const a = parse(hex);
  const b = parse(target);
  const mixed = a.map((ch, i) => Math.round(ch + (b[i] - ch) * t));
  return `#${mixed.map((ch) => ch.toString(16).padStart(2, "0")).join("")}`;
}

/** Lighten a token hex toward white by `t` (0–1). */
export function tint(hex: string, t: number): string {
  return mixHex(hex, colors.white, t);
}

/** Darken a token hex toward black by `t` (0–1). */
export function shade(hex: string, t: number): string {
  return mixHex(hex, colors.black, t);
}

// Profile album-art placeholder tiles have no natural per-item identifier
// (they're keyed by position in the grid), so this stays a fixed rotation
// cycled by index rather than routed through colorForKey/gradientForKey.
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
// no source image.
export const FALLBACK_ARTIST_GRADIENT: [string, string] = [colors.echoGreen, colors.accentBlue];

// Profile hero avatar ring — purely decorative.
export const PROFILE_RING_GRADIENT: [string, string, string] = [
  colors.echoGreen,
  colors.accentBlue,
  colors.accentPurple,
];

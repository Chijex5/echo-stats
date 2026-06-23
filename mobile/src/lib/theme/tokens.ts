// JS-side mirror of mobile/tailwind.config.js colors, for libraries that need
// raw hex values (LinearGradient, victory-native/skia, BlurView tint colors)
// rather than NativeWind className strings.

export const colors = {
  echoGreen: "#18d87e",
  echoTeal: "#0fb7a3",
  echoDeep: "#02221a",
  spotify: "#1DB954",
  spotifyLight: "#22e065",
  spotifyDark: "#168f42",
  background: "#0a0a0a",
  foreground: "#ededed",
} as const;

export const backgroundGradient = ["#07110b", "#0c0f12", "#0b1410"] as const;

export const white = (opacity: number) => `rgba(255,255,255,${opacity})`;

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
} as const;

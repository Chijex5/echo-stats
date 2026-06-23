import { View, Text, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MotiView } from "moti";
import { colors } from "@/lib/theme/tokens";
import type { TopArtist } from "@/lib/api/hooks";

// `color` is a Tailwind gradient class pair from the web's GRADIENT_PALETTE
// (e.g. "from-red-500 to-orange-500") — RN has no class-driven gradient, so
// each pair is mapped to its literal hex stops here.
const GRADIENT_HEX: Record<string, [string, string]> = {
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

const SIZES = { sm: 40, md: 64, lg: 96, xl: 132 } as const;
const FONT_SIZES = { sm: 13, md: 18, lg: 26, xl: 36 } as const;

type ArtistAvatarProps = {
  artist: TopArtist;
  size?: keyof typeof SIZES;
  ring?: boolean;
};

export function ArtistAvatar({ artist, size = "md", ring = false }: ArtistAvatarProps) {
  const dim = SIZES[size];
  const gradient = GRADIENT_HEX[artist.color] ?? [colors.echoGreen, colors.echoTeal];

  return (
    <View style={{ width: dim, height: dim }}>
      {ring ? (
        <MotiView
          from={{ opacity: 0.3 }}
          animate={{ opacity: 0.9 }}
          transition={{ type: "timing", duration: 900, loop: true, repeatReverse: true }}
          style={{
            position: "absolute",
            top: -4,
            left: -4,
            right: -4,
            bottom: -4,
            borderRadius: (dim + 8) / 2,
            borderWidth: 2,
            borderColor: colors.echoGreen,
          }}
        />
      ) : null}
      {artist.imageUrl ? (
        <Image source={{ uri: artist.imageUrl }} style={{ width: dim, height: dim, borderRadius: dim / 2 }} />
      ) : (
        <LinearGradient
          colors={gradient}
          style={{ width: dim, height: dim, borderRadius: dim / 2, alignItems: "center", justifyContent: "center" }}
        >
          <Text style={{ fontSize: FONT_SIZES[size] }} className="font-sans-bold text-white">
            {artist.initials}
          </Text>
        </LinearGradient>
      )}
    </View>
  );
}

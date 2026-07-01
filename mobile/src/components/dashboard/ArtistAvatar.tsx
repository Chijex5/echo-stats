import { View, Text, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MotiView } from "moti";
import { colors } from "@/lib/theme/tokens";
import { gradientForKey } from "@/lib/theme/gradients";
import type { TopArtist } from "@/lib/api/hooks";

const SIZES = { sm: 40, md: 64, lg: 96, xl: 132 } as const;
const FONT_SIZES = { sm: 13, md: 18, lg: 26, xl: 36 } as const;

type ArtistAvatarProps = {
  artist: TopArtist;
  size?: keyof typeof SIZES;
  ring?: boolean;
};

export function ArtistAvatar({ artist, size = "md", ring = false }: ArtistAvatarProps) {
  const dim = SIZES[size];
  const gradient = gradientForKey(artist.name);

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

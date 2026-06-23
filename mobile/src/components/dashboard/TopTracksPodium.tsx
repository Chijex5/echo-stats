import { View, Text, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "@/lib/theme/tokens";
import type { TopTrack } from "@/lib/api/hooks";

function PodiumSlot({ track, rank, size }: { track: TopTrack; rank: number; size: number }) {
  return (
    <View className="flex-1 items-center">
      <View style={{ width: size, height: size }}>
        {track.albumImageUrl ? (
          <Image source={{ uri: track.albumImageUrl }} style={{ width: size, height: size, borderRadius: 16 }} />
        ) : (
          <LinearGradient
            colors={["rgba(24,216,126,0.25)", "rgba(15,183,163,0.1)"]}
            style={{ width: size, height: size, borderRadius: 16 }}
          />
        )}
        <View
          className="absolute -right-2 -top-2 h-6 w-6 items-center justify-center rounded-full"
          style={{ backgroundColor: colors.echoGreen }}
        >
          <Text className="text-[11px] font-sans-bold text-[#05210f]">{rank}</Text>
        </View>
      </View>
      <Text numberOfLines={1} style={{ maxWidth: size + 24 }} className="mt-2 text-center text-[12px] font-sans-semibold text-white">
        {track.trackName}
      </Text>
      <Text numberOfLines={1} style={{ maxWidth: size + 24 }} className="text-center text-[11px] text-white/45">
        {track.artistName}
      </Text>
    </View>
  );
}

// Podium order is left-to-right [rank2, rank1, rank3] via array
// reordering, not CSS `order` (no RN equivalent) — mirrors the web's
// visual hierarchy with #1 centered and tallest.
export function TopTracksPodium({ tracks }: { tracks: TopTrack[] }) {
  if (tracks.length < 3) return null;
  const [first, second, third] = tracks;

  return (
    <View className="flex-row items-end gap-2 px-5">
      <PodiumSlot track={second} rank={2} size={64} />
      <PodiumSlot track={first} rank={1} size={88} />
      <PodiumSlot track={third} rank={3} size={64} />
    </View>
  );
}

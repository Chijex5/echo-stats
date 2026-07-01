import { View, Text } from "react-native";
import { MotiView } from "moti";
import { colors, alpha } from "@/lib/theme/tokens";
import type { NowPlayingSyncTrack } from "@/lib/api/hooks";

type NowPlayingPillProps = {
  nowPlaying: NowPlayingSyncTrack | null;
  lastPlayed: NowPlayingSyncTrack | null;
};

export function NowPlayingPill({ nowPlaying, lastPlayed }: NowPlayingPillProps) {
  const track = nowPlaying ?? lastPlayed;
  if (!track) return null;

  return (
    <View className="flex-row items-center gap-3 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-2.5">
      {nowPlaying ? (
        <MotiView
          from={{ opacity: 0.4 }}
          animate={{ opacity: 1 }}
          transition={{ type: "timing", duration: 700, loop: true, repeatReverse: true }}
          style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.echoGreen }}
        />
      ) : (
        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: alpha.white(0.25) }} />
      )}
      <View className="flex-1">
        <Text numberOfLines={1} className="text-13 font-sans-medium text-white/90">
          {track.trackName}
        </Text>
        <Text numberOfLines={1} className="text-11 text-white/45">
          {nowPlaying ? "Now playing" : "Last played"} · {track.artistName}
        </Text>
      </View>
    </View>
  );
}

import { View, Text, StyleSheet } from "react-native";
import { MotiView } from "moti";
import { colors, alpha, fontSize, radius } from "@/lib/theme/tokens";
import type { NowPlayingSyncTrack } from "@/lib/api/hooks";

type NowPlayingPillProps = {
  nowPlaying: NowPlayingSyncTrack | null;
  lastPlayed: NowPlayingSyncTrack | null;
};

export function NowPlayingPill({ nowPlaying, lastPlayed }: NowPlayingPillProps) {
  const track = nowPlaying ?? lastPlayed;
  if (!track) return null;

  return (
    <View style={styles.row}>
      {nowPlaying ? (
        <MotiView
          from={{ opacity: 0.4 }}
          animate={{ opacity: 1 }}
          transition={{ type: "timing", duration: 700, loop: true, repeatReverse: true }}
          style={styles.dot}
        />
      ) : (
        <View style={[styles.dot, { backgroundColor: alpha.white(0.25) }]} />
      )}
      <View style={styles.text}>
        <Text numberOfLines={1} style={styles.title}>
          {track.trackName}
        </Text>
        <Text numberOfLines={1} style={styles.subtitle}>
          {nowPlaying ? "Now playing" : "Last played"} · {track.artistName}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: alpha.white(0.1),
    backgroundColor: alpha.white(0.04),
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.echoGreen },
  text: { flex: 1 },
  title: { fontSize: fontSize[13], fontFamily: "GeistSansMedium", color: alpha.white(0.9) },
  subtitle: { fontSize: fontSize[11], fontFamily: "GeistSans", color: alpha.white(0.45) },
});

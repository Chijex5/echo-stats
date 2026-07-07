import { View, Text, Image, Pressable, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Share2 } from "lucide-react-native";
import { colorForKey, gradientForKey } from "@/lib/theme/gradients";
import { colors, alpha, fontSize, radius, trackingWidest2 } from "@/lib/theme/tokens";
import type { SotdSong, SotdStats } from "@/lib/api/hooks/types";

type SotdHeroProps = {
  song: SotdSong;
  stats: SotdStats;
  onShare: () => void;
};

const CARD_H = 360;
const WEEKDAY = new Date().toLocaleDateString("en-US", { weekday: "long" });

// Today's pick as a full-bleed cover: the album art is the canvas, the
// facts are the caption. Share lives in the corner; there are no
// placeholder Play/Save buttons.
export function SotdHero({ song, stats, onShare }: SotdHeroProps) {
  const accent = colorForKey(song.title);

  return (
    <View style={styles.card}>
      {song.albumImageUrl ? (
        <Image source={{ uri: song.albumImageUrl }} style={StyleSheet.absoluteFill} resizeMode="cover" />
      ) : (
        <LinearGradient colors={gradientForKey(song.title)} style={StyleSheet.absoluteFill} />
      )}
      <LinearGradient
        colors={[alpha.black(0.3), alpha.black(0.35), alpha.black(0.96)]}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.topRow}>
        <View style={styles.chip}>
          <View style={[styles.chipDot, { backgroundColor: accent }]} />
          <Text style={styles.chipText}>Song of the day · {WEEKDAY}</Text>
        </View>
        <Pressable onPress={onShare} hitSlop={8} style={styles.shareButton}>
          <Share2 size={15} color={colors.white} />
        </Pressable>
      </View>

      <View style={styles.content}>
        <Text style={[styles.eyebrow, { color: accent }]}>Forgotten favorite</Text>
        <Text numberOfLines={2} style={styles.songTitle}>
          {song.title}
        </Text>
        <Text numberOfLines={1} style={styles.songMeta}>
          {song.artist} · {song.album} · {song.released}
        </Text>
        <Text style={styles.statsLine}>
          {stats.pastPlays.toLocaleString()} past plays · last played {stats.lastPlayed}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    height: CARD_H,
    borderRadius: radius["3xl"],
    overflow: "hidden",
    backgroundColor: colors.surface,
    justifyContent: "space-between",
  },
  topRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 14 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: radius.full,
    backgroundColor: alpha.black(0.5),
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  chipDot: { width: 6, height: 6, borderRadius: 3 },
  chipText: {
    fontSize: fontSize[9],
    fontFamily: "GeistSansSemiBold",
    textTransform: "uppercase",
    letterSpacing: trackingWidest2(fontSize[9]),
    color: alpha.white(0.85),
  },
  shareButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: alpha.black(0.5),
    alignItems: "center",
    justifyContent: "center",
  },
  content: { padding: 18 },
  eyebrow: {
    fontSize: fontSize[10],
    fontFamily: "GeistSansSemiBold",
    textTransform: "uppercase",
    letterSpacing: trackingWidest2(fontSize[10]),
  },
  songTitle: {
    marginTop: 6,
    fontSize: fontSize[26],
    fontFamily: "GeistSansBold",
    lineHeight: fontSize[26] * 1.15,
    color: colors.white,
  },
  songMeta: { marginTop: 4, fontSize: fontSize[13], fontFamily: "GeistSans", color: alpha.white(0.65) },
  statsLine: { marginTop: 10, fontSize: fontSize[11], fontFamily: "GeistSansMedium", color: alpha.white(0.5) },
});

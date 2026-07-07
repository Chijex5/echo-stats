import { View, Text, Image, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors, alpha, fontSize, trackingWidest2, radius } from "@/lib/theme/tokens";
import { colorForKey, gradientForKey } from "@/lib/theme/gradients";
import type { TimelinePagePeriod } from "@/lib/api/hooks";

const CARD_H = 230;

// The newest month as a full-bleed chapter cover: the month's top artist
// (or top track art) is the canvas, the story line is the caption. This is
// the "you are here" anchor before the archive rail below it.
export function MonthChapterHero({ period }: { period: TimelinePagePeriod }) {
  const bg = period.topArtistImageUrl ?? period.tracks[0]?.albumImageUrl ?? null;
  const moodColor = colorForKey(period.mood);

  return (
    <View style={styles.card}>
      {bg ? (
        <Image source={{ uri: bg }} style={StyleSheet.absoluteFill} resizeMode="cover" blurRadius={2} />
      ) : (
        <LinearGradient colors={gradientForKey(period.label)} style={StyleSheet.absoluteFill} />
      )}
      <LinearGradient
        colors={[alpha.black(0.25), alpha.black(0.5), alpha.black(0.94)]}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.chip}>
        <View style={[styles.chipDot, { backgroundColor: moodColor }]} />
        <Text style={styles.chipText}>{period.mood}</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.month}>
          {period.monthName} <Text style={styles.year}>{period.year}</Text>
        </Text>
        {period.story ? <Text style={styles.story}>{period.story.line}</Text> : null}
        <Text style={styles.meta}>
          {period.totalHours}h · {period.uniqueArtists} artists · {period.topGenre}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    height: CARD_H,
    borderRadius: radius["2xl"],
    overflow: "hidden",
    backgroundColor: colors.surface,
    justifyContent: "flex-end",
  },
  chip: {
    position: "absolute",
    top: 14,
    left: 14,
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
  content: { padding: 18 },
  month: { fontSize: fontSize[26], fontFamily: "GeistSansBold", color: colors.white },
  year: { fontFamily: "PlayfairDisplayItalic", fontStyle: "italic", color: alpha.white(0.7) },
  story: {
    marginTop: 6,
    fontSize: fontSize[13],
    fontFamily: "PlayfairDisplayItalic",
    fontStyle: "italic",
    lineHeight: fontSize[13] * 1.4,
    color: alpha.white(0.75),
  },
  meta: { marginTop: 10, fontSize: fontSize[11], fontFamily: "GeistSansMedium", color: alpha.white(0.55) },
});

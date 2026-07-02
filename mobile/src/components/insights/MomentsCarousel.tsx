import { ScrollView, View, Text, Image, StyleSheet, useWindowDimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors, alpha, spacing, fontSize, trackingWidest2 } from "@/lib/theme/tokens";
import { gradientForKey } from "@/lib/theme/gradients";
import type { InsightsResponse } from "@/lib/api/hooks";

export type Moment = {
  key: string;
  eyebrow: string;
  accent: string;
  line: string;
  title: string;
  subtitle?: string;
  imageUrl: string | null;
};

const CARD_H = 200;

function formatDay(value: string) {
  return new Intl.DateTimeFormat("en", { month: "long", day: "numeric" }).format(new Date(value));
}

// Turns the one-off stats (rarest find, obsession streak, first play of the
// year, taste shift) into full-bleed story cards — artwork as the canvas,
// one narrative line each — instead of small dashboard tiles.
export function buildMoments(data: InsightsResponse): Moment[] {
  const moments: Moment[] = [];

  if (data.longestStreak) {
    moments.push({
      key: "streak",
      eyebrow: "The obsession",
      accent: colors.accentRose,
      line: `${data.longestStreak.days} days in a row. You couldn't let this one go.`,
      title: data.longestStreak.trackName,
      subtitle: data.longestStreak.artistName,
      imageUrl: data.longestStreak.albumImageUrl,
    });
  }

  if (data.hiddenGem) {
    moments.push({
      key: "gem",
      eyebrow: "Hidden gem",
      accent: colors.accentPurple,
      line: `Only ${data.hiddenGem.plays} play${data.hiddenGem.plays === 1 ? "" : "s"} this month — your rarest spin.`,
      title: data.hiddenGem.trackName,
      subtitle: data.hiddenGem.artistName,
      imageUrl: data.hiddenGem.albumImageUrl,
    });
  }

  if (data.firstSong) {
    moments.push({
      key: "first",
      eyebrow: `First of ${new Date(data.firstSong.ts).getFullYear()}`,
      accent: colors.accentCyan,
      line: `Your year in music started here, on ${formatDay(data.firstSong.ts)}.`,
      title: data.firstSong.trackName,
      subtitle: data.firstSong.artistName,
      imageUrl: data.firstSong.albumImageUrl,
    });
  }

  if (data.genreDrift.drifted && data.genreDrift.from && data.genreDrift.to) {
    moments.push({
      key: "drift",
      eyebrow: "New rotation",
      accent: colors.accentBlue,
      line: "Your heavy rotation changed hands this month.",
      title: `${data.genreDrift.from} → ${data.genreDrift.to}`,
      imageUrl: null,
    });
  }

  return moments;
}

export function MomentsCarousel({ moments }: { moments: Moment[] }) {
  const { width } = useWindowDimensions();
  const cardW = width - spacing.screenX * 2 - 40;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      snapToInterval={cardW + 12}
      decelerationRate="fast"
      contentContainerStyle={{ paddingHorizontal: spacing.screenX, gap: 12 }}
    >
      {moments.map((m) => (
        <View key={m.key} style={[styles.card, { width: cardW }]}>
          {m.imageUrl ? (
            <Image source={{ uri: m.imageUrl }} style={StyleSheet.absoluteFill} resizeMode="cover" blurRadius={1} />
          ) : (
            <LinearGradient colors={gradientForKey(m.title)} style={StyleSheet.absoluteFill} />
          )}
          <LinearGradient
            colors={[alpha.black(0.25), alpha.black(0.45), alpha.black(0.92)]}
            style={StyleSheet.absoluteFill}
          />

          <View style={[styles.eyebrowChip, { backgroundColor: alpha.black(0.5) }]}>
            <View style={[styles.eyebrowDot, { backgroundColor: m.accent }]} />
            <Text style={styles.eyebrowText}>{m.eyebrow}</Text>
          </View>

          <View style={styles.content}>
            <Text style={styles.line}>{m.line}</Text>
            <Text numberOfLines={1} style={styles.title}>
              {m.title}
              {m.subtitle ? <Text style={styles.subtitle}> · {m.subtitle}</Text> : null}
            </Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  card: {
    height: CARD_H,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: colors.surface,
    justifyContent: "flex-end",
  },
  eyebrowChip: {
    position: "absolute",
    top: 14,
    left: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  eyebrowDot: { width: 6, height: 6, borderRadius: 3 },
  eyebrowText: {
    fontSize: fontSize[9],
    fontFamily: "GeistSansSemiBold",
    textTransform: "uppercase",
    letterSpacing: trackingWidest2(fontSize[9]),
    color: alpha.white(0.85),
  },
  content: { padding: 16 },
  line: {
    fontSize: fontSize[17],
    fontFamily: "GeistSansBold",
    lineHeight: fontSize[17] * 1.25,
    color: colors.white,
  },
  title: { marginTop: 8, fontSize: fontSize[12], fontFamily: "GeistSansMedium", color: alpha.white(0.75) },
  subtitle: { fontFamily: "GeistSans", color: alpha.white(0.5) },
});

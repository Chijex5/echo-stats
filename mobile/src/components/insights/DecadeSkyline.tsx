import { View, Text, StyleSheet } from "react-native";
import { MotiView } from "moti";
import { colors, alpha, fontSize, trackingWidest2 } from "@/lib/theme/tokens";
import type { FavoriteDecade, MusicAgeProfile } from "@/lib/api/hooks";

const BAR_AREA = 116;

type DecadeSkylineProps = {
  decade: FavoriteDecade;
  musicAge: MusicAgeProfile;
};

// The favorite-decade histogram as a skyline: one animated tower per decade
// of release years, the home decade lit green, with the music-age facts
// (how old your music runs, and the single year you keep returning to)
// anchoring the story underneath.
export function DecadeSkyline({ decade, musicAge }: DecadeSkylineProps) {
  const facts = [
    { label: "Avg track age", value: `${musicAge.avgTrackAgeYears} yrs` },
    { label: "Play-weighted", value: `${musicAge.weightedAvgTrackAgeYears} yrs` },
    ...(musicAge.dominantReleaseYear ? [{ label: "Home year", value: String(musicAge.dominantReleaseYear) }] : []),
  ];

  return (
    <View style={styles.card}>
      <Text style={styles.headline}>
        A <Text style={styles.headlineAccent}>{decade.topDecade}</Text> soul
      </Text>
      <Text style={styles.sub}>
        {decade.topPct}% of everything you play was released in the {decade.topDecade}.
      </Text>

      <View style={styles.bars}>
        {decade.bars.map((bar, i) => (
          <View key={bar.decade} style={styles.barCol}>
            {bar.isTop ? <Text style={styles.barPct}>{decade.topPct}%</Text> : null}
            <MotiView
              from={{ height: 4 }}
              animate={{ height: Math.max(4, (bar.heightPct / 100) * BAR_AREA) }}
              transition={{ type: "timing", duration: 600, delay: 150 + i * 70 }}
              style={[styles.bar, { backgroundColor: bar.isTop ? colors.echoGreen : alpha.white(0.1) }]}
            />
            <Text style={[styles.barLabel, bar.isTop && styles.barLabelTop]}>{bar.label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.facts}>
        {facts.map((fact) => (
          <View key={fact.label} style={styles.fact}>
            <Text style={styles.factValue}>{fact.value}</Text>
            <Text style={styles.factLabel}>{fact.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 18, backgroundColor: colors.surface, padding: 20 },
  headline: { fontSize: fontSize[20], fontFamily: "GeistSansBold", color: colors.white },
  headlineAccent: { fontFamily: "PlayfairDisplayItalic", fontStyle: "italic", color: colors.echoGreen },
  sub: { marginTop: 4, fontSize: fontSize[12], fontFamily: "GeistSans", color: alpha.white(0.5) },

  bars: { marginTop: 20, height: BAR_AREA + 34, flexDirection: "row", alignItems: "flex-end", gap: 8 },
  barCol: { flex: 1, alignItems: "center", justifyContent: "flex-end" },
  barPct: { marginBottom: 5, fontSize: fontSize[10], fontFamily: "GeistSansBold", color: colors.echoGreen },
  bar: { width: "100%", borderTopLeftRadius: 6, borderTopRightRadius: 6 },
  barLabel: { marginTop: 7, fontSize: fontSize[9], fontFamily: "GeistSans", color: alpha.white(0.35) },
  barLabelTop: { fontFamily: "GeistSansBold", color: colors.white },

  facts: {
    marginTop: 20,
    flexDirection: "row",
    borderTopWidth: 1,
    borderColor: alpha.white(0.06),
    paddingTop: 16,
  },
  fact: { flex: 1 },
  factValue: { fontSize: fontSize[17], fontFamily: "GeistSansBold", color: colors.white },
  factLabel: {
    marginTop: 3,
    fontSize: fontSize[9],
    fontFamily: "GeistSans",
    textTransform: "uppercase",
    letterSpacing: trackingWidest2(fontSize[9]),
    color: alpha.white(0.4),
  },
});

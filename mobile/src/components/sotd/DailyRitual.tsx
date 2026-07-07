import { View, Text, StyleSheet } from "react-native";
import { Flame, Sparkles, Heart, Music2, type LucideIcon } from "lucide-react-native";
import { alpha, colors, fontSize, radius, trackingWidest2 } from "@/lib/theme/tokens";
import type { SotdDailyRitual } from "@/lib/api/hooks/types";

type DailyRitualProps = {
  data: SotdDailyRitual;
};

// The come-back-tomorrow footer: one surface card, plain 2x2 stat grid.
export function DailyRitual({ data }: DailyRitualProps) {
  const stats: Array<{ icon: LucideIcon; value: string; label: string }> = [
    { icon: Flame, value: String(data.streakDays), label: "Active streak" },
    { icon: Sparkles, value: String(data.totalRediscovered), label: "Songs resurfaced" },
    { icon: Heart, value: String(data.avgAffinityScore), label: "Avg affinity" },
    { icon: Music2, value: String(data.savedToLibrary), label: "Saved to library" },
  ];

  return (
    <View style={styles.card}>
      <Text style={styles.title}>
        Come back tomorrow for a new <Text style={styles.titleAccent}>memory</Text>.
      </Text>
      <Text style={styles.subtitle}>One resurfaced favorite each morning. Your streak grows every time you stop by.</Text>

      <View style={styles.grid}>
        {stats.map((s) => (
          <View key={s.label} style={styles.tile}>
            <s.icon size={14} color={alpha.white(0.4)} strokeWidth={1.8} />
            <Text style={styles.tileValue}>{s.value}</Text>
            <Text style={styles.tileLabel}>{s.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radius["2xl"], backgroundColor: colors.surface, padding: 18 },
  title: {
    fontSize: fontSize[20],
    fontFamily: "GeistSansBold",
    lineHeight: fontSize[20] * 1.2,
    color: colors.white,
  },
  titleAccent: { fontFamily: "PlayfairDisplayItalic", fontStyle: "italic", color: colors.echoGreen },
  subtitle: {
    marginTop: 6,
    marginBottom: 18,
    fontSize: fontSize[12],
    lineHeight: fontSize[12] * 1.5,
    fontFamily: "GeistSans",
    color: alpha.white(0.5),
  },
  grid: { flexDirection: "row", flexWrap: "wrap", rowGap: 18 },
  tile: { width: "50%", paddingRight: 12 },
  tileValue: { marginTop: 8, fontSize: fontSize[20], fontFamily: "PlayfairDisplayItalic", color: colors.white },
  tileLabel: {
    marginTop: 3,
    fontSize: fontSize[9],
    fontFamily: "GeistSans",
    textTransform: "uppercase",
    letterSpacing: trackingWidest2(fontSize[9]),
    color: alpha.white(0.4),
  },
});

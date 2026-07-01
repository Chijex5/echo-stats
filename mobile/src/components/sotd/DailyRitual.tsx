import { View, Text, StyleSheet } from "react-native";
import { Flame, Sparkles, Heart, Music2, type LucideIcon } from "lucide-react-native";
import { GlassCard, EyebrowLabel } from "@/components/ui";
import { alpha, colors, fontSize } from "@/lib/theme/tokens";
import type { SotdDailyRitual } from "@/lib/api/hooks/types";

type DailyRitualProps = {
  data: SotdDailyRitual;
};

export function DailyRitual({ data }: DailyRitualProps) {
  const stats: Array<{ icon: LucideIcon; value: string; label: string }> = [
    { icon: Flame, value: String(data.streakDays), label: "Active streak" },
    { icon: Sparkles, value: String(data.totalRediscovered), label: "Songs resurfaced" },
    { icon: Heart, value: String(data.avgAffinityScore), label: "Avg affinity" },
    { icon: Music2, value: String(data.savedToLibrary), label: "Saved to library" },
  ];

  return (
    <GlassCard padding="lg" rounded="2xl" glow>
      <EyebrowLabel style={{ marginBottom: 6 }}>Daily ritual</EyebrowLabel>
      <Text style={styles.title}>
        Come back tomorrow for a new <Text style={styles.titleAccent}>memory</Text>.
      </Text>
      <Text style={styles.subtitle}>One resurfaced favorite each morning. Your streak grows every time you stop by.</Text>

      <View style={styles.grid}>
        {stats.map((s) => (
          <View key={s.label} style={styles.tile}>
            <s.icon size={15} color={alpha.white(0.4)} strokeWidth={1.8} />
            <Text style={styles.tileValue}>{s.value}</Text>
            <Text style={styles.tileLabel}>{s.label}</Text>
          </View>
        ))}
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  title: { marginBottom: 8, fontSize: fontSize[20], fontFamily: "GeistSansBold", lineHeight: fontSize[20] * 1.15, color: colors.white },
  titleAccent: { fontFamily: "PlayfairDisplayItalic", fontStyle: "italic", color: colors.spotify },
  subtitle: { marginBottom: 20, fontSize: fontSize[13], lineHeight: fontSize[13] * 1.5, color: alpha.white(0.5) },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  tile: {
    flex: 1,
    minWidth: "44%",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: alpha.white(0.05),
    backgroundColor: alpha.white(0.03),
    padding: 16,
  },
  tileValue: { marginTop: 12, fontSize: fontSize[20], fontFamily: "PlayfairDisplayItalic", color: colors.white },
  tileLabel: { marginTop: 2, fontSize: fontSize[11], lineHeight: fontSize[11] * 1.1, color: alpha.white(0.4) },
});

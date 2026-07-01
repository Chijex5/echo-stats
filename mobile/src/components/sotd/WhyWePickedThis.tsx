import { View, Text, StyleSheet } from "react-native";
import Animated, { useAnimatedStyle, useDerivedValue, withTiming } from "react-native-reanimated";
import { Calendar, Heart, Moon, Sparkles, CloudRain, type LucideIcon } from "lucide-react-native";
import { GlassCard, SectionHeading, EyebrowLabel } from "@/components/ui";
import { colors, alpha, fontSize } from "@/lib/theme/tokens";
import type { SotdAlgoReason, SotdAlgoIconName } from "@/lib/api/hooks/types";

const ICON_MAP: Record<SotdAlgoIconName, LucideIcon> = { Calendar, Heart, Moon, Sparkles, CloudRain };

type WhyWePickedThisProps = {
  reasons: SotdAlgoReason[];
  affinityScore: number;
  affinityLabel: string;
};

function AffinityBar({ score }: { score: number }) {
  const animatedWidth = useDerivedValue(() => withTiming(score, { duration: 1000 }));
  const style = useAnimatedStyle(() => ({ width: `${animatedWidth.value}%` }));
  return (
    <View style={styles.barTrack}>
      <Animated.View style={[styles.barFill, style]} />
    </View>
  );
}

export function WhyWePickedThis({ reasons, affinityScore, affinityLabel }: WhyWePickedThisProps) {
  return (
    <View>
      <View style={{ marginBottom: 20 }}>
        <SectionHeading label="The algorithm" title="Why we picked this" subtitle="A glimpse at the signals choosing today's memory." />
      </View>
      <GlassCard padding="lg" rounded="2xl">
        <View style={styles.reasonsGrid}>
          {reasons.map((r) => {
            const Icon = ICON_MAP[r.icon];
            return (
              <View key={r.label} style={styles.reasonItem}>
                <View style={styles.reasonIcon}>
                  <Icon size={18} color={alpha.white(0.7)} strokeWidth={1.8} />
                </View>
                <Text style={styles.reasonLabel}>{r.label}</Text>
                <Text style={styles.reasonDesc}>{r.desc}</Text>
              </View>
            );
          })}
        </View>

        <View style={styles.affinitySection}>
          <EyebrowLabel>Affinity score</EyebrowLabel>
          <View style={styles.affinityRow}>
            <Text style={styles.affinityScore}>{affinityScore}</Text>
            <Text style={styles.affinityLabel}>{affinityLabel}</Text>
          </View>
          <AffinityBar score={affinityScore} />
          <View style={styles.scaleRow}>
            <Text style={styles.scaleLabel}>0</Text>
            <Text style={styles.scaleLabel}>50</Text>
            <Text style={styles.scaleLabel}>100</Text>
          </View>
        </View>
      </GlassCard>
    </View>
  );
}

const styles = StyleSheet.create({
  barTrack: { height: 8, overflow: "hidden", borderRadius: 999, backgroundColor: alpha.white(0.05) },
  barFill: { height: "100%", backgroundColor: colors.spotify, borderRadius: 999 },
  reasonsGrid: { flexDirection: "row", flexWrap: "wrap", rowGap: 24 },
  reasonItem: { width: "50%", alignItems: "center", paddingHorizontal: 4 },
  reasonIcon: {
    marginBottom: 12,
    height: 56,
    width: 56,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: alpha.white(0.08),
    backgroundColor: alpha.white(0.04),
  },
  reasonLabel: { marginBottom: 4, textAlign: "center", fontSize: fontSize[13], fontFamily: "GeistSansSemiBold", color: colors.white },
  reasonDesc: { textAlign: "center", fontSize: fontSize[11], lineHeight: fontSize[11] * 1.5, color: alpha.white(0.45) },
  affinitySection: { marginTop: 28, gap: 12, borderTopWidth: 1, borderColor: alpha.white(0.05), paddingTop: 24 },
  affinityRow: { flexDirection: "row", alignItems: "baseline", gap: 10 },
  affinityScore: { fontSize: fontSize[30], fontFamily: "PlayfairDisplayItalic", color: colors.white },
  affinityLabel: { fontSize: fontSize[13], fontFamily: "GeistSansMedium", color: colors.spotify },
  scaleRow: { flexDirection: "row", justifyContent: "space-between" },
  scaleLabel: { fontSize: fontSize[10], color: alpha.white(0.3) },
});

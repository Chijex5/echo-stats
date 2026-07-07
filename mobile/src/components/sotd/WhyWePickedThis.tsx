import { View, Text, StyleSheet } from "react-native";
import Animated, { useAnimatedStyle, useDerivedValue, withTiming } from "react-native-reanimated";
import { Calendar, Heart, Moon, Sparkles, CloudRain, type LucideIcon } from "lucide-react-native";
import { colors, alpha, fontSize, radius, trackingWidest2 } from "@/lib/theme/tokens";
import type { SotdAlgoReason, SotdAlgoIconName } from "@/lib/api/hooks/types";

const ICON_MAP: Record<SotdAlgoIconName, LucideIcon> = { Calendar, Heart, Moon, Sparkles, CloudRain };

type WhyWePickedThisProps = {
  reasons: SotdAlgoReason[];
  affinityScore: number;
  affinityLabel: string;
  accent: string;
};

function AffinityBar({ score, accent }: { score: number; accent: string }) {
  const animatedWidth = useDerivedValue(() => withTiming(score, { duration: 1000 }));
  const style = useAnimatedStyle(() => ({ width: `${animatedWidth.value}%` }));
  return (
    <View style={styles.barTrack}>
      <Animated.View style={[styles.barFill, { backgroundColor: accent }, style]} />
    </View>
  );
}

// The algorithm's receipts: each signal as a left-aligned row, and the
// affinity score as one serif number over a filled bar — no centered icon
// grid, no bordered tiles.
export function WhyWePickedThis({ reasons, affinityScore, affinityLabel, accent }: WhyWePickedThisProps) {
  return (
    <View style={styles.card}>
      <View style={{ gap: 16 }}>
        {reasons.map((r) => {
          const Icon = ICON_MAP[r.icon];
          return (
            <View key={r.label} style={styles.reasonRow}>
              <View style={[styles.reasonIcon, { backgroundColor: alpha.hex(accent, 0.12) }]}>
                <Icon size={15} color={accent} strokeWidth={1.8} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.reasonLabel}>{r.label}</Text>
                <Text style={styles.reasonDesc}>{r.desc}</Text>
              </View>
            </View>
          );
        })}
      </View>

      <View style={styles.affinitySection}>
        <Text style={styles.affinityEyebrow}>Affinity score</Text>
        <View style={styles.affinityRow}>
          <Text style={styles.affinityScore}>{affinityScore}</Text>
          <Text style={[styles.affinityLabel, { color: accent }]}>{affinityLabel}</Text>
        </View>
        <AffinityBar score={affinityScore} accent={accent} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radius["2xl"], backgroundColor: colors.surface, padding: 16 },
  reasonRow: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  reasonIcon: {
    height: 32,
    width: 32,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    marginTop: 1,
  },
  reasonLabel: { fontSize: fontSize[13], fontFamily: "GeistSansSemiBold", color: colors.white },
  reasonDesc: {
    marginTop: 2,
    fontSize: fontSize[11],
    lineHeight: fontSize[11] * 1.5,
    fontFamily: "GeistSans",
    color: alpha.white(0.45),
  },

  affinitySection: {
    marginTop: 18,
    borderTopWidth: 1,
    borderColor: alpha.white(0.06),
    paddingTop: 16,
  },
  affinityEyebrow: {
    fontSize: fontSize[9],
    fontFamily: "GeistSans",
    textTransform: "uppercase",
    letterSpacing: trackingWidest2(fontSize[9]),
    color: alpha.white(0.35),
  },
  affinityRow: { marginTop: 6, marginBottom: 10, flexDirection: "row", alignItems: "baseline", gap: 10 },
  affinityScore: { fontSize: fontSize[30], fontFamily: "PlayfairDisplayItalic", color: colors.white },
  affinityLabel: { fontSize: fontSize[13], fontFamily: "GeistSansMedium" },
  barTrack: { height: 6, overflow: "hidden", borderRadius: radius.full, backgroundColor: alpha.white(0.06) },
  barFill: { height: "100%", borderRadius: radius.full },
});

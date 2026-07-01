import { View, Text, StyleSheet } from "react-native";
import { MotiView } from "moti";
import { TrendingUp, Music2, Moon } from "lucide-react-native";
import { GlassCard } from "@/components/ui";
import { staggerChild } from "@/lib/motion/presets";
import { colorForKey } from "@/lib/theme/gradients";
import { colors, alpha, fontSize, trackingWidest2 } from "@/lib/theme/tokens";
import type { TimelinePageInsight } from "@/lib/api/hooks";

const ICONS = [TrendingUp, Music2, Moon];

export function TimelineInsights({ insights, startIndex }: { insights: TimelinePageInsight[]; startIndex: number }) {
  return (
    <View style={styles.list}>
      {insights.map((insight, i) => {
        const Icon = ICONS[i % ICONS.length];
        const accent = colorForKey(insight.label);
        return (
          <MotiView key={insight.label} {...staggerChild(startIndex + i)}>
            <GlassCard padding="md" rounded="2xl">
              <View style={styles.row}>
                <Icon size={14} color={accent} />
                <Text style={styles.label}>{insight.label}</Text>
              </View>
              <Text style={styles.title}>{insight.title}</Text>
              <Text style={styles.sub}>{insight.sub}</Text>
            </GlassCard>
          </MotiView>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: 12 },
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  label: {
    fontSize: fontSize[11],
    fontFamily: "GeistSans",
    textTransform: "uppercase",
    letterSpacing: trackingWidest2(fontSize[11]),
    color: alpha.white(0.35),
  },
  title: { marginTop: 8, fontSize: fontSize[15], fontFamily: "GeistSansSemiBold", color: colors.white },
  sub: { marginTop: 4, fontSize: fontSize[12], fontFamily: "GeistSans", color: alpha.white(0.45) },
});

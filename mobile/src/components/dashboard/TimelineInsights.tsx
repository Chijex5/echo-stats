import { View, Text } from "react-native";
import { MotiView } from "moti";
import { TrendingUp, Music2, Moon } from "lucide-react-native";
import { GlassCard } from "@/components/ui";
import { staggerChild } from "@/lib/motion/presets";
import { colorForKey } from "@/lib/theme/gradients";
import type { TimelinePageInsight } from "@/lib/api/hooks";

const ICONS = [TrendingUp, Music2, Moon];

export function TimelineInsights({ insights, startIndex }: { insights: TimelinePageInsight[]; startIndex: number }) {
  return (
    <View className="gap-3">
      {insights.map((insight, i) => {
        const Icon = ICONS[i % ICONS.length];
        const accent = colorForKey(insight.label);
        return (
          <MotiView key={insight.label} {...staggerChild(startIndex + i)}>
            <GlassCard padding="md" rounded="2xl">
              <View className="flex-row items-center gap-2">
                <Icon size={14} color={accent} />
                <Text className="text-11 uppercase tracking-widest2 text-white/35">{insight.label}</Text>
              </View>
              <Text className="mt-2 text-15 font-sans-semibold text-white">{insight.title}</Text>
              <Text className="mt-1 text-12 text-white/45">{insight.sub}</Text>
            </GlassCard>
          </MotiView>
        );
      })}
    </View>
  );
}

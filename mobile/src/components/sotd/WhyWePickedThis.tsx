import { View, Text } from "react-native";
import Animated, { useAnimatedStyle, useDerivedValue, withTiming } from "react-native-reanimated";
import { Calendar, Heart, Moon, Sparkles, CloudRain, type LucideIcon } from "lucide-react-native";
import { GlassCard, SectionHeading, EyebrowLabel } from "@/components/ui";
import { colors } from "@/lib/theme/tokens";
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
    <View className="h-2 overflow-hidden rounded-full bg-white/5">
      <Animated.View style={[{ height: "100%", backgroundColor: colors.spotify, borderRadius: 999 }, style]} />
    </View>
  );
}

export function WhyWePickedThis({ reasons, affinityScore, affinityLabel }: WhyWePickedThisProps) {
  return (
    <View>
      <View className="mb-5">
        <SectionHeading
          label="The algorithm"
          title="Why we picked this"
          subtitle="A glimpse at the signals choosing today's memory."
        />
      </View>
      <GlassCard padding="lg" rounded="2xl">
        <View className="flex-row flex-wrap gap-y-6">
          {reasons.map((r) => {
            const Icon = ICON_MAP[r.icon];
            return (
              <View key={r.label} className="w-1/2 items-center px-1">
                <View className="mb-3 h-14 w-14 items-center justify-center rounded-2xl border border-white/8 bg-white/[0.04]">
                  <Icon size={18} color="rgba(255,255,255,0.7)" strokeWidth={1.8} />
                </View>
                <Text className="mb-1 text-center text-[13px] font-sans-semibold text-white">{r.label}</Text>
                <Text className="text-center text-[11px] leading-relaxed text-white/45">{r.desc}</Text>
              </View>
            );
          })}
        </View>

        <View className="mt-7 gap-3 border-t border-white/5 pt-6">
          <EyebrowLabel>Affinity score</EyebrowLabel>
          <View className="flex-row items-baseline gap-2.5">
            <Text className="text-[28px] font-serif text-white">{affinityScore}</Text>
            <Text className="text-[13px] font-sans-medium text-spotify">{affinityLabel}</Text>
          </View>
          <AffinityBar score={affinityScore} />
          <View className="flex-row justify-between">
            <Text className="text-[10px] text-white/30">0</Text>
            <Text className="text-[10px] text-white/30">50</Text>
            <Text className="text-[10px] text-white/30">100</Text>
          </View>
        </View>
      </GlassCard>
    </View>
  );
}

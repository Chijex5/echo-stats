import { View, Text } from "react-native";
import { Calendar, Moon, CloudRain, Repeat, type LucideIcon } from "lucide-react-native";
import { GlassCard, SectionHeading } from "@/components/ui";
import { alpha } from "@/lib/theme/tokens";
import type { SotdStoryBeat, SotdStoryIconName } from "@/lib/api/hooks/types";

const ICON_MAP: Record<SotdStoryIconName, LucideIcon> = { Calendar, Moon, CloudRain, Repeat };

type TheStoryProps = {
  beats: SotdStoryBeat[];
};

export function TheStory({ beats }: TheStoryProps) {
  return (
    <View>
      <View className="mb-5">
        <SectionHeading label="The story" title="You lived with this song for a" accentWord="season." />
      </View>
      <GlassCard padding="lg" rounded="2xl">
        <View className="gap-5">
          {beats.map((b, i) => {
            const Icon = ICON_MAP[b.icon];
            return (
              <View key={i} className="flex-row items-start gap-3.5">
                <View className="h-10 w-10 items-center justify-center rounded-xl border border-white/8 bg-white/[0.04]">
                  <Icon size={15} color={alpha.white(0.6)} strokeWidth={1.8} />
                </View>
                <View className="flex-1">
                  <Text className="text-26 font-serif leading-none text-white">{b.stat}</Text>
                  <Text className="mt-1.5 text-13 leading-relaxed text-white/50">{b.label}</Text>
                </View>
              </View>
            );
          })}
        </View>
      </GlassCard>
    </View>
  );
}

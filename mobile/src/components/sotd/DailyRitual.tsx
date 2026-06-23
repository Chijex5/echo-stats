import { View, Text } from "react-native";
import { Flame, Sparkles, Heart, Music2, type LucideIcon } from "lucide-react-native";
import { GlassCard, EyebrowLabel } from "@/components/ui";
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
      <EyebrowLabel className="mb-1.5">Daily ritual</EyebrowLabel>
      <Text className="mb-2 text-[20px] font-sans-bold leading-tight text-white">
        Come back tomorrow for a new <Text className="font-serif italic text-spotify">memory</Text>.
      </Text>
      <Text className="mb-5 text-[13px] leading-relaxed text-white/50">
        One resurfaced favorite each morning. Your streak grows every time you stop by.
      </Text>

      <View className="flex-row flex-wrap gap-3">
        {stats.map((s) => (
          <View key={s.label} className="flex-1 rounded-2xl border border-white/5 bg-white/[0.03] p-4" style={{ minWidth: "44%" }}>
            <s.icon size={15} color="rgba(255,255,255,0.4)" strokeWidth={1.8} />
            <Text className="mt-3 text-[20px] font-serif text-white">{s.value}</Text>
            <Text className="mt-0.5 text-[11px] leading-tight text-white/40">{s.label}</Text>
          </View>
        ))}
      </View>
    </GlassCard>
  );
}

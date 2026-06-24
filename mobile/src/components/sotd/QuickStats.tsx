import { ScrollView, View, Text } from "react-native";
import { Repeat, Clock, Heart, Flame, type LucideIcon } from "lucide-react-native";

type QuickStatsProps = {
  pastPlays: number;
  lastPlayed: string;
  affinityScore: number;
  affinityLabel: string;
  streakDays: number;
};

function Chip({ icon: Icon, value, label }: { icon: LucideIcon; value: string; label: string }) {
  return (
    <View className="flex-row items-center gap-2.5 rounded-2xl border border-white/8 bg-white/[0.04] px-4 py-3">
      <Icon size={15} color="rgba(255,255,255,0.5)" strokeWidth={1.8} />
      <View>
        <Text className="text-[14px] font-sans-bold text-white">{value}</Text>
        <Text className="text-[10px] text-white/40">{label}</Text>
      </View>
    </View>
  );
}

// Consolidates what used to be three separate stat blocks (Hero's tiles,
// WhyWePickedThis's affinity readout, DailyRitual's stat grid) into one
// scannable strip — a phone screen doesn't need three different places
// to look for "is this song a big deal."
export function QuickStats({ pastPlays, lastPlayed, affinityScore, affinityLabel, streakDays }: QuickStatsProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
      <Chip icon={Repeat} value={String(pastPlays)} label="Past plays" />
      <Chip icon={Clock} value={lastPlayed} label="Last played" />
      <Chip icon={Heart} value={`${affinityScore} · ${affinityLabel}`} label="Affinity" />
      <Chip icon={Flame} value={`${streakDays}d`} label="Ritual streak" />
    </ScrollView>
  );
}

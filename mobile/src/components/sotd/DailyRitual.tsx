import { View, Text } from "react-native";
import { Flame } from "lucide-react-native";
import type { SotdDailyRitual } from "@/lib/api/hooks/types";

type DailyRitualProps = {
  data: SotdDailyRitual;
};

// Was a full glowing card with a 4-tile stat grid — that's the kind of
// thing the redesign is cutting. The streak is a nice-to-know, not
// something that deserves its own card competing with the song itself.
export function DailyRitual({ data }: DailyRitualProps) {
  return (
    <View className="flex-row items-center justify-center gap-2 self-center rounded-full border border-white/8 bg-white/[0.04] px-4 py-2.5">
      <Flame size={13} color="#f97316" />
      <Text className="text-[12px] text-white/55">
        <Text className="font-sans-semibold text-white">{data.streakDays}-day streak</Text> · {data.totalRediscovered}{" "}
        songs resurfaced · come back tomorrow for a new memory
      </Text>
    </View>
  );
}

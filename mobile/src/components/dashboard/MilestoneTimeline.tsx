import { View, Text } from "react-native";
import type { LucideIcon } from "lucide-react-native";
import { colors } from "@/lib/theme/tokens";

export type MilestoneItem = {
  key: string;
  icon: LucideIcon;
  title: string;
  value: string;
  meta: string;
};

// Accepts a fixed-order array built explicitly from ProfileResponse's
// 5 named milestone keys (firstImportedSong, firstSyncedSong, ...) — the
// caller maps that object by name, not by iterating it, so a future field
// reorder in the API response can't silently reshuffle this timeline.
export function MilestoneTimeline({ items }: { items: MilestoneItem[] }) {
  return (
    <View>
      {items.map((item, index) => {
        const Icon = item.icon;
        const isLast = index === items.length - 1;
        return (
          <View key={item.key} className="flex-row gap-4">
            <View className="items-center">
              <View
                className="h-9 w-9 items-center justify-center rounded-full border"
                style={{ borderColor: "rgba(24,216,126,0.25)", backgroundColor: "rgba(24,216,126,0.08)" }}
              >
                <Icon size={16} color={colors.echoGreen} />
              </View>
              {!isLast ? <View className="my-1 w-px flex-1" style={{ backgroundColor: "rgba(255,255,255,0.08)" }} /> : null}
            </View>
            <View className={isLast ? "flex-1 pb-0" : "flex-1 pb-5"}>
              <Text className="text-[10px] font-sans-semibold uppercase tracking-widest2 text-white/35">
                {item.title}
              </Text>
              <Text numberOfLines={2} className="mt-1.5 text-[14px] font-sans-semibold text-white">
                {item.value}
              </Text>
              <Text className="mt-1 text-[12px] text-white/40">{item.meta}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

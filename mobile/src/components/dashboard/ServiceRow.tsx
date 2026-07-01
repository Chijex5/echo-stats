import { View, Text } from "react-native";
import type { LucideIcon } from "lucide-react-native";
import { GlassCard } from "@/components/ui";
import { colors, alpha } from "@/lib/theme/tokens";

type ServiceRowProps = {
  icon: LucideIcon;
  title: string;
  value: string;
  active?: boolean;
};

export function ServiceRow({ icon: Icon, title, value, active = false }: ServiceRowProps) {
  return (
    <GlassCard padding="sm" rounded="xl">
      <View className="flex-row items-center gap-3">
        <View className="h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.05]">
          <Icon size={16} color={alpha.white(0.7)} />
        </View>
        <View className="flex-1">
          <Text className="text-13 text-white/40">{title}</Text>
          <Text numberOfLines={1} className="mt-0.5 text-14 font-sans-semibold text-white">
            {value}
          </Text>
        </View>
        <View
          className="h-2.5 w-2.5 rounded-full"
          style={{ backgroundColor: active ? colors.echoGreen : alpha.white(0.2) }}
        />
      </View>
    </GlassCard>
  );
}

import { Text, View } from "react-native";
import { GlassCard } from "@/components/ui";
import type { RediscoveryCard } from "@/lib/api/hooks";

export function RediscoveryCardView({ card }: { card: RediscoveryCard }) {
  return (
    <GlassCard padding="md" rounded="2xl" style={{ width: 160 }}>
      <View className="mb-2 h-2 w-2 rounded-full" style={{ backgroundColor: card.color }} />
      <Text className="text-2xl font-sans-bold text-white">{card.count}</Text>
      <Text className="mt-1 text-[13px] font-sans-medium text-white/85">{card.title}</Text>
      <Text numberOfLines={2} className="mt-1 text-[11px] text-white/45">
        {card.desc}
      </Text>
    </GlassCard>
  );
}

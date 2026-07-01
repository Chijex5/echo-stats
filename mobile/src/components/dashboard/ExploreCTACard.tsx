import { Pressable, Text, View } from "react-native";
import { ChevronRight, type LucideIcon } from "lucide-react-native";
import { GlassCard } from "@/components/ui";
import { colors, alpha } from "@/lib/theme/tokens";

type ExploreCTACardProps = {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  onPress: () => void;
};

export function ExploreCTACard({ title, subtitle, icon: Icon, onPress }: ExploreCTACardProps) {
  return (
    <Pressable onPress={onPress}>
      <GlassCard padding="md" rounded="2xl">
        <View className="flex-row items-center gap-3">
          <View className="h-10 w-10 items-center justify-center rounded-xl bg-echo-green/10">
            <Icon size={18} color={colors.echoGreen} />
          </View>
          <View className="flex-1">
            <Text className="text-14 font-sans-semibold text-white">{title}</Text>
            <Text numberOfLines={1} className="text-12 text-white/45">
              {subtitle}
            </Text>
          </View>
          <ChevronRight size={18} color={alpha.white(0.35)} />
        </View>
      </GlassCard>
    </Pressable>
  );
}

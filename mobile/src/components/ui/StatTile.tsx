import { View, Text } from "react-native";
import { cn } from "@/lib/cn";

type StatTileProps = {
  label: string;
  value: string | number;
  variant?: "default" | "serif-lg";
  accentColor?: string;
};

export function StatTile({ label, value, variant = "default", accentColor }: StatTileProps) {
  return (
    <View className="flex-1 rounded-xl border border-white/5 bg-white/[0.03] p-3.5">
      <Text className="text-[10px] font-sans uppercase tracking-widest2 text-white/35">{label}</Text>
      <Text
        className={cn(
          "mt-1.5",
          variant === "serif-lg" ? "text-2xl font-serif italic text-white" : "text-lg font-sans-bold text-white"
        )}
        style={accentColor ? { color: accentColor } : undefined}
      >
        {value}
      </Text>
    </View>
  );
}

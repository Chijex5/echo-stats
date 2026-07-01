import { View, Text, type DimensionValue } from "react-native";
import { cn } from "@/lib/cn";

type StatTileProps = {
  label: string;
  value: string | number;
  variant?: "default" | "serif-lg";
  accentColor?: string;
  /** Fixed width for use inside a horizontal ScrollView; omit to `flex-1` in a wrapping row. */
  width?: DimensionValue;
};

export function StatTile({ label, value, variant = "default", accentColor, width }: StatTileProps) {
  return (
    <View
      className={cn("rounded-xl border border-white/5 bg-white/[0.03] p-3.5", width === undefined && "flex-1")}
      style={width !== undefined ? { width } : undefined}
    >
      <Text className="text-10 font-sans uppercase tracking-widest2 text-white/35">{label}</Text>
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

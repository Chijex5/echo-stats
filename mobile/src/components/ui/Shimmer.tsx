import { View, type DimensionValue } from "react-native";
import { MotiView } from "moti";
import { cn } from "@/lib/cn";

type ShimmerProps = {
  width?: DimensionValue;
  height?: DimensionValue;
  rounded?: "lg" | "xl" | "full";
  className?: string;
};

const ROUNDED = {
  lg: "rounded-lg",
  xl: "rounded-xl",
  full: "rounded-full",
} as const;

export function Shimmer({ width = "100%", height = 16, rounded = "lg", className }: ShimmerProps) {
  return (
    <View
      className={cn("overflow-hidden bg-white/5", ROUNDED[rounded], className)}
      style={{ width, height }}
    >
      <MotiView
        from={{ opacity: 0.3 }}
        animate={{ opacity: 0.7 }}
        transition={{
          type: "timing",
          duration: 900,
          loop: true,
          repeatReverse: true,
        }}
        className="flex-1 bg-white/10"
      />
    </View>
  );
}

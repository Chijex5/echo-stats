import { View, StyleSheet, type DimensionValue, type ViewStyle } from "react-native";
import { MotiView } from "moti";
import { alpha, radius } from "@/lib/theme/tokens";

type ShimmerProps = {
  width?: DimensionValue;
  height?: DimensionValue;
  rounded?: "lg" | "xl" | "full";
  style?: ViewStyle;
};

const ROUNDED: Record<NonNullable<ShimmerProps["rounded"]>, number> = {
  lg: 8,
  xl: radius.xl,
  full: radius.full,
};

export function Shimmer({ width = "100%", height = 16, rounded = "lg", style }: ShimmerProps) {
  return (
    <View style={[styles.base, { width, height, borderRadius: ROUNDED[rounded] }, style]}>
      <MotiView
        from={{ opacity: 0.3 }}
        animate={{ opacity: 0.7 }}
        transition={{
          type: "timing",
          duration: 900,
          loop: true,
          repeatReverse: true,
        }}
        style={styles.fill}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  base: { overflow: "hidden", backgroundColor: alpha.white(0.05) },
  fill: { flex: 1, backgroundColor: alpha.white(0.1) },
});

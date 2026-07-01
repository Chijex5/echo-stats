import { View, StyleSheet, type ViewStyle, type StyleProp } from "react-native";
import { shadows, colors, radius, alpha } from "@/lib/theme/tokens";

type GlassCardProps = {
  children: React.ReactNode;
  padding?: "none" | "sm" | "md" | "lg";
  rounded?: "xl" | "2xl";
  glow?: boolean;
  style?: StyleProp<ViewStyle>;
};

const PADDING: Record<NonNullable<GlassCardProps["padding"]>, number> = {
  none: 0,
  sm: 12,
  md: 16,
  lg: 24,
};

const ROUNDED: Record<NonNullable<GlassCardProps["rounded"]>, number> = {
  xl: radius.xl,
  "2xl": radius["2xl"],
};

// Flat solid card surface — one shade lighter than the app background with a
// subtle border, the standard mobile "elevated surface" pattern. Previously
// a blurred "glass" effect mirroring the web app; removed because BlurView
// doesn't reliably render everywhere and mobile should use plain,
// predictable solid colors.
export function GlassCard({ children, padding = "md", rounded = "2xl", glow = false, style }: GlassCardProps) {
  return (
    <View
      style={[styles.base, { borderRadius: ROUNDED[rounded] }, glow ? shadows.glowSpotify : null, style]}
    >
      <View style={{ padding: PADDING[padding] }}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    overflow: "hidden",
    borderWidth: 1,
    borderColor: alpha.white(0.1),
    backgroundColor: colors.backgroundElevated,
  },
});

import { View, StyleSheet, type ViewStyle, type StyleProp } from "react-native";
import { shadows, colors, radius } from "@/lib/theme/tokens";

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

// Borderless filled card surface (Spotify-style): a neutral fill one shade
// lighter than the near-black background reads as "elevated" without an
// outline. Borders are a web tell — native music UIs distinguish surfaces by
// fill alone.
export function GlassCard({ children, padding = "md", rounded = "2xl", glow = false, style }: GlassCardProps) {
  return (
    <View style={[styles.base, { borderRadius: ROUNDED[rounded] }, glow ? shadows.glowSpotify : null, style]}>
      <View style={{ padding: PADDING[padding] }}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    overflow: "hidden",
    backgroundColor: colors.surface,
  },
});

import { View, type ViewStyle, type StyleProp } from "react-native";
import { cn } from "@/lib/cn";
import { shadows } from "@/lib/theme/tokens";

type GlassCardProps = {
  children: React.ReactNode;
  padding?: "none" | "sm" | "md" | "lg";
  rounded?: "xl" | "2xl";
  glow?: boolean;
  className?: string;
  style?: StyleProp<ViewStyle>;
};

const PADDING = {
  none: "p-0",
  sm: "p-3",
  md: "p-4",
  lg: "p-6",
} as const;

const ROUNDED = {
  xl: "rounded-xl",
  "2xl": "rounded-2xl",
} as const;

// Flat solid card surface — one shade lighter than the app background
// (bg-background-elevated) with a subtle border, the standard mobile
// "elevated surface" pattern. Previously a blurred "glass" effect mirroring
// the web app; removed because BlurView doesn't reliably render everywhere
// and mobile should use plain, predictable solid colors.
export function GlassCard({
  children,
  padding = "md",
  rounded = "2xl",
  glow = false,
  className,
  style,
}: GlassCardProps) {
  return (
    <View
      className={cn("overflow-hidden border border-white/10 bg-background-elevated", ROUNDED[rounded], className)}
      style={[glow ? shadows.glowSpotify : null, style]}
    >
      <View className={PADDING[padding]}>{children}</View>
    </View>
  );
}

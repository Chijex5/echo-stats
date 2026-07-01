import { View, type ViewStyle, type StyleProp } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { cn } from "@/lib/cn";
import { shadows, alpha } from "@/lib/theme/tokens";

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
      className={cn("overflow-hidden border border-white/[0.06]", ROUNDED[rounded], className)}
      style={[glow ? shadows.glowSpotify : null, style]}
    >
      <BlurView
        intensity={20}
        tint="dark"
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
      />
      <LinearGradient
        colors={[alpha.white(0.02), alpha.white(0.01)]}
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
      />
      <View className={PADDING[padding]}>{children}</View>
    </View>
  );
}

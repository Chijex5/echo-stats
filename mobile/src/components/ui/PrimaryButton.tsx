import { useState } from "react";
import { Pressable, Text, ActivityIndicator, type StyleProp, type ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MotiView } from "moti";
import type { LucideIcon } from "lucide-react-native";
import { cn } from "@/lib/cn";
import { shadows } from "@/lib/theme/tokens";

type ButtonVariant = "spotify-gradient" | "spotify-solid" | "outline";

type PrimaryButtonProps = {
  label: string;
  variant?: ButtonVariant;
  icon?: LucideIcon;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

export function PrimaryButton({
  label,
  variant = "spotify-gradient",
  icon: Icon,
  loading = false,
  disabled = false,
  fullWidth = false,
  onPress,
  style,
}: PrimaryButtonProps) {
  const [pressed, setPressed] = useState(false);
  const isDisabled = disabled || loading;

  const content = (
    <MotiView
      animate={{ scale: pressed ? 0.97 : 1 }}
      transition={{ type: "timing", duration: 120 }}
      className={cn(
        "flex-row items-center justify-center gap-2 rounded-full px-6 py-3.5",
        fullWidth && "w-full",
        isDisabled && "opacity-50"
      )}
      style={variant === "spotify-gradient" ? shadows.spotifyCta : undefined}
    >
      {loading ? (
        <ActivityIndicator color={variant === "spotify-solid" ? "#000" : "#05210f"} />
      ) : (
        <>
          {Icon ? (
            <Icon size={16} color={variant === "outline" ? "rgba(255,255,255,0.9)" : variant === "spotify-solid" ? "#000" : "#05210f"} />
          ) : null}
          <Text
            className={cn(
              "text-[15px] font-sans-semibold",
              variant === "outline" ? "text-white/90" : variant === "spotify-solid" ? "text-black" : "text-[#05210f]"
            )}
          >
            {label}
          </Text>
        </>
      )}
    </MotiView>
  );

  return (
    <Pressable
      onPress={isDisabled ? undefined : onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      disabled={isDisabled}
      style={style}
    >
      {variant === "spotify-gradient" ? (
        <LinearGradient
          colors={["rgba(24,216,126,0.16)", "rgba(24,216,126,0.06)"]}
          className={cn("rounded-full border border-echo-green/25", fullWidth && "w-full")}
        >
          {content}
        </LinearGradient>
      ) : variant === "spotify-solid" ? (
        <MotiView className={cn("rounded-full bg-spotify", fullWidth && "w-full")}>{content}</MotiView>
      ) : (
        <MotiView className={cn("rounded-full bg-transparent border border-white/[0.08]", fullWidth && "w-full")}>
          {content}
        </MotiView>
      )}
    </Pressable>
  );
}

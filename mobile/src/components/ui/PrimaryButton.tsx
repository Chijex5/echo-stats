import { useState } from "react";
import { Pressable, Text, ActivityIndicator, StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MotiView } from "moti";
import type { LucideIcon } from "lucide-react-native";
import { shadows, colors, alpha, radius, fontSize } from "@/lib/theme/tokens";

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
  const onColor = variant === "spotify-solid" ? colors.black : colors.onSpotify;

  const content = (
    <MotiView
      animate={{ scale: pressed ? 0.97 : 1 }}
      transition={{ type: "timing", duration: 120 }}
      style={[styles.content, fullWidth && styles.fullWidth, isDisabled && styles.disabled, variant === "spotify-gradient" ? shadows.spotifyCta : undefined]}
    >
      {loading ? (
        <ActivityIndicator color={onColor} />
      ) : (
        <>
          {Icon ? <Icon size={16} color={variant === "outline" ? alpha.white(0.9) : onColor} /> : null}
          <Text style={[styles.label, { color: variant === "outline" ? alpha.white(0.9) : onColor }]}>{label}</Text>
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
          colors={[alpha.spotify(0.16), alpha.spotify(0.06)]}
          style={[styles.pill, styles.gradientBorder, fullWidth && styles.fullWidth]}
        >
          {content}
        </LinearGradient>
      ) : variant === "spotify-solid" ? (
        <MotiView style={[styles.pill, { backgroundColor: colors.spotify }, fullWidth && styles.fullWidth]}>{content}</MotiView>
      ) : (
        <MotiView style={[styles.pill, styles.outlineBorder, fullWidth && styles.fullWidth]}>{content}</MotiView>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: radius.full,
  },
  fullWidth: { width: "100%" },
  disabled: { opacity: 0.5 },
  pill: { borderRadius: radius.full },
  gradientBorder: { borderWidth: 1, borderColor: alpha.spotify(0.25) },
  outlineBorder: { borderWidth: 1, borderColor: alpha.white(0.08), backgroundColor: "transparent" },
  label: {
    fontSize: fontSize[15],
    fontFamily: "GeistSansSemiBold",
  },
});

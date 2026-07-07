import { Pressable, Text, StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import type { LucideIcon } from "lucide-react-native";
import { shadows, colors, alpha, radius, fontSize } from "@/lib/theme/tokens";

type PillVariant = "default" | "spotify" | "outline";

type PillProps = {
  label: string;
  selected?: boolean;
  variant?: PillVariant;
  icon?: LucideIcon;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

const VARIANT_UNSELECTED: Record<PillVariant, ViewStyle> = {
  default: { backgroundColor: alpha.white(0.03), borderColor: alpha.white(0.1) },
  spotify: { backgroundColor: alpha.white(0.03), borderColor: alpha.white(0.1) },
  outline: { backgroundColor: "transparent", borderColor: alpha.white(0.1) },
};

const VARIANT_SELECTED: Record<PillVariant, ViewStyle> = {
  default: { backgroundColor: alpha.white(0.1), borderColor: alpha.white(0.2) },
  spotify: { backgroundColor: alpha.spotify(0.15), borderColor: alpha.spotify(0.4) },
  outline: { backgroundColor: alpha.white(0.05), borderColor: alpha.white(0.3) },
};

const LABEL_COLOR: Record<PillVariant, string> = {
  default: alpha.white(0.9),
  spotify: colors.spotifyLight,
  outline: alpha.white(0.9),
};

export function Pill({ label, selected = false, variant = "default", icon: Icon, onPress, style }: PillProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.base,
        selected ? VARIANT_SELECTED[variant] : VARIANT_UNSELECTED[variant],
        selected && variant === "spotify" ? shadows.glowSpotify : null,
        style,
      ]}
    >
      {Icon ? <Icon size={13} color={selected ? colors.spotifyLight : alpha.white(0.6)} /> : null}
      <Text style={[styles.label, { color: selected ? LABEL_COLOR[variant] : alpha.white(0.6) }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: radius.full,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
  },
  label: {
    fontSize: fontSize[13],
    fontFamily: "GeistSans",
  },
});

import { Pressable, Text, type StyleProp, type ViewStyle } from "react-native";
import type { LucideIcon } from "lucide-react-native";
import { cn } from "@/lib/cn";
import { shadows } from "@/lib/theme/tokens";

type PillVariant = "default" | "spotify" | "outline";

type PillProps = {
  label: string;
  selected?: boolean;
  variant?: PillVariant;
  icon?: LucideIcon;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

const BASE = "flex-row items-center gap-1.5 rounded-full px-3.5 py-2 border";

const VARIANT_UNSELECTED: Record<PillVariant, string> = {
  default: "bg-white/[0.03] border-white/10",
  spotify: "bg-white/[0.03] border-white/10",
  outline: "bg-transparent border-white/10",
};

const VARIANT_SELECTED: Record<PillVariant, string> = {
  default: "bg-white/10 border-white/20",
  spotify: "bg-spotify/15 border-spotify/40",
  outline: "bg-white/5 border-white/30",
};

const LABEL_SELECTED: Record<PillVariant, string> = {
  default: "text-white/90",
  spotify: "text-spotify-light",
  outline: "text-white/90",
};

export function Pill({ label, selected = false, variant = "default", icon: Icon, onPress, style }: PillProps) {
  return (
    <Pressable
      onPress={onPress}
      className={cn(BASE, selected ? VARIANT_SELECTED[variant] : VARIANT_UNSELECTED[variant])}
      style={[selected && variant === "spotify" ? shadows.glowSpotify : null, style]}
    >
      {Icon ? <Icon size={13} color={selected ? "#22e065" : "rgba(255,255,255,0.6)"} /> : null}
      <Text className={cn("text-[13px] font-sans", selected ? LABEL_SELECTED[variant] : "text-white/60")}>
        {label}
      </Text>
    </Pressable>
  );
}

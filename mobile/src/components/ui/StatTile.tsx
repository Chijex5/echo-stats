import { View, Text } from "react-native";
import { cn } from "@/lib/cn";

type StatTileProps = {
  label: string;
  value: string | number;
  variant?: "default" | "serif-lg";
  accentColor?: string;
};

export function StatTile({
  label,
  value,
  accentColor,
}: {
  label: string;
  value: string | number;
  accentColor?: string;
}) {
  return (
    <View
      style={{
        width: "30%",
        minWidth: 100,
        backgroundColor: "rgba(255,255,255,0.03)",
        borderWidth: 0.5,
        borderColor: "rgba(255,255,255,0.06)",
        borderRadius: 12,
        padding: 12,
      }}
    >
      <Text
        style={{
          fontSize: 10,
          color: "rgba(255,255,255,0.35)",
          textTransform: "uppercase",
          letterSpacing: 1.2,
          marginBottom: 6,
        }}
        numberOfLines={1}
      >
        {label}
      </Text>
      <Text
        style={{
          fontSize: 18,
          fontWeight: "700",
          color: accentColor ?? "#ffffff",
        }}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {value}
      </Text>
    </View>
  );
}

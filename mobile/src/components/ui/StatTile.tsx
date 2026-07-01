import { View, Text, StyleSheet, type DimensionValue } from "react-native";
import { colors, alpha, fontSize, trackingWidest2 } from "@/lib/theme/tokens";

type StatTileProps = {
  label: string;
  value: string | number;
  variant?: "default" | "serif-lg";
  accentColor?: string;
  /** Fixed width for use inside a horizontal ScrollView; omit to `flex-1` in a wrapping row. */
  width?: DimensionValue;
};

export function StatTile({ label, value, variant = "default", accentColor, width }: StatTileProps) {
  return (
    <View style={[styles.tile, width === undefined ? styles.flexFill : { width }]}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[variant === "serif-lg" ? styles.valueSerif : styles.valueBold, accentColor ? { color: accentColor } : null]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: alpha.white(0.05),
    backgroundColor: alpha.white(0.03),
    padding: 14,
  },
  flexFill: { flex: 1 },
  label: {
    fontSize: fontSize[10],
    fontFamily: "GeistSans",
    textTransform: "uppercase",
    letterSpacing: trackingWidest2(fontSize[10]),
    color: alpha.white(0.35),
  },
  valueBold: {
    marginTop: 6,
    fontSize: fontSize[18],
    fontFamily: "GeistSansBold",
    color: colors.white,
  },
  valueSerif: {
    marginTop: 6,
    fontSize: fontSize[24],
    fontFamily: "PlayfairDisplayItalic",
    fontStyle: "italic",
    color: colors.white,
  },
});

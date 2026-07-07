import { Text, StyleSheet, type TextStyle } from "react-native";
import { alpha, fontSize, trackingWidest2 } from "@/lib/theme/tokens";

type EyebrowLabelProps = {
  children: string;
  style?: TextStyle;
};

export function EyebrowLabel({ children, style }: EyebrowLabelProps) {
  return <Text style={[styles.label, style]}>{children}</Text>;
}

const styles = StyleSheet.create({
  label: {
    fontSize: fontSize[10],
    fontFamily: "GeistSans",
    color: alpha.white(0.35),
    textTransform: "uppercase",
    letterSpacing: trackingWidest2(fontSize[10]),
  },
});

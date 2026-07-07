import { View, Text, StyleSheet } from "react-native";
import { EyebrowLabel } from "./EyebrowLabel";
import { colors, alpha, fontSize } from "@/lib/theme/tokens";

type SectionHeadingProps = {
  label?: string;
  title: string;
  accentWord?: string;
  subtitle?: string;
  align?: "left" | "center";
};

export function SectionHeading({ label, title, accentWord, subtitle, align = "left" }: SectionHeadingProps) {
  const centered = align === "center";
  return (
    <View style={{ alignItems: centered ? "center" : "flex-start" }}>
      {label ? <EyebrowLabel style={styles.eyebrow}>{label}</EyebrowLabel> : null}
      <Text style={[styles.title, centered && styles.centerText]}>
        {title}
        {accentWord ? <Text style={styles.accent}> {accentWord}</Text> : null}
      </Text>
      {subtitle ? <Text style={[styles.subtitle, centered && styles.centerText]}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  eyebrow: { marginBottom: 8 },
  title: {
    fontSize: fontSize[20],
    fontFamily: "GeistSansBold",
    color: colors.white,
  },
  accent: {
    fontFamily: "PlayfairDisplayItalic",
    fontStyle: "italic",
    color: colors.echoGreen,
  },
  subtitle: {
    marginTop: 6,
    fontSize: fontSize[13],
    fontFamily: "GeistSans",
    color: alpha.white(0.45),
  },
  centerText: { textAlign: "center" },
});

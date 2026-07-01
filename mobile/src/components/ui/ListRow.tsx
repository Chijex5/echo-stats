import { View, Text, Image, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { alpha, fontSize, radius } from "@/lib/theme/tokens";

type ListRowProps = {
  imageUrl?: string | null;
  fallbackGradient?: [string, string];
  title: string;
  subtitle?: string;
  trailing?: React.ReactNode;
  rounded?: "lg" | "full";
};

export function ListRow({
  imageUrl,
  fallbackGradient = [alpha.spotify(0.25), alpha.teal(0.1)],
  title,
  subtitle,
  trailing,
  rounded = "lg",
}: ListRowProps) {
  const borderRadius = rounded === "full" ? radius.full : 8;
  return (
    <View style={styles.row}>
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={[styles.thumb, { borderRadius }]} />
      ) : (
        <LinearGradient colors={fallbackGradient} style={[styles.thumb, { borderRadius }]} />
      )}
      <View style={styles.text}>
        <Text numberOfLines={1} style={styles.title}>
          {title}
        </Text>
        {subtitle ? (
          <Text numberOfLines={1} style={styles.subtitle}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {trailing}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10 },
  thumb: { height: 48, width: 48 },
  text: { flex: 1 },
  title: { fontSize: fontSize[14], fontFamily: "GeistSansMedium", color: alpha.white(0.9) },
  subtitle: { marginTop: 2, fontSize: fontSize[12], fontFamily: "GeistSans", color: alpha.white(0.45) },
});

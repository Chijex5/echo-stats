import { View, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { colors, backgroundGradient } from "@/lib/theme/tokens";

// RN has no CSS radial-gradient. This approximates the web vignette
// (app/globals.css body background) with a linear base + two blurred,
// tinted circles in the corners where the web's radial glows sit.
// Mount once at the tab-navigator root — not per-screen — so the glows
// don't pop/reset on every tab switch.
export function AppBackground({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.fill}>
      <LinearGradient colors={backgroundGradient} style={styles.fill} />
      <View style={[styles.blob, styles.blobTopLeft]}>
        <View style={[styles.blobFill, { backgroundColor: colors.echoGreen, opacity: 0.06 }]} />
        <BlurView intensity={80} tint="dark" style={styles.fill} />
      </View>
      <View style={[styles.blob, styles.blobBottomRight]}>
        <View style={[styles.blobFill, { backgroundColor: colors.echoTeal, opacity: 0.04 }]} />
        <BlurView intensity={80} tint="dark" style={styles.fill} />
      </View>
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
  content: { flex: 1 },
  blob: {
    position: "absolute",
    width: 480,
    height: 480,
    borderRadius: 240,
    overflow: "hidden",
  },
  blobFill: { flex: 1 },
  blobTopLeft: { top: -180, left: -180 },
  blobBottomRight: { bottom: -180, right: -180 },
});

import { View, Text, StyleSheet } from "react-native";
import Animated, { useAnimatedStyle, useDerivedValue, withTiming } from "react-native-reanimated";
import { palettes, alpha, fontSize } from "@/lib/theme/tokens";
import type { GenreNode } from "@/lib/api/hooks";

const BAR_COLORS = palettes.chartCategory;

function GenreBar({ genre, pct, color, rank }: { genre: string; pct: number; color: string; rank: number }) {
  const animatedPct = useDerivedValue(() => withTiming(pct, { duration: 600 }));
  const style = useAnimatedStyle(() => ({ width: `${animatedPct.value}%` }));

  return (
    <View style={styles.bar}>
      <View style={styles.header}>
        <Text numberOfLines={1} style={styles.genre}>
          {rank}. {genre}
        </Text>
        <Text style={styles.pct}>{Math.round(pct)}%</Text>
      </View>
      <View style={styles.track}>
        <Animated.View style={[styles.fill, { backgroundColor: color }, style]} />
      </View>
    </View>
  );
}

// Replaces the web's force-directed genre DNA graph: a 200-iteration physics
// simulation isn't worth porting for a decorative visual when a ranked bar
// list communicates the same percentage-of-listening data more legibly on a
// small screen.
export function GenreBarList({ genres }: { genres: GenreNode[] }) {
  const top = [...genres].sort((a, b) => b.percentage - a.percentage).slice(0, 8);

  if (!top.length) {
    return <Text style={styles.empty}>Not enough genre data yet.</Text>;
  }

  return (
    <View>
      {top.map((node, i) => (
        <GenreBar key={node.genre} genre={node.genre} pct={node.percentage} color={BAR_COLORS[i % BAR_COLORS.length]} rank={i + 1} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { marginBottom: 12 },
  header: { marginBottom: 6, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  genre: { flex: 1, fontSize: fontSize[13], fontFamily: "GeistSansMedium", textTransform: "capitalize", color: alpha.white(0.8) },
  pct: { fontSize: fontSize[12], color: alpha.white(0.4) },
  track: { height: 8, overflow: "hidden", borderRadius: 999, backgroundColor: alpha.white(0.05) },
  fill: { height: "100%", borderRadius: 999 },
  empty: { fontSize: fontSize[13], color: alpha.white(0.4) },
});

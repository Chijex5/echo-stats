import { View, Text, StyleSheet } from "react-native";
import Animated, { useAnimatedStyle, useDerivedValue, withTiming } from "react-native-reanimated";
import { alpha, fontSize } from "@/lib/theme/tokens";

type Segment = {
  label: string;
  pct: number;
  color: string;
};

type ProportionalBarsProps = {
  segments: Segment[];
  height?: number;
  showLegend?: boolean;
};

function AnimatedSegment({ widthPct, color, marginRight }: { widthPct: number; color: string; marginRight: number }) {
  const animatedWidthPct = useDerivedValue(() => withTiming(widthPct, { duration: 600 }));
  const style = useAnimatedStyle(() => ({ width: `${animatedWidthPct.value}%` }));
  return <Animated.View style={[{ backgroundColor: color, marginRight }, style]} />;
}

export function ProportionalBars({ segments, height = 10, showLegend = true }: ProportionalBarsProps) {
  const total = segments.reduce((sum, s) => sum + s.pct, 0) || 1;

  return (
    <View>
      <View style={[styles.track, { height }]}>
        {segments.map((segment, i) => (
          <AnimatedSegment
            key={segment.label + i}
            widthPct={(segment.pct / total) * 100}
            color={segment.color}
            marginRight={i === segments.length - 1 ? 0 : 1}
          />
        ))}
      </View>
      {showLegend ? (
        <View style={styles.legend}>
          {segments.map((segment, i) => (
            <View key={segment.label + i} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: segment.color }]} />
              <Text style={styles.legendText}>
                {segment.label} · {Math.round(segment.pct)}%
              </Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  track: { flexDirection: "row", overflow: "hidden", borderRadius: 999, backgroundColor: alpha.white(0.05) },
  legend: { marginTop: 12, flexDirection: "row", flexWrap: "wrap", gap: 12 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  legendDot: { height: 8, width: 8, borderRadius: 999 },
  legendText: { fontSize: fontSize[11], color: alpha.white(0.6) },
});

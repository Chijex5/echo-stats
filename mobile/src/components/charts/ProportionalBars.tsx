import { View, Text } from "react-native";
import Animated, { useAnimatedStyle, useDerivedValue, withTiming } from "react-native-reanimated";

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
      <View className="flex-row overflow-hidden rounded-full bg-white/5" style={{ height }}>
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
        <View className="mt-3 flex-row flex-wrap gap-3">
          {segments.map((segment, i) => (
            <View key={segment.label + i} className="flex-row items-center gap-1.5">
              <View className="h-2 w-2 rounded-full" style={{ backgroundColor: segment.color }} />
              <Text className="text-11 text-white/60">
                {segment.label} · {Math.round(segment.pct)}%
              </Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

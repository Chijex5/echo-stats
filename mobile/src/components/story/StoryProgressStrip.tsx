import { View, StyleSheet } from "react-native";
import Animated, { useAnimatedStyle, type SharedValue } from "react-native-reanimated";
import { colors, alpha, radius } from "@/lib/theme/tokens";

function Segment({ state, progress }: { state: "done" | "active" | "upcoming"; progress: SharedValue<number> }) {
  const style = useAnimatedStyle(() => ({
    width: state === "done" ? "100%" : state === "active" ? `${progress.value}%` : "0%",
  }));
  return (
    <View style={styles.track}>
      <Animated.View style={[styles.fill, style]} />
    </View>
  );
}

export function StoryProgressStrip({
  count,
  activeIndex,
  progress,
}: {
  count: number;
  activeIndex: number;
  progress: SharedValue<number>;
}) {
  return (
    <View style={styles.row}>
      {Array.from({ length: count }).map((_, i) => (
        <Segment key={i} state={i < activeIndex ? "done" : i === activeIndex ? "active" : "upcoming"} progress={progress} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 6 },
  track: { height: 4, flex: 1, overflow: "hidden", borderRadius: radius.full, backgroundColor: alpha.white(0.2) },
  fill: { height: "100%", borderRadius: radius.full, backgroundColor: colors.white },
});

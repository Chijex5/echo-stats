import { View } from "react-native";
import Animated, { useAnimatedStyle, type SharedValue } from "react-native-reanimated";
import { colors, radius } from "@/lib/theme/tokens";

function Segment({ state, progress }: { state: "done" | "active" | "upcoming"; progress: SharedValue<number> }) {
  const style = useAnimatedStyle(() => ({
    width: state === "done" ? "100%" : state === "active" ? `${progress.value}%` : "0%",
  }));
  return (
    <View className="h-1 flex-1 overflow-hidden rounded-full bg-white/20">
      <Animated.View style={[{ height: "100%", borderRadius: radius.full, backgroundColor: colors.white }, style]} />
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
    <View className="flex-row gap-1.5">
      {Array.from({ length: count }).map((_, i) => (
        <Segment key={i} state={i < activeIndex ? "done" : i === activeIndex ? "active" : "upcoming"} progress={progress} />
      ))}
    </View>
  );
}

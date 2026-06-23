import { View, Text } from "react-native";
import Animated, { useAnimatedStyle, useDerivedValue, withTiming } from "react-native-reanimated";
import { colors } from "@/lib/theme/tokens";
import type { GenreNode } from "@/lib/api/hooks";

const BAR_COLORS = [colors.echoGreen, "#60a5fa", "#a78bfa", "#f59e0b", "#f87171", "#34d399", "#fb7185", "#38bdf8"];

function GenreBar({ genre, pct, color, rank }: { genre: string; pct: number; color: string; rank: number }) {
  const animatedPct = useDerivedValue(() => withTiming(pct, { duration: 600 }));
  const style = useAnimatedStyle(() => ({ width: `${animatedPct.value}%` }));

  return (
    <View className="mb-3">
      <View className="mb-1.5 flex-row items-center justify-between">
        <Text numberOfLines={1} className="flex-1 text-[13px] font-sans-medium capitalize text-white/80">
          {rank}. {genre}
        </Text>
        <Text className="text-[12px] text-white/40">{Math.round(pct)}%</Text>
      </View>
      <View className="h-2 overflow-hidden rounded-full bg-white/5">
        <Animated.View style={[{ height: "100%", borderRadius: 999, backgroundColor: color }, style]} />
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
    return <Text className="text-[13px] text-white/40">Not enough genre data yet.</Text>;
  }

  return (
    <View>
      {top.map((node, i) => (
        <GenreBar key={node.genre} genre={node.genre} pct={node.percentage} color={BAR_COLORS[i % BAR_COLORS.length]} rank={i + 1} />
      ))}
    </View>
  );
}

import { View, Text } from "react-native";
import Svg, { Circle } from "react-native-svg";
import Animated, { useAnimatedProps, useDerivedValue, withTiming } from "react-native-reanimated";
import { colors } from "@/lib/theme/tokens";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const RADIUS = 40;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

type ProgressRingProps = {
  progress: number;
  size?: number;
};

export function ProgressRing({ progress, size = 96 }: ProgressRingProps) {
  const animatedProgress = useDerivedValue(() => withTiming(progress, { duration: 200 }));
  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: CIRCUMFERENCE * (1 - animatedProgress.value / 100),
  }));

  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <Svg width={size} height={size} viewBox="0 0 100 100" style={{ transform: [{ rotate: "-90deg" }] }}>
        <Circle cx={50} cy={50} r={RADIUS} stroke="rgba(255,255,255,0.1)" strokeWidth={4} fill="transparent" />
        <AnimatedCircle
          cx={50}
          cy={50}
          r={RADIUS}
          stroke={colors.spotify}
          strokeWidth={4}
          fill="transparent"
          strokeDasharray={CIRCUMFERENCE}
          strokeLinecap="round"
          animatedProps={animatedProps}
        />
      </Svg>
      <View style={{ position: "absolute", alignItems: "center", justifyContent: "center" }}>
        <Text className="text-xl font-sans-semibold text-white">{Math.round(progress)}%</Text>
      </View>
    </View>
  );
}

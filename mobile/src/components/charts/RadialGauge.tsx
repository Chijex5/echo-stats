import { View, Text } from "react-native";
import Svg, { Circle } from "react-native-svg";
import Animated, { useAnimatedProps, useDerivedValue, withTiming } from "react-native-reanimated";
import { colors, alpha } from "@/lib/theme/tokens";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const RADIUS = 40;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

type RadialGaugeProps = {
  value: number;
  min: number;
  max: number;
  size?: number;
  label?: string;
  valueLabel?: string;
  accentColor?: string;
};

// Generalizes ProgressRing's 0-100 percent ring to an arbitrary min/max
// range, kept as a sibling rather than a modification so onboarding's
// ProgressRing stays untouched.
export function RadialGauge({ value, min, max, size = 96, label, valueLabel, accentColor = colors.echoGreen }: RadialGaugeProps) {
  const pct = max > min ? Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100)) : 0;
  const animatedProgress = useDerivedValue(() => withTiming(pct, { duration: 600 }));
  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: CIRCUMFERENCE * (1 - animatedProgress.value / 100),
  }));

  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <Svg width={size} height={size} viewBox="0 0 100 100" style={{ transform: [{ rotate: "-90deg" }] }}>
        <Circle cx={50} cy={50} r={RADIUS} stroke={alpha.white(0.1)} strokeWidth={4} fill="transparent" />
        <AnimatedCircle
          cx={50}
          cy={50}
          r={RADIUS}
          stroke={accentColor}
          strokeWidth={4}
          fill="transparent"
          strokeDasharray={CIRCUMFERENCE}
          strokeLinecap="round"
          animatedProps={animatedProps}
        />
      </Svg>
      <View style={{ position: "absolute", alignItems: "center", justifyContent: "center" }}>
        <Text className="text-lg font-sans-bold text-white">{valueLabel ?? Math.round(value)}</Text>
        {label ? <Text className="text-10 uppercase tracking-widest2 text-white/35">{label}</Text> : null}
      </View>
    </View>
  );
}

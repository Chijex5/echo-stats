import { View } from "react-native";
import Svg, { Path } from "react-native-svg";
import Animated, { useAnimatedProps, useDerivedValue, withTiming } from "react-native-reanimated";
import { colors } from "@/lib/theme/tokens";

const AnimatedPath = Animated.createAnimatedComponent(Path);

type SparklineProps = {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  strokeWidth?: number;
};

function buildPath(data: number[], width: number, height: number, padding = 4) {
  if (data.length < 2) return { path: "", length: 0 };
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const stepX = (width - padding * 2) / (data.length - 1);
  const points = data.map((v, i) => ({
    x: padding + i * stepX,
    y: padding + (1 - (v - min) / range) * (height - padding * 2),
  }));

  let path = `M ${points[0].x} ${points[0].y}`;
  let length = 0;
  for (let i = 1; i < points.length; i++) {
    path += ` L ${points[i].x} ${points[i].y}`;
    length += Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y);
  }
  return { path, length };
}

export function Sparkline({ data, width = 80, height = 32, color = colors.echoGreen, strokeWidth = 2 }: SparklineProps) {
  const { path, length } = buildPath(data, width, height);
  const progress = useDerivedValue(() => withTiming(1, { duration: 600 }));
  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: length * (1 - progress.value),
  }));

  if (!path) return <View style={{ width, height }} />;

  return (
    <Svg width={width} height={height}>
      <AnimatedPath
        d={path}
        stroke={color}
        strokeWidth={strokeWidth}
        fill="transparent"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={length}
        animatedProps={animatedProps}
      />
    </Svg>
  );
}

import { useEffect } from "react";
import { View } from "react-native";
import { MotiView } from "moti";
import Svg, { Circle, Ellipse, Path, Polygon, Rect, Line } from "react-native-svg";
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming, Easing } from "react-native-reanimated";

type DecorationProps = { color: string; size?: number };

function useSpin(durationMs: number, reverse = false) {
  const rotation = useSharedValue(0);
  useEffect(() => {
    rotation.value = 0;
    rotation.value = withRepeat(withTiming(reverse ? -360 : 360, { duration: durationMs, easing: Easing.linear }), -1, false);
  }, [durationMs, reverse, rotation]);
  return useAnimatedStyle(() => ({ transform: [{ rotate: `${rotation.value}deg` }] }));
}

export function VinylDecoration({ color, size = 200 }: DecorationProps) {
  const spin = useSpin(6000);
  return (
    <Animated.View style={spin}>
      <Svg width={size} height={size} viewBox="0 0 200 200">
        <Circle cx={100} cy={100} r={92} fill="rgba(255,255,255,0.04)" stroke={color} strokeOpacity={0.35} strokeWidth={1.5} />
        <Circle cx={100} cy={100} r={70} fill="none" stroke={color} strokeOpacity={0.22} strokeWidth={1} />
        <Circle cx={100} cy={100} r={50} fill="none" stroke={color} strokeOpacity={0.22} strokeWidth={1} />
        <Circle cx={100} cy={100} r={30} fill="none" stroke={color} strokeOpacity={0.22} strokeWidth={1} />
        <Circle cx={100} cy={100} r={14} fill={color} fillOpacity={0.85} />
        <Circle cx={100} cy={100} r={4} fill="#0a0a0a" />
      </Svg>
    </Animated.View>
  );
}

export function EqualizerDecoration({ color, size = 200 }: DecorationProps) {
  const bars = Array.from({ length: 15 });
  return (
    <View style={{ width: size, height: size * 0.5, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5 }}>
      {bars.map((_, i) => {
        const base = 14 + Math.abs(7 - i) * -2 + ((i * 37) % 30);
        return (
          <MotiView
            key={i}
            from={{ height: 10 }}
            animate={{ height: Math.max(14, Math.min(90, base + 30)) }}
            transition={{ type: "timing", duration: 420 + i * 35, loop: true, repeatReverse: true, delay: i * 45 }}
            style={{ width: 6, borderRadius: 3, backgroundColor: color, opacity: 0.8 }}
          />
        );
      })}
    </View>
  );
}

export function RingsYearDecoration({ color, size = 200 }: DecorationProps) {
  const spinSlow = useSpin(9000);
  const spinFast = useSpin(5500, true);
  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <Animated.View style={[{ position: "absolute" }, spinSlow]}>
        <Svg width={size} height={size} viewBox="0 0 200 200">
          <Circle cx={100} cy={100} r={94} fill="none" stroke={color} strokeOpacity={0.25} strokeWidth={1.5} strokeDasharray="10 14" />
        </Svg>
      </Animated.View>
      <Animated.View style={[{ position: "absolute" }, spinFast]}>
        <Svg width={size} height={size} viewBox="0 0 200 200">
          <Circle cx={100} cy={100} r={70} fill="none" stroke={color} strokeOpacity={0.3} strokeWidth={1.5} strokeDasharray="4 10" />
        </Svg>
      </Animated.View>
      <Svg width={size} height={size} viewBox="0 0 200 200" style={{ position: "absolute" }}>
        <Circle cx={100} cy={100} r={46} fill="rgba(255,255,255,0.04)" stroke={color} strokeOpacity={0.4} strokeWidth={1} />
      </Svg>
    </View>
  );
}

export function EraDecoration({ color, size = 200 }: DecorationProps) {
  const heights = [0.4, 0.65, 0.85, 0.6, 0.48];
  return (
    <View style={{ width: size * 0.7, height: size * 0.55, flexDirection: "row", alignItems: "flex-end", gap: 8 }}>
      {heights.map((h, i) => (
        <MotiView
          key={i}
          from={{ opacity: 0.35 }}
          animate={{ opacity: 0.85 }}
          transition={{ type: "timing", duration: 900 + i * 120, loop: true, repeatReverse: true, delay: i * 80 }}
          style={{ flex: 1, height: `${h * 100}%`, borderRadius: 6, backgroundColor: color }}
        />
      ))}
    </View>
  );
}

function CassetteReel({ cx, color, spin }: { cx: number; color: string; spin: ReturnType<typeof useSpin> }) {
  return (
    <Animated.View style={[{ position: "absolute", left: cx - 22, top: 100 - 22 }, spin]}>
      <Svg width={44} height={44} viewBox="0 0 44 44">
        <Circle cx={22} cy={22} r={20} fill="none" stroke={color} strokeOpacity={0.5} strokeWidth={2} />
        <Line x1={22} y1={4} x2={22} y2={40} stroke={color} strokeOpacity={0.4} strokeWidth={1.5} />
        <Line x1={4} y1={22} x2={40} y2={22} stroke={color} strokeOpacity={0.4} strokeWidth={1.5} />
        <Circle cx={22} cy={22} r={5} fill={color} fillOpacity={0.7} />
      </Svg>
    </Animated.View>
  );
}

export function CassetteDecoration({ color, size = 200 }: DecorationProps) {
  const spin = useSpin(3200);
  return (
    <View style={{ width: size, height: 200, alignItems: "center", justifyContent: "center" }}>
      <Svg width={size} height={200} viewBox={`0 0 ${size} 200`} style={{ position: "absolute" }}>
        <Rect x={size / 2 - 90} y={40} width={180} height={120} rx={14} fill="rgba(255,255,255,0.04)" stroke={color} strokeOpacity={0.3} strokeWidth={1.5} />
      </Svg>
      <CassetteReel cx={size / 2 - 45} color={color} spin={spin} />
      <CassetteReel cx={size / 2 + 45} color={color} spin={spin} />
    </View>
  );
}

export function HeartbeatDecoration({ color, size = 200 }: DecorationProps) {
  return (
    <View style={{ width: size, height: size * 0.5, alignItems: "center", justifyContent: "center" }}>
      <Svg width={size} height={size * 0.5} viewBox="0 0 200 100">
        <Path
          d="M0,50 L40,50 L52,18 L64,82 L76,50 L92,50 L104,30 L116,70 L128,50 L200,50"
          fill="none"
          stroke={color}
          strokeOpacity={0.55}
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
      <MotiView
        from={{ opacity: 0.3, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1.2 }}
        transition={{ type: "timing", duration: 700, loop: true, repeatReverse: true }}
        style={{ position: "absolute", left: "26%", width: 10, height: 10, borderRadius: 5, backgroundColor: color }}
      />
    </View>
  );
}

export function DiamondDecoration({ color, size = 200 }: DecorationProps) {
  return (
    <MotiView
      from={{ opacity: 0.55 }}
      animate={{ opacity: 1 }}
      transition={{ type: "timing", duration: 1100, loop: true, repeatReverse: true }}
    >
      <Svg width={size * 0.6} height={size * 0.6} viewBox="0 0 100 100">
        <Polygon points="50,6 78,38 50,94 22,38" fill="rgba(255,255,255,0.05)" stroke={color} strokeOpacity={0.6} strokeWidth={2} />
        <Polygon points="50,6 78,38 50,38" fill={color} fillOpacity={0.18} />
        <Polygon points="22,38 50,38 50,94" fill={color} fillOpacity={0.1} />
        <Line x1={22} y1={38} x2={78} y2={38} stroke={color} strokeOpacity={0.4} strokeWidth={1.5} />
        <Line x1={50} y1={6} x2={50} y2={94} stroke={color} strokeOpacity={0.3} strokeWidth={1} />
      </Svg>
    </MotiView>
  );
}

export function FingerprintDecoration({ color, size = 200 }: DecorationProps) {
  const spin = useSpin(14000);
  const rings = [88, 72, 56, 40, 26];
  return (
    <Animated.View style={spin}>
      <Svg width={size} height={size} viewBox="0 0 200 200">
        {rings.map((r, i) => (
          <Ellipse
            key={r}
            cx={100}
            cy={100}
            rx={r}
            ry={r * 0.82}
            fill="none"
            stroke={color}
            strokeOpacity={0.5 - i * 0.06}
            strokeWidth={1.5}
          />
        ))}
        <Circle cx={100} cy={100} r={5} fill={color} fillOpacity={0.8} />
      </Svg>
    </Animated.View>
  );
}

export const DECORATIONS = {
  vinyl: VinylDecoration,
  equalizer: EqualizerDecoration,
  rings: RingsYearDecoration,
  era: EraDecoration,
  cassette: CassetteDecoration,
  heartbeat: HeartbeatDecoration,
  diamond: DiamondDecoration,
  fingerprint: FingerprintDecoration,
} as const;

export type DecorationKey = keyof typeof DECORATIONS;

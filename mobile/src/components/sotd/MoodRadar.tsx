import { View, Text } from "react-native";
import Svg, { Circle, Line, Path } from "react-native-svg";
import { alpha } from "@/lib/theme/tokens";

// Hand-rolled 5-axis radar — victory-native (Skia) only ships cartesian/pie/
// polar(donut) chart types, no true multi-axis radar primitive, so this
// mirrors Sparkline/RadialGauge's existing react-native-svg pattern instead.

type RadarPoint = { axis: string; value: number };

type MoodRadarProps = {
  data: RadarPoint[];
  color: string;
  size?: number;
};

const RINGS = 3;

export function MoodRadar({ data, color, size = 200 }: MoodRadarProps) {
  const n = data.length;
  if (n < 3) return <View style={{ width: size, height: size }} />;

  const labelPad = 28;
  const cx = size / 2;
  const cy = size / 2;
  const outerRadius = size / 2 - labelPad;
  const domainMax = Math.max(...data.map((d) => d.value), 10);

  const angleFor = (i: number) => -Math.PI / 2 + i * ((2 * Math.PI) / n);
  const pointAt = (i: number, radius: number) => {
    const a = angleFor(i);
    return { x: cx + radius * Math.cos(a), y: cy + radius * Math.sin(a) };
  };

  const valuePath = data
    .map((d, i) => {
      const r = outerRadius * Math.min(1, d.value / domainMax);
      const p = pointAt(i, r);
      return `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`;
    })
    .join(" ") + " Z";

  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <Svg width={size} height={size}>
        {Array.from({ length: RINGS }, (_, ring) => (
          <Circle
            key={ring}
            cx={cx}
            cy={cy}
            r={(outerRadius * (ring + 1)) / RINGS}
            stroke={alpha.white(0.07)}
            strokeWidth={1}
            fill="transparent"
          />
        ))}

        {data.map((_, i) => {
          const p = pointAt(i, outerRadius);
          return <Line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke={alpha.white(0.07)} strokeWidth={1} />;
        })}

        <Path d={valuePath} stroke={color} strokeWidth={2} fill={color} fillOpacity={0.28} />
      </Svg>

      {data.map((d, i) => {
        const p = pointAt(i, outerRadius + labelPad * 0.78);
        return (
          <Text
            key={d.axis}
            style={{
              position: "absolute",
              left: p.x - 28,
              top: p.y - 7,
              width: 56,
              textAlign: "center",
              fontSize: 9,
              color: alpha.white(0.5),
            }}
          >
            {d.axis}
          </Text>
        );
      })}
    </View>
  );
}

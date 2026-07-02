import { useEffect, useMemo, useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import Svg, { Circle, Line, Defs, RadialGradient, Stop } from "react-native-svg";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  cancelAnimation,
  Easing,
} from "react-native-reanimated";
import { colors, alpha, fontSize, trackingWidest2 } from "@/lib/theme/tokens";
import { colorForKey } from "@/lib/theme/gradients";
import type { GenreProfile } from "@/lib/api/hooks";

// Planets live in fixed-size boxes so the counter-rotation origin (box
// center) coincides exactly with the circle center — labels stay upright
// with zero wobble while the whole system orbits.
const BOX = 92;
const SUN = 88;

type Planet = {
  genre: string;
  pct: number;
  r: number;
  x: number;
  y: number;
  color: string;
};

type SoundDNAOrbitProps = {
  profile: GenreProfile;
  size: number;
};

function toRad(deg: number) {
  return (deg * Math.PI) / 180;
}

// Your genres as a planetary system: the top genre is the sun, every other
// genre orbits it — distance = rank ring, planet size = share of listening,
// connecting lines = the genre-affinity edges the API computes (dnaEdges).
// Tap a planet to read its share in the sun.
export function SoundDNAOrbit({ profile, size }: SoundDNAOrbitProps) {
  const rotation = useSharedValue(0);
  useEffect(() => {
    rotation.value = withRepeat(withTiming(360, { duration: 90_000, easing: Easing.linear }), -1, false);
    return () => cancelAnimation(rotation);
  }, [rotation]);
  const spin = useAnimatedStyle(() => ({ transform: [{ rotate: `${rotation.value}deg` }] }));
  const counterSpin = useAnimatedStyle(() => ({ transform: [{ rotate: `${-rotation.value}deg` }] }));

  const [focused, setFocused] = useState<string | null>(null);

  const sorted = useMemo(() => [...profile.nodes].sort((a, b) => b.percentage - a.percentage), [profile.nodes]);

  const affinity = useMemo(() => {
    const map = new Map<string, number>();
    for (const [a, b, score] of profile.dnaEdges) {
      map.set([a, b].sort().join("|"), score);
    }
    return map;
  }, [profile.dnaEdges]);

  const H = size + 56;
  const cx = size / 2;
  const cy = H / 2;
  const r2 = size / 2 - 40;
  const r1 = Math.max((r2 + SUN / 2) / 2 + 6, SUN / 2 + 36);

  const planets: Planet[] = useMemo(() => {
    const rest = sorted.slice(1, 8);
    const inner = rest.slice(0, 3);
    const outer = rest.slice(3);
    const placed: Planet[] = [];
    inner.forEach((n, i) => {
      const angle = toRad(-90 + (360 / inner.length) * i);
      placed.push({
        genre: n.genre,
        pct: n.percentage,
        r: 13 + n.score * 15,
        x: cx + r1 * Math.cos(angle),
        y: cy + r1 * Math.sin(angle),
        color: colorForKey(n.genre),
      });
    });
    outer.forEach((n, i) => {
      const angle = toRad(-90 + 180 / outer.length + (360 / outer.length) * i);
      placed.push({
        genre: n.genre,
        pct: n.percentage,
        r: 10 + n.score * 13,
        x: cx + r2 * Math.cos(angle),
        y: cy + r2 * Math.sin(angle),
        color: colorForKey(n.genre),
      });
    });
    return placed;
  }, [sorted, cx, cy, r1, r2]);

  if (!sorted.length) return null;

  const sun = sorted[0];
  const sunColor = colorForKey(sun.genre);
  const focusPlanet = planets.find((p) => p.genre === focused) ?? null;
  const centerName = focusPlanet?.genre ?? sun.genre;
  const centerPct = focusPlanet?.pct ?? sun.percentage;
  const centerColor = focusPlanet?.color ?? sunColor;

  const affinityTo = (a: string, b: string) => affinity.get([a, b].sort().join("|")) ?? 0.5;

  return (
    <View style={{ width: size, height: H, alignSelf: "center" }}>
      {/* soft glow behind the sun */}
      <Svg width={size} height={H} style={StyleSheet.absoluteFill} pointerEvents="none">
        <Defs>
          <RadialGradient id="dnaGlow" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={centerColor} stopOpacity={0.28} />
            <Stop offset="60%" stopColor={centerColor} stopOpacity={0.08} />
            <Stop offset="100%" stopColor={centerColor} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Circle cx={cx} cy={cy} r={size * 0.34} fill="url(#dnaGlow)" />
      </Svg>

      {/* rotating layer: orbit rings, affinity edges, planets */}
      <Animated.View style={[StyleSheet.absoluteFill, spin]}>
        <Svg width={size} height={H} style={StyleSheet.absoluteFill} pointerEvents="none">
          <Circle cx={cx} cy={cy} r={r1} stroke={alpha.white(0.06)} strokeWidth={1} fill="none" />
          <Circle cx={cx} cy={cy} r={r2} stroke={alpha.white(0.05)} strokeWidth={1} strokeDasharray="3 8" fill="none" />
          {planets.map((p) => (
            <Line
              key={`sun-${p.genre}`}
              x1={cx}
              y1={cy}
              x2={p.x}
              y2={p.y}
              stroke={p.color}
              strokeOpacity={0.07 + (affinityTo(sun.genre, p.genre) - 0.5) * 0.5}
              strokeWidth={1.5}
            />
          ))}
          {planets.map((a, i) =>
            planets.slice(i + 1).map((b) =>
              affinityTo(a.genre, b.genre) >= 0.8 ? (
                <Line
                  key={`pair-${a.genre}-${b.genre}`}
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  stroke={alpha.white(0.1)}
                  strokeWidth={1}
                />
              ) : null
            )
          )}
        </Svg>

        {planets.map((p) => {
          const isFocused = focused === p.genre;
          return (
            <View
              key={p.genre}
              pointerEvents="box-none"
              style={{ position: "absolute", left: p.x - BOX / 2, top: p.y - BOX / 2, width: BOX, height: BOX }}
            >
              <Animated.View style={[styles.planetBox, counterSpin]} pointerEvents="box-none">
                <Pressable
                  onPress={() => setFocused((cur) => (cur === p.genre ? null : p.genre))}
                  style={[
                    styles.planet,
                    {
                      width: p.r * 2,
                      height: p.r * 2,
                      borderRadius: p.r,
                      backgroundColor: p.color,
                      opacity: focused && !isFocused ? 0.45 : 1,
                    },
                  ]}
                >
                  {p.r >= 16 ? <Text style={styles.planetPct}>{Math.round(p.pct)}%</Text> : null}
                </Pressable>
                <Text numberOfLines={1} style={[styles.planetLabel, { top: BOX / 2 + p.r + 4 }]}>
                  {p.genre}
                </Text>
              </Animated.View>
            </View>
          );
        })}
      </Animated.View>

      {/* the sun — static, shows the focused genre's stats */}
      <Pressable
        onPress={() => setFocused(null)}
        style={[styles.sun, { left: cx - SUN / 2, top: cy - SUN / 2, borderColor: centerColor }]}
      >
        <Text numberOfLines={1} style={[styles.sunGenre, { color: centerColor }]}>
          {centerName}
        </Text>
        <Text style={styles.sunPct}>{Math.round(centerPct)}%</Text>
        <Text style={styles.sunCaption}>of your sound</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  planetBox: { width: BOX, height: BOX, alignItems: "center", justifyContent: "center" },
  planet: { alignItems: "center", justifyContent: "center" },
  planetPct: { fontSize: fontSize[10], fontFamily: "GeistSansBold", color: colors.background },
  planetLabel: {
    position: "absolute",
    width: 84,
    left: (BOX - 84) / 2,
    textAlign: "center",
    fontSize: fontSize[10],
    fontFamily: "GeistSansMedium",
    color: alpha.white(0.6),
  },
  sun: {
    position: "absolute",
    width: SUN,
    height: SUN,
    borderRadius: SUN / 2,
    borderWidth: 2,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  sunGenre: {
    maxWidth: SUN - 14,
    fontSize: fontSize[11],
    fontFamily: "GeistSansSemiBold",
    textTransform: "capitalize",
  },
  sunPct: { marginTop: 1, fontSize: fontSize[20], fontFamily: "GeistSansBold", color: colors.white },
  sunCaption: {
    fontSize: fontSize[9],
    fontFamily: "GeistSans",
    textTransform: "uppercase",
    letterSpacing: trackingWidest2(fontSize[9]),
    color: alpha.white(0.35),
  },
});

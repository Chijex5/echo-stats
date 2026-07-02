import { useEffect, useMemo, useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import Svg, { Circle, Path, Defs, RadialGradient, Stop } from "react-native-svg";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  cancelAnimation,
  Easing,
} from "react-native-reanimated";
import { colors, alpha, fontSize, trackingWidest2 } from "@/lib/theme/tokens";
import { colorForKey, tint, shade } from "@/lib/theme/gradients";
import type { GenreProfile } from "@/lib/api/hooks";

// Planets live in fixed-size boxes so the counter-rotation origin (box
// center) coincides exactly with the circle center — labels stay upright
// with zero wobble while the whole system orbits.
const BOX = 96;
const SUN = 96;
const STAR_COUNT = 26;

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

// A quadratic curve from the sun toward a planet, bent consistently to one
// side so the affinity trails read as a galaxy swirl instead of spokes.
function swirlPath(cx: number, cy: number, x: number, y: number): string {
  const mx = (cx + x) / 2;
  const my = (cy + y) / 2;
  const dx = x - cx;
  const dy = y - cy;
  const len = Math.hypot(dx, dy) || 1;
  const k = len * 0.18;
  return `M ${cx} ${cy} Q ${mx - (dy / len) * k} ${my + (dx / len) * k} ${x} ${y}`;
}

// Your genres as a planetary system: the top genre is the sun, every other
// genre orbits it — distance = rank ring, planet size = share of listening,
// swirling trails = the genre-affinity edges the API computes (dnaEdges).
// Tap a planet to read its share in the sun.
export function SoundDNAOrbit({ profile, size }: SoundDNAOrbitProps) {
  const rotation = useSharedValue(0);
  const pulse = useSharedValue(1);
  useEffect(() => {
    rotation.value = withRepeat(withTiming(360, { duration: 90_000, easing: Easing.linear }), -1, false);
    pulse.value = withRepeat(withTiming(1.12, { duration: 2600, easing: Easing.inOut(Easing.quad) }), -1, true);
    return () => {
      cancelAnimation(rotation);
      cancelAnimation(pulse);
    };
  }, [rotation, pulse]);
  const spin = useAnimatedStyle(() => ({ transform: [{ rotate: `${rotation.value}deg` }] }));
  const counterSpin = useAnimatedStyle(() => ({ transform: [{ rotate: `${-rotation.value}deg` }] }));
  const pulseStyle = useAnimatedStyle(() => ({ transform: [{ scale: pulse.value }] }));

  const [focused, setFocused] = useState<string | null>(null);

  // "unknown" is the backend's bucket for tracks it couldn't genre-tag —
  // it's noise, not a genre, so it never gets a planet.
  const sorted = useMemo(
    () =>
      [...profile.nodes]
        .filter((n) => n.genre.trim().toLowerCase() !== "unknown")
        .sort((a, b) => b.percentage - a.percentage),
    [profile.nodes]
  );

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

  // Deterministic starfield (seeded LCG, not Math.random) so the sky doesn't
  // reshuffle on every re-render.
  const stars = useMemo(() => {
    let seed = 7;
    const rand = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
    return Array.from({ length: STAR_COUNT }, () => ({
      x: rand() * size,
      y: rand() * H,
      r: 0.5 + rand() * 1.1,
      o: 0.08 + rand() * 0.24,
    }));
  }, [size, H]);

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
        r: 14 + n.score * 15,
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
        r: 11 + n.score * 13,
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

  const discBox = SUN + 28;

  return (
    <View style={{ width: size, height: H, alignSelf: "center" }}>
      {/* static sky: starfield + soft glow behind the sun */}
      <Svg width={size} height={H} style={StyleSheet.absoluteFill} pointerEvents="none">
        {stars.map((s, i) => (
          <Circle key={i} cx={s.x} cy={s.y} r={s.r} fill={colors.white} opacity={s.o} />
        ))}
      </Svg>
      <Animated.View style={[StyleSheet.absoluteFill, pulseStyle]} pointerEvents="none">
        <Svg width={size} height={H} style={StyleSheet.absoluteFill}>
          <Defs>
            <RadialGradient id="dnaGlow" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor={centerColor} stopOpacity={0.3} />
              <Stop offset="60%" stopColor={centerColor} stopOpacity={0.08} />
              <Stop offset="100%" stopColor={centerColor} stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Circle cx={cx} cy={cy} r={size * 0.36} fill="url(#dnaGlow)" />
        </Svg>
      </Animated.View>

      {/* rotating layer: orbit rings, affinity trails, planets */}
      <Animated.View style={[StyleSheet.absoluteFill, spin]}>
        <Svg width={size} height={H} style={StyleSheet.absoluteFill} pointerEvents="none">
          <Circle cx={cx} cy={cy} r={r1} stroke={alpha.white(0.07)} strokeWidth={1} fill="none" />
          <Circle cx={cx} cy={cy} r={r2} stroke={alpha.white(0.06)} strokeWidth={1} strokeDasharray="3 8" fill="none" />
          {planets.map((p) => {
            const aff = affinityTo(sun.genre, p.genre);
            return (
              <Path
                key={`sun-${p.genre}`}
                d={swirlPath(cx, cy, p.x, p.y)}
                stroke={p.color}
                strokeOpacity={0.14 + (aff - 0.5) * 0.8}
                strokeWidth={1 + (aff - 0.5) * 3}
                strokeLinecap="round"
                fill="none"
              />
            );
          })}
          {planets.map((a, i) =>
            planets.slice(i + 1).map((b) =>
              affinityTo(a.genre, b.genre) >= 0.75 ? (
                <Path
                  key={`pair-${a.genre}-${b.genre}`}
                  d={swirlPath(a.x, a.y, b.x, b.y)}
                  stroke={colors.white}
                  strokeOpacity={0.12}
                  strokeWidth={1}
                  strokeLinecap="round"
                  fill="none"
                />
              ) : null
            )
          )}
        </Svg>

        {planets.map((p, i) => {
          const isFocused = focused === p.genre;
          const dimmed = focused !== null && !isFocused;
          return (
            <View
              key={p.genre}
              pointerEvents="box-none"
              style={{
                position: "absolute",
                left: p.x - BOX / 2,
                top: p.y - BOX / 2,
                width: BOX,
                height: BOX,
                opacity: dimmed ? 0.4 : 1,
              }}
            >
              <Animated.View style={[styles.planetBox, counterSpin]} pointerEvents="box-none">
                <Svg width={BOX} height={BOX} style={StyleSheet.absoluteFill} pointerEvents="none">
                  <Defs>
                    <RadialGradient id={`pg${i}`} cx="35%" cy="30%" r="80%">
                      <Stop offset="0%" stopColor={tint(p.color, 0.5)} />
                      <Stop offset="55%" stopColor={p.color} />
                      <Stop offset="100%" stopColor={shade(p.color, 0.45)} />
                    </RadialGradient>
                    <RadialGradient id={`ph${i}`} cx="50%" cy="50%" r="50%">
                      <Stop offset="0%" stopColor={p.color} stopOpacity={0.35} />
                      <Stop offset="100%" stopColor={p.color} stopOpacity={0} />
                    </RadialGradient>
                  </Defs>
                  <Circle cx={BOX / 2} cy={BOX / 2} r={Math.min(p.r + 15, BOX / 2)} fill={`url(#ph${i})`} />
                  <Circle cx={BOX / 2} cy={BOX / 2} r={p.r} fill={`url(#pg${i})`} />
                  <Circle
                    cx={BOX / 2}
                    cy={BOX / 2}
                    r={p.r + 4}
                    stroke={p.color}
                    strokeOpacity={isFocused ? 0.9 : 0.3}
                    strokeWidth={isFocused ? 1.5 : 1}
                    fill="none"
                  />
                </Svg>
                <Pressable
                  onPress={() => setFocused((cur) => (cur === p.genre ? null : p.genre))}
                  style={[styles.planet, { width: p.r * 2 + 12, height: p.r * 2 + 12, borderRadius: p.r + 6 }]}
                >
                  {p.r >= 16 ? <Text style={styles.planetPct}>{Math.round(p.pct)}%</Text> : null}
                </Pressable>
                <Text
                  numberOfLines={1}
                  style={[
                    styles.planetLabel,
                    { top: BOX / 2 + p.r + 6 },
                    isFocused && { color: colors.white, fontFamily: "GeistSansSemiBold" },
                  ]}
                >
                  {p.genre}
                </Text>
              </Animated.View>
            </View>
          );
        })}
      </Animated.View>

      {/* the sun — a static filled orb showing the focused genre's stats */}
      <Svg
        width={discBox}
        height={discBox}
        style={{ position: "absolute", left: cx - discBox / 2, top: cy - discBox / 2 }}
        pointerEvents="none"
      >
        <Defs>
          <RadialGradient id="sunG" cx="38%" cy="30%" r="82%">
            <Stop offset="0%" stopColor={tint(centerColor, 0.45)} />
            <Stop offset="60%" stopColor={centerColor} />
            <Stop offset="100%" stopColor={shade(centerColor, 0.35)} />
          </RadialGradient>
        </Defs>
        <Circle cx={discBox / 2} cy={discBox / 2} r={SUN / 2} fill="url(#sunG)" />
        <Circle
          cx={discBox / 2}
          cy={discBox / 2}
          r={SUN / 2 + 8}
          stroke={centerColor}
          strokeOpacity={0.35}
          strokeWidth={1}
          strokeDasharray="2 6"
          fill="none"
        />
      </Svg>
      <Pressable onPress={() => setFocused(null)} style={[styles.sun, { left: cx - SUN / 2, top: cy - SUN / 2 }]}>
        <Text numberOfLines={1} style={styles.sunGenre}>
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
    width: 88,
    left: (BOX - 88) / 2,
    textAlign: "center",
    fontSize: fontSize[10],
    fontFamily: "GeistSansMedium",
    color: alpha.white(0.65),
  },
  sun: {
    position: "absolute",
    width: SUN,
    height: SUN,
    borderRadius: SUN / 2,
    alignItems: "center",
    justifyContent: "center",
  },
  sunGenre: {
    maxWidth: SUN - 16,
    fontSize: fontSize[11],
    fontFamily: "GeistSansSemiBold",
    textTransform: "capitalize",
    color: alpha.black(0.72),
  },
  sunPct: { marginTop: 1, fontSize: fontSize[24], fontFamily: "GeistSansBold", color: colors.black },
  sunCaption: {
    fontSize: fontSize[9],
    fontFamily: "GeistSansMedium",
    textTransform: "uppercase",
    letterSpacing: trackingWidest2(fontSize[9]),
    color: alpha.black(0.55),
  },
});

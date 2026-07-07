import { View, Text, StyleSheet } from "react-native";
import Svg, { Path } from "react-native-svg";
import { Sunrise, Sun, Sunset, Moon, type LucideIcon } from "lucide-react-native";
import { colors, alpha, fontSize, trackingWidest2 } from "@/lib/theme/tokens";
import type { EmotionalProfile } from "@/lib/api/hooks";

const SIZE = 190;
const R = 76;
const STROKE = 22;
const GAP_DEG = 4;

type Segment = {
  key: keyof Pick<EmotionalProfile, "calm" | "neutral" | "energetic" | "intense">;
  label: string;
  window: string;
  icon: LucideIcon;
  color: string;
};

const SEGMENTS: Segment[] = [
  { key: "calm", label: "Morning", window: "6a – 12p", icon: Sunrise, color: colors.accentCyan },
  { key: "neutral", label: "Afternoon", window: "12p – 6p", icon: Sun, color: colors.accentAmber },
  { key: "energetic", label: "Evening", window: "6p – 10p", icon: Sunset, color: colors.accentRose },
  { key: "intense", label: "Night", window: "10p – 6a", icon: Moon, color: colors.accentPurple },
];

const DOMINANT_KEY: Record<EmotionalProfile["dominantLabel"], Segment["key"]> = {
  Calm: "calm",
  Neutral: "neutral",
  "High Energy": "energetic",
  "Late Night": "intense",
};

const DOMINANT_HEADLINE: Record<EmotionalProfile["dominantLabel"], string> = {
  Calm: "Morning listener",
  Neutral: "Daytime listener",
  "High Energy": "Evening listener",
  "Late Night": "Night owl",
};

function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arcPath(cx: number, cy: number, r: number, startDeg: number, endDeg: number) {
  const start = polar(cx, cy, r, startDeg);
  const end = polar(cx, cy, r, endDeg);
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${large} 1 ${end.x} ${end.y}`;
}

// The emotional profile is really a time-of-day energy distribution, so
// render it as a day dial: one ring segment per part of the day, sized by
// its share of plays, with the dominant window lit and named in the center.
export function ListeningClock({ profile }: { profile: EmotionalProfile }) {
  const dominantKey = DOMINANT_KEY[profile.dominantLabel];
  const total = SEGMENTS.reduce((sum, s) => sum + profile[s.key], 0) || 1;
  const cx = SIZE / 2;
  const cy = SIZE / 2;

  const arcs: { seg: Segment; path: string; dominant: boolean }[] = [];
  let cursor = -0; // start at 12 o'clock
  for (const seg of SEGMENTS) {
    const pct = profile[seg.key];
    if (pct <= 0) continue;
    const sweep = (pct / total) * 360;
    const start = cursor + GAP_DEG / 2;
    const end = cursor + Math.max(sweep - GAP_DEG / 2, GAP_DEG);
    arcs.push({ seg, path: arcPath(cx, cy, R, start, end), dominant: seg.key === dominantKey });
    cursor += sweep;
  }

  return (
    <View style={styles.card}>
      <View style={styles.dialWrap}>
        <Svg width={SIZE} height={SIZE}>
          {arcs.map(({ seg, path, dominant }) => (
            <Path
              key={seg.key}
              d={path}
              stroke={seg.color}
              strokeOpacity={dominant ? 1 : 0.3}
              strokeWidth={STROKE}
              strokeLinecap="round"
              fill="none"
            />
          ))}
        </Svg>
        <View style={styles.center} pointerEvents="none">
          <Text style={styles.centerEyebrow}>You&apos;re a</Text>
          <Text style={styles.centerLabel}>{DOMINANT_HEADLINE[profile.dominantLabel]}</Text>
          <Text style={styles.centerPct}>{profile[dominantKey]}% of plays</Text>
        </View>
      </View>

      <View style={styles.legend}>
        {SEGMENTS.map((seg) => {
          const Icon = seg.icon;
          const dominant = seg.key === dominantKey;
          return (
            <View key={seg.key} style={[styles.legendItem, { opacity: dominant ? 1 : 0.55 }]}>
              <Icon size={14} color={seg.color} />
              <View>
                <Text style={styles.legendLabel}>{seg.label}</Text>
                <Text style={styles.legendPct}>{profile[seg.key]}%</Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    backgroundColor: colors.surface,
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  dialWrap: { width: SIZE, height: SIZE, alignItems: "center", justifyContent: "center" },
  center: { position: "absolute", alignItems: "center", paddingHorizontal: 24 },
  centerEyebrow: {
    fontSize: fontSize[9],
    fontFamily: "GeistSans",
    textTransform: "uppercase",
    letterSpacing: trackingWidest2(fontSize[9]),
    color: alpha.white(0.4),
  },
  centerLabel: {
    marginTop: 4,
    textAlign: "center",
    fontSize: fontSize[17],
    fontFamily: "GeistSansBold",
    color: colors.white,
  },
  centerPct: { marginTop: 3, fontSize: fontSize[11], fontFamily: "GeistSans", color: alpha.white(0.45) },
  legend: { marginTop: 22, flexDirection: "row", justifyContent: "space-between", width: "100%" },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 7 },
  legendLabel: { fontSize: fontSize[10], fontFamily: "GeistSansMedium", color: alpha.white(0.6) },
  legendPct: { marginTop: 1, fontSize: fontSize[12], fontFamily: "GeistSansBold", color: colors.white },
});

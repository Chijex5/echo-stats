import { View, Text, StyleSheet } from "react-native";
import { ArrowRight } from "lucide-react-native";
import { GlassCard, EyebrowLabel, SectionHeading } from "@/components/ui";
import { colors, alpha, fontSize, trackingWidest2 } from "@/lib/theme/tokens";
import type { TimelinePagePeriod } from "@/lib/api/hooks";

function pickComparisonPair(periods: TimelinePagePeriod[]) {
  const timeKey = (p: TimelinePagePeriod) => p.year * 12 + p.monthIdx;
  const b = periods.at(-1)!;
  const bKey = timeKey(b);
  const map = new Map<number, TimelinePagePeriod>();
  for (const p of periods) map.set(timeKey(p), p);

  let a = map.get(bKey - 12);
  if (!a) {
    const minKey = Math.min(...periods.map(timeKey));
    for (let k = bKey - 1; k >= minKey; k--) {
      const candidate = map.get(k);
      if (candidate) {
        a = candidate;
        break;
      }
    }
  }
  a ??= periods[0];

  const diffMonths = Math.abs(timeKey(b) - timeKey(a));
  const years = Math.floor(diffMonths / 12);
  const months = diffMonths % 12;
  const difference =
    years > 0 && months > 0
      ? `${years === 1 ? "A year" : `${years} years`} and ${months} month${months > 1 ? "s" : ""} apart, side by side.`
      : years > 0
        ? `${years === 1 ? "A year" : `${years} years`} apart, side by side.`
        : `${months} month${months > 1 ? "s" : ""} apart, side by side.`;

  return { a, b, difference };
}

function ComparisonCell({ period, side }: { period: TimelinePagePeriod; side: "then" | "now" }) {
  return (
    <GlassCard padding="md" rounded="2xl" style={{ flex: 1 }}>
      <EyebrowLabel>{side === "then" ? "Then" : "Now"}</EyebrowLabel>
      <Text style={styles.dateLabel}>
        {period.monthName} {period.year}
      </Text>

      <View style={styles.rows}>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Top artist</Text>
          <Text numberOfLines={1} style={[styles.rowValue, { marginLeft: 12, maxWidth: "60%" }]}>
            {period.topArtist}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Top genre</Text>
          <Text style={styles.rowValue}>{period.topGenre}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Mood</Text>
          <Text style={styles.rowValue}>
            {period.mood} · {period.moodScore.toFixed(1)}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Hours</Text>
          <Text style={styles.rowValue}>{period.totalHours}h</Text>
        </View>
      </View>
    </GlassCard>
  );
}

export function TimeComparisonSection({ periods }: { periods: TimelinePagePeriod[] }) {
  if (periods.length < 2) return null;
  const { a, b, difference } = pickComparisonPair(periods);
  const moodDelta = (b.moodScore - a.moodScore).toFixed(1);
  const hoursDelta = b.totalHours - a.totalHours;

  return (
    <View>
      <SectionHeading label="Then vs now" title="Side by side" subtitle={difference} align="left" />
      <View style={styles.compareRow}>
        <ComparisonCell period={a} side="then" />
        <View style={styles.arrowColumn}>
          <View style={styles.arrowCircle}>
            <ArrowRight size={15} color={colors.echoGreen} />
          </View>
          <Text style={styles.deltaLabel}>
            Mood{"\n"}
            <Text style={{ color: colors.echoGreen }}>+{moodDelta}</Text>
          </Text>
          <Text style={styles.deltaLabel}>
            Hours{"\n"}
            <Text style={{ color: hoursDelta >= 0 ? colors.echoGreen : colors.accentRose }}>
              {hoursDelta >= 0 ? "+" : ""}
              {hoursDelta}h
            </Text>
          </Text>
        </View>
        <ComparisonCell period={b} side="now" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  dateLabel: { marginTop: 8, fontSize: fontSize[17], fontFamily: "GeistSansBold", color: colors.white },
  rows: { marginTop: 16, gap: 10 },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  rowLabel: { fontSize: fontSize[11], color: alpha.white(0.4) },
  rowValue: { fontSize: fontSize[12], fontFamily: "GeistSansMedium", color: colors.white },
  compareRow: { marginTop: 16, flexDirection: "row", alignItems: "center", gap: 12 },
  arrowColumn: { alignItems: "center", gap: 6 },
  arrowCircle: {
    height: 36,
    width: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: alpha.spotify(0.3),
    backgroundColor: alpha.spotify(0.12),
  },
  deltaLabel: {
    textAlign: "center",
    fontSize: fontSize[9],
    textTransform: "uppercase",
    letterSpacing: trackingWidest2(fontSize[9]),
    color: alpha.white(0.35),
  },
});

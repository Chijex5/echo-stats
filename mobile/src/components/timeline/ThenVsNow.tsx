import { View, Text, StyleSheet } from "react-native";
import { ArrowRight } from "lucide-react-native";
import { colors, alpha, fontSize, trackingWidest2, radius } from "@/lib/theme/tokens";
import type { TimelinePagePeriod } from "@/lib/api/hooks";

// Picks the month 12 months before the newest one (falling back to the
// nearest earlier month, then the oldest) so the comparison is as close to
// "you, one year ago" as the data allows.
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
  return { a, b };
}

function Column({ side, period }: { side: "Then" | "Now"; period: TimelinePagePeriod }) {
  return (
    <View style={{ flex: 1, minWidth: 0 }}>
      <Text style={styles.side}>{side}</Text>
      <Text style={styles.date}>
        {period.monthName.slice(0, 3)} {period.year}
      </Text>
      <Text numberOfLines={1} style={styles.artist}>
        {period.topArtist}
      </Text>
      <Text numberOfLines={1} style={styles.genre}>
        {period.topGenre} · {period.totalHours}h
      </Text>
    </View>
  );
}

// A compact "you, then vs now" strip — one borderless card, two columns,
// with the deltas printed between them instead of a whole section of tiles.
export function ThenVsNow({ periods }: { periods: TimelinePagePeriod[] }) {
  if (periods.length < 2) return null;
  const { a, b } = pickComparisonPair(periods);
  const moodDelta = b.moodScore - a.moodScore;
  const hoursDelta = b.totalHours - a.totalHours;
  const fmt = (v: number, unit: string) => `${v >= 0 ? "+" : ""}${unit === "h" ? Math.round(v) : v.toFixed(1)}${unit}`;

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Column side="Then" period={a} />
        <View style={styles.mid}>
          <ArrowRight size={14} color={alpha.white(0.35)} />
        </View>
        <Column side="Now" period={b} />
      </View>
      <View style={styles.deltas}>
        <Text style={styles.deltaText}>
          Mood <Text style={{ color: moodDelta >= 0 ? colors.positive : colors.negative }}>{fmt(moodDelta, "")}</Text>
        </Text>
        <Text style={styles.deltaText}>
          Hours <Text style={{ color: hoursDelta >= 0 ? colors.positive : colors.negative }}>{fmt(hoursDelta, "h")}</Text>
        </Text>
        <Text style={styles.deltaText}>
          Artists{" "}
          <Text style={{ color: b.uniqueArtists >= a.uniqueArtists ? colors.positive : colors.negative }}>
            {b.uniqueArtists >= a.uniqueArtists ? "+" : ""}
            {b.uniqueArtists - a.uniqueArtists}
          </Text>
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radius["2xl"], backgroundColor: colors.surface, padding: 16 },
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  mid: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.surfaceRaised,
    alignItems: "center",
    justifyContent: "center",
  },
  side: {
    fontSize: fontSize[9],
    fontFamily: "GeistSansSemiBold",
    textTransform: "uppercase",
    letterSpacing: trackingWidest2(fontSize[9]),
    color: alpha.white(0.35),
  },
  date: { marginTop: 4, fontSize: fontSize[15], fontFamily: "GeistSansBold", color: colors.white },
  artist: { marginTop: 3, fontSize: fontSize[12], fontFamily: "GeistSansMedium", color: alpha.white(0.75) },
  genre: { marginTop: 1, fontSize: fontSize[11], fontFamily: "GeistSans", color: alpha.white(0.45) },
  deltas: {
    marginTop: 14,
    flexDirection: "row",
    gap: 18,
    borderTopWidth: 1,
    borderColor: alpha.white(0.06),
    paddingTop: 12,
  },
  deltaText: { fontSize: fontSize[11], fontFamily: "GeistSansMedium", color: alpha.white(0.45) },
});

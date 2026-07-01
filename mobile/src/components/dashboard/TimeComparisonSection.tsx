import { View, Text } from "react-native";
import { ArrowRight } from "lucide-react-native";
import { GlassCard, EyebrowLabel, SectionHeading } from "@/components/ui";
import { colors, alpha } from "@/lib/theme/tokens";
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
      <Text className="mt-2 text-17 font-sans-bold text-white">
        {period.monthName} {period.year}
      </Text>

      <View className="mt-4 gap-2.5">
        <View className="flex-row items-center justify-between">
          <Text className="text-11 text-white/40">Top artist</Text>
          <Text numberOfLines={1} className="ml-3 max-w-[60%] text-12 font-sans-medium text-white">
            {period.topArtist}
          </Text>
        </View>
        <View className="flex-row items-center justify-between">
          <Text className="text-11 text-white/40">Top genre</Text>
          <Text className="text-12 font-sans-medium text-white">{period.topGenre}</Text>
        </View>
        <View className="flex-row items-center justify-between">
          <Text className="text-11 text-white/40">Mood</Text>
          <Text className="text-12 font-sans-medium text-white">
            {period.mood} · {period.moodScore.toFixed(1)}
          </Text>
        </View>
        <View className="flex-row items-center justify-between">
          <Text className="text-11 text-white/40">Hours</Text>
          <Text className="text-12 font-sans-medium text-white">{period.totalHours}h</Text>
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
      <View className="mt-4 flex-row items-center gap-3">
        <ComparisonCell period={a} side="then" />
        <View className="items-center gap-1.5">
          <View
            className="h-9 w-9 items-center justify-center rounded-full border"
            style={{ borderColor: alpha.spotify(0.3), backgroundColor: alpha.spotify(0.12) }}
          >
            <ArrowRight size={15} color={colors.echoGreen} />
          </View>
          <Text className="text-center text-9 uppercase tracking-widest2 text-white/35">
            Mood{"\n"}
            <Text style={{ color: colors.echoGreen }}>+{moodDelta}</Text>
          </Text>
          <Text className="text-center text-9 uppercase tracking-widest2 text-white/35">
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

import { View, Text, StyleSheet } from "react-native";
import { alpha, colors, fontSize, radius, trackingWidest2 } from "@/lib/theme/tokens";
import { Sparkline } from "@/components/charts";
import { MoodRadar } from "./MoodRadar";
import type { SotdMoodReconstruction } from "@/lib/api/hooks/types";

type MoodReconstructionProps = {
  data: SotdMoodReconstruction;
  accent: string;
};

const HOUR_BAR_HEIGHT = 96;

function buildMoodRadar(hourHeat: SotdMoodReconstruction["hourHeat"]) {
  const total = hourHeat.reduce((s, h) => s + h.v, 0) || 1;
  const morning = hourHeat.filter((h) => h.hour >= 6 && h.hour <= 11).reduce((s, h) => s + h.v, 0);
  const night = hourHeat.filter((h) => h.hour >= 22 || h.hour <= 4).reduce((s, h) => s + h.v, 0);
  const afternoon = hourHeat.filter((h) => h.hour >= 12 && h.hour <= 17).reduce((s, h) => s + h.v, 0);
  const evening = hourHeat.filter((h) => h.hour >= 18 && h.hour <= 21).reduce((s, h) => s + h.v, 0);

  return [
    { axis: "Energy", value: Math.round((evening / total) * 100) },
    { axis: "Calm", value: Math.round((morning / total) * 100) },
    { axis: "Nostalgia", value: Math.round((night / total) * 150) },
    { axis: "Joy", value: Math.round((afternoon / total) * 80) },
    { axis: "Melancholy", value: Math.round((night / total) * 120) },
  ];
}

// Two borderless cards instead of four glass ones: the emotional
// fingerprint + hour-of-day shape together, then the two long-run curves
// (monthly plays, repeat frequency) stacked compactly. All series colored
// by the page accent — never the backend's gradient hints.
export function MoodReconstruction({ data, accent }: MoodReconstructionProps) {
  const moodRadar = buildMoodRadar(data.hourHeat);
  const maxHour = Math.max(...data.hourHeat.map((h) => h.v), 1);

  return (
    <View style={{ gap: 14 }}>
      <View style={styles.card}>
        <Text style={styles.groupLabel}>Emotional fingerprint</Text>
        <View style={{ alignItems: "center" }}>
          <MoodRadar data={moodRadar} color={accent} size={210} />
        </View>

        <View style={styles.divider} />
        <View style={styles.rowHeader}>
          <Text style={styles.groupLabel}>Listening by hour</Text>
          <Text style={styles.peakText}>
            Peak at <Text style={styles.peakTextStrong}>{data.peakHourLabel}</Text>
          </Text>
        </View>
        <View style={[styles.hourBars, { height: HOUR_BAR_HEIGHT }]}>
          {data.hourHeat.map((h) => {
            const peak = h.hour >= 23 || h.hour <= 2;
            return (
              <View
                key={h.hour}
                style={{
                  flex: 1,
                  borderTopLeftRadius: 2,
                  borderTopRightRadius: 2,
                  height: Math.max(6, Math.round((h.v / maxHour) * HOUR_BAR_HEIGHT)),
                  backgroundColor: peak ? accent : alpha.white(0.1),
                }}
              />
            );
          })}
        </View>
        <View style={styles.hourLabels}>
          <Text style={styles.axisLabel}>00</Text>
          <Text style={styles.axisLabel}>06</Text>
          <Text style={styles.axisLabel}>12</Text>
          <Text style={styles.axisLabel}>18</Text>
          <Text style={styles.axisLabel}>23</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.groupLabel}>Plays per month</Text>
        <Sparkline data={data.monthTrend.map((m) => m.v)} width={290} height={60} color={accent} />
        <View style={styles.monthLabels}>
          {data.monthTrend.map((m) => (
            <Text key={m.m} style={styles.axisLabel}>
              {m.m[0]}
            </Text>
          ))}
        </View>

        <View style={styles.divider} />
        <Text style={styles.groupLabel}>Repeat frequency</Text>
        <Sparkline data={data.repeatCurve.map((p) => p.v)} width={290} height={60} color={accent} />
        <Text style={styles.repeatCaption}>
          Most back-to-back: <Text style={styles.repeatCaptionStrong}>{data.maxRepeatsInOneDay}×</Text> in one sitting.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radius["2xl"], backgroundColor: colors.surface, padding: 16 },
  groupLabel: {
    marginBottom: 10,
    fontSize: fontSize[9],
    fontFamily: "GeistSans",
    textTransform: "uppercase",
    letterSpacing: trackingWidest2(fontSize[9]),
    color: alpha.white(0.35),
  },
  divider: { marginVertical: 16, height: 1, backgroundColor: alpha.white(0.06) },
  rowHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  peakText: { marginBottom: 10, fontSize: fontSize[11], fontFamily: "GeistSans", color: alpha.white(0.4) },
  peakTextStrong: { fontFamily: "GeistSansMedium", color: colors.white },
  hourBars: { flexDirection: "row", alignItems: "flex-end", gap: 2 },
  hourLabels: { marginTop: 8, flexDirection: "row", justifyContent: "space-between" },
  axisLabel: { fontSize: fontSize[10], fontFamily: "GeistSans", color: alpha.white(0.3) },
  monthLabels: { marginTop: 6, flexDirection: "row", justifyContent: "space-between" },
  repeatCaption: { marginTop: 8, fontSize: fontSize[12], fontFamily: "GeistSans", color: alpha.white(0.45) },
  repeatCaptionStrong: { fontFamily: "GeistSansMedium", color: colors.white },
});

import { View, Text, StyleSheet } from "react-native";
import { GlassCard, SectionHeading, EyebrowLabel } from "@/components/ui";
import { alpha, colors, fontSize } from "@/lib/theme/tokens";
import { Sparkline } from "@/components/charts";
import { MoodRadar } from "./MoodRadar";
import type { SotdMoodReconstruction, SotdSong } from "@/lib/api/hooks/types";

type MoodReconstructionProps = {
  data: SotdMoodReconstruction;
  song: SotdSong;
};

const HOUR_BAR_HEIGHT = 110;

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

export function MoodReconstruction({ data, song }: MoodReconstructionProps) {
  const moodRadar = buildMoodRadar(data.hourHeat);
  const maxHour = Math.max(...data.hourHeat.map((h) => h.v), 1);

  return (
    <View>
      <View style={{ marginBottom: 20 }}>
        <SectionHeading
          label="Mood reconstruction"
          title="The texture of your listening"
          subtitle="When this song lived in heavy rotation."
        />
      </View>

      <View style={{ gap: 16 }}>
        <GlassCard padding="lg" rounded="2xl">
          <EyebrowLabel style={{ marginBottom: 8 }}>Emotional fingerprint</EyebrowLabel>
          <View style={{ alignItems: "center" }}>
            <MoodRadar data={moodRadar} color={song.gradientFrom} size={220} />
          </View>
        </GlassCard>

        <GlassCard padding="lg" rounded="2xl">
          <View style={styles.rowHeader}>
            <EyebrowLabel>Listening by hour</EyebrowLabel>
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
                    backgroundColor: peak ? song.gradientFrom : alpha.white(0.1),
                  }}
                />
              );
            })}
          </View>
          <View style={styles.hourLabels}>
            <Text style={styles.hourLabel}>00</Text>
            <Text style={styles.hourLabel}>06</Text>
            <Text style={styles.hourLabel}>12</Text>
            <Text style={styles.hourLabel}>18</Text>
            <Text style={styles.hourLabel}>23</Text>
          </View>
        </GlassCard>

        <GlassCard padding="lg" rounded="2xl">
          <EyebrowLabel style={{ marginBottom: 8 }}>Plays per month</EyebrowLabel>
          <Sparkline data={data.monthTrend.map((m) => m.v)} width={290} height={70} color={song.gradientFrom} />
          <View style={styles.monthLabels}>
            {data.monthTrend.map((m) => (
              <Text key={m.m} style={styles.hourLabel}>
                {m.m[0]}
              </Text>
            ))}
          </View>
        </GlassCard>

        <GlassCard padding="lg" rounded="2xl">
          <EyebrowLabel style={{ marginBottom: 8 }}>Repeat frequency</EyebrowLabel>
          <Sparkline data={data.repeatCurve.map((p) => p.v)} width={290} height={70} color={song.gradientTo} />
          <Text style={styles.repeatCaption}>
            Most back-to-back: <Text style={styles.repeatCaptionStrong}>{data.maxRepeatsInOneDay}×</Text> in one sitting.
          </Text>
        </GlassCard>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  rowHeader: { marginBottom: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  peakText: { fontSize: fontSize[11], color: alpha.white(0.4) },
  peakTextStrong: { fontFamily: "GeistSansMedium", color: colors.white },
  hourBars: { flexDirection: "row", alignItems: "flex-end", gap: 2 },
  hourLabels: { marginTop: 8, flexDirection: "row", justifyContent: "space-between" },
  hourLabel: { fontSize: fontSize[10], color: alpha.white(0.3) },
  monthLabels: { marginTop: 6, flexDirection: "row", justifyContent: "space-between" },
  repeatCaption: { marginTop: 8, fontSize: fontSize[12], color: alpha.white(0.45) },
  repeatCaptionStrong: { fontFamily: "GeistSansMedium", color: colors.white },
});

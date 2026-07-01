import { View, Text } from "react-native";
import { GlassCard, SectionHeading, EyebrowLabel } from "@/components/ui";
import { alpha } from "@/lib/theme/tokens";
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
      <View className="mb-5">
        <SectionHeading
          label="Mood reconstruction"
          title="The texture of your listening"
          subtitle="When this song lived in heavy rotation."
        />
      </View>

      <View className="gap-4">
        <GlassCard padding="lg" rounded="2xl">
          <EyebrowLabel className="mb-2">Emotional fingerprint</EyebrowLabel>
          <View className="items-center">
            <MoodRadar data={moodRadar} color={song.gradientFrom} size={220} />
          </View>
        </GlassCard>

        <GlassCard padding="lg" rounded="2xl">
          <View className="mb-3 flex-row items-center justify-between">
            <EyebrowLabel>Listening by hour</EyebrowLabel>
            <Text className="text-11 text-white/40">
              Peak at <Text className="font-sans-medium text-white">{data.peakHourLabel}</Text>
            </Text>
          </View>
          <View className="flex-row items-end gap-[2px]" style={{ height: HOUR_BAR_HEIGHT }}>
            {data.hourHeat.map((h) => {
              const peak = h.hour >= 23 || h.hour <= 2;
              return (
                <View
                  key={h.hour}
                  className="flex-1 rounded-t-sm"
                  style={{
                    height: Math.max(6, Math.round((h.v / maxHour) * HOUR_BAR_HEIGHT)),
                    backgroundColor: peak ? song.gradientFrom : alpha.white(0.1),
                  }}
                />
              );
            })}
          </View>
          <View className="mt-2 flex-row justify-between">
            <Text className="text-10 text-white/30">00</Text>
            <Text className="text-10 text-white/30">06</Text>
            <Text className="text-10 text-white/30">12</Text>
            <Text className="text-10 text-white/30">18</Text>
            <Text className="text-10 text-white/30">23</Text>
          </View>
        </GlassCard>

        <GlassCard padding="lg" rounded="2xl">
          <EyebrowLabel className="mb-2">Plays per month</EyebrowLabel>
          <Sparkline data={data.monthTrend.map((m) => m.v)} width={290} height={70} color={song.gradientFrom} />
          <View className="mt-1.5 flex-row justify-between">
            {data.monthTrend.map((m) => (
              <Text key={m.m} className="text-10 text-white/30">
                {m.m[0]}
              </Text>
            ))}
          </View>
        </GlassCard>

        <GlassCard padding="lg" rounded="2xl">
          <EyebrowLabel className="mb-2">Repeat frequency</EyebrowLabel>
          <Sparkline data={data.repeatCurve.map((p) => p.v)} width={290} height={70} color={song.gradientTo} />
          <Text className="mt-2 text-12 text-white/45">
            Most back-to-back: <Text className="font-sans-medium text-white">{data.maxRepeatsInOneDay}×</Text> in one
            sitting.
          </Text>
        </GlassCard>
      </View>
    </View>
  );
}

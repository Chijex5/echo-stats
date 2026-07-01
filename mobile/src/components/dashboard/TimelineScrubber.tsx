import { useState } from "react";
import { View, Text, Pressable, ScrollView, type LayoutChangeEvent } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { useAnimatedStyle, useSharedValue, withTiming, runOnJS } from "react-native-reanimated";
import { Pill } from "@/components/ui";
import { colors, alpha } from "@/lib/theme/tokens";
import type { TimelinePagePeriod } from "@/lib/api/hooks";

const MONTH_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const THUMB_SIZE = 20;

type TimelineScrubberProps = {
  periods: TimelinePagePeriod[];
  activeIdx: number;
  onChange: (idx: number) => void;
};

export function TimelineScrubber({ periods, activeIdx, onChange }: TimelineScrubberProps) {
  const [trackWidth, setTrackWidth] = useState(0);
  const progress = useSharedValue(periods.length > 1 ? activeIdx / (periods.length - 1) : 0);

  const activePeriod = periods[activeIdx] ?? periods[0];
  const years = [...new Set(periods.map((p) => p.year))].sort((a, b) => a - b);
  const monthsForYear = periods.filter((p) => p.year === activePeriod?.year).sort((a, b) => a.monthIdx - b.monthIdx);

  function setFromPct(pct: number) {
    "worklet";
    const clamped = Math.max(0, Math.min(1, pct));
    progress.value = clamped;
    const idx = Math.round(clamped * (periods.length - 1));
    runOnJS(onChange)(idx);
  }

  const pan = Gesture.Pan()
    .onBegin((e) => setFromPct(trackWidth ? e.x / trackWidth : 0))
    .onUpdate((e) => setFromPct(trackWidth ? e.x / trackWidth : 0));

  const thumbStyle = useAnimatedStyle(() => ({
    left: withTiming(progress.value * trackWidth - THUMB_SIZE / 2, { duration: 80 }),
  }));
  const fillStyle = useAnimatedStyle(() => ({
    width: withTiming(`${progress.value * 100}%`, { duration: 80 }),
  }));

  function handleLayout(e: LayoutChangeEvent) {
    setTrackWidth(e.nativeEvent.layout.width);
  }

  function jumpToYear(year: number) {
    const first = periods.find((p) => p.year === year);
    if (!first) return;
    const idx = periods.findIndex((p) => p.id === first.id);
    if (idx >= 0) {
      progress.value = periods.length > 1 ? idx / (periods.length - 1) : 0;
      onChange(idx);
    }
  }

  function jumpToPeriod(id: string) {
    const idx = periods.findIndex((p) => p.id === id);
    if (idx >= 0) {
      progress.value = periods.length > 1 ? idx / (periods.length - 1) : 0;
      onChange(idx);
    }
  }

  return (
    <View>
      <Text className="text-10 uppercase tracking-widest2 text-white/35">Now exploring</Text>
      <Text className="mt-1 text-xl font-sans-bold text-white">
        {activePeriod?.monthName} {activePeriod?.year}
      </Text>

      <View className="mt-6 px-1">
        <GestureDetector gesture={pan}>
          <View className="h-7 justify-center" onLayout={handleLayout}>
            <View className="h-1 rounded-full bg-white/10" />
            <Animated.View
              style={[{ position: "absolute", left: 0, height: 4, borderRadius: 2, backgroundColor: colors.echoGreen }, fillStyle]}
            />
            <Animated.View
              style={[
                {
                  position: "absolute",
                  top: "50%",
                  marginTop: -THUMB_SIZE / 2,
                  width: THUMB_SIZE,
                  height: THUMB_SIZE,
                  borderRadius: THUMB_SIZE / 2,
                  backgroundColor: colors.echoGreen,
                  borderWidth: 2.5,
                  borderColor: colors.white,
                },
                thumbStyle,
              ]}
            />
          </View>
        </GestureDetector>

        <View className="mt-1 flex-row justify-between">
          {years.map((year) => (
            <Pressable key={year} onPress={() => jumpToYear(year)}>
              <Text
                className="text-11 font-sans-semibold"
                style={{ color: year === activePeriod?.year ? colors.echoGreen : alpha.white(0.35) }}
              >
                {year}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-4" contentContainerStyle={{ gap: 8 }}>
        {monthsForYear.map((p) => (
          <Pill
            key={p.id}
            label={MONTH_SHORT[p.monthIdx] ?? p.monthName}
            variant="spotify"
            selected={p.id === activePeriod?.id}
            onPress={() => jumpToPeriod(p.id)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

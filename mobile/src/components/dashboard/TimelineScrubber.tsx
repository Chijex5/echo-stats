import { useState } from "react";
import { View, Text, Pressable, ScrollView, StyleSheet, type LayoutChangeEvent } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { useAnimatedStyle, useSharedValue, withTiming, runOnJS } from "react-native-reanimated";
import { Pill } from "@/components/ui";
import { colors, alpha, fontSize, trackingWidest2 } from "@/lib/theme/tokens";
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
      <Text style={styles.eyebrow}>Now exploring</Text>
      <Text style={styles.heading}>
        {activePeriod?.monthName} {activePeriod?.year}
      </Text>

      <View style={styles.trackSection}>
        <GestureDetector gesture={pan}>
          <View style={styles.trackTouchArea} onLayout={handleLayout}>
            <View style={styles.trackBase} />
            <Animated.View style={[styles.trackFill, fillStyle]} />
            <Animated.View style={[styles.thumb, thumbStyle]} />
          </View>
        </GestureDetector>

        <View style={styles.yearsRow}>
          {years.map((year) => (
            <Pressable key={year} onPress={() => jumpToYear(year)}>
              <Text style={[styles.yearLabel, { color: year === activePeriod?.year ? colors.echoGreen : alpha.white(0.35) }]}>
                {year}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 16 }} contentContainerStyle={{ gap: 8 }}>
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

const styles = StyleSheet.create({
  eyebrow: {
    fontSize: fontSize[10],
    textTransform: "uppercase",
    letterSpacing: trackingWidest2(fontSize[10]),
    color: alpha.white(0.35),
  },
  heading: { marginTop: 4, fontSize: fontSize[20], fontFamily: "GeistSansBold", color: colors.white },
  trackSection: { marginTop: 24, paddingHorizontal: 4 },
  trackTouchArea: { height: 28, justifyContent: "center" },
  trackBase: { height: 4, borderRadius: 999, backgroundColor: alpha.white(0.1) },
  trackFill: { position: "absolute", left: 0, height: 4, borderRadius: 2, backgroundColor: colors.echoGreen },
  thumb: {
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
  yearsRow: { marginTop: 4, flexDirection: "row", justifyContent: "space-between" },
  yearLabel: { fontSize: fontSize[11], fontFamily: "GeistSansSemiBold" },
});

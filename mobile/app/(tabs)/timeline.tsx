import { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { MotiView } from "moti";
import { GlassCard, SectionHeading, Shimmer, ScreenScroll } from "@/components/ui";
import { staggerChild } from "@/lib/motion/presets";
import { useTimelinePage, useTimelineExplorer } from "@/lib/api/hooks";
import { TimelineScrubber } from "@/components/dashboard/TimelineScrubber";
import { TimelineSnapshot } from "@/components/dashboard/TimelineSnapshot";
import { TimeComparisonSection } from "@/components/dashboard/TimeComparisonSection";
import { RandomNostalgiaSheet } from "@/components/dashboard/RandomNostalgiaSheet";
import { TimelineInsights } from "@/components/dashboard/TimelineInsights";
import { CalendarHeatmap } from "@/components/charts";
import { alpha, fontSize, trackingWidest2 } from "@/lib/theme/tokens";

export default function TimelineScreen() {
  const page = useTimelinePage();
  const explorer = useTimelineExplorer();
  const [activeIdx, setActiveIdx] = useState(0);

  const periods = page.data?.periods ?? [];
  const activePeriod = periods[activeIdx] ?? periods[0];
  const isLoading = page.isLoading;

  return (
    <ScreenScroll>
      <View style={{ marginBottom: 20 }}>
        <SectionHeading label="Look back" title="Timeline" align="left" />
      </View>

      {isLoading ? (
        <View style={{ gap: 12 }}>
          <Shimmer width="100%" height={110} rounded="xl" />
          <Shimmer width="100%" height={260} rounded="xl" />
          <Shimmer width="100%" height={140} rounded="xl" />
        </View>
      ) : periods.length ? (
        <View style={{ gap: 20 }}>
          <MotiView {...staggerChild(0)}>
            <GlassCard padding="lg" rounded="2xl">
              <TimelineScrubber periods={periods} activeIdx={activeIdx} onChange={setActiveIdx} />
            </GlassCard>
          </MotiView>

          {activePeriod ? <TimelineSnapshot period={activePeriod} /> : null}

          {explorer.data?.cells.length ? (
            <MotiView {...staggerChild(2)}>
              <GlassCard padding="lg" rounded="2xl">
                <Text style={styles.eyebrow}>Listening activity</Text>
                <Text style={styles.rangeLabel}>{explorer.data.selectedRange.label}</Text>
                <CalendarHeatmap cells={explorer.data.cells} />
              </GlassCard>
            </MotiView>
          ) : null}

          <MotiView {...staggerChild(3)}>
            <TimeComparisonSection periods={periods} />
          </MotiView>

          <MotiView {...staggerChild(4)}>
            <RandomNostalgiaSheet periods={periods} />
          </MotiView>

          {page.data?.insights.length ? <TimelineInsights insights={page.data.insights} startIndex={5} /> : null}
        </View>
      ) : (
        <Text style={styles.empty}>No timeline data yet — keep listening.</Text>
      )}
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  eyebrow: {
    fontSize: fontSize[10],
    textTransform: "uppercase",
    letterSpacing: trackingWidest2(fontSize[10]),
    color: alpha.white(0.35),
  },
  rangeLabel: { marginBottom: 16, marginTop: 4, fontSize: fontSize[13], color: alpha.white(0.45) },
  empty: { fontSize: fontSize[13], color: alpha.white(0.4) },
});

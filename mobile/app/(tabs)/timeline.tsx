import { useState } from "react";
import { View, Text } from "react-native";
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

export default function TimelineScreen() {
  const page = useTimelinePage();
  const explorer = useTimelineExplorer();
  const [activeIdx, setActiveIdx] = useState(0);

  const periods = page.data?.periods ?? [];
  const activePeriod = periods[activeIdx] ?? periods[0];
  const isLoading = page.isLoading;

  return (
    <ScreenScroll>
      <View className="mb-5">
        <SectionHeading label="Look back" title="Timeline" align="left" />
      </View>

      {isLoading ? (
        <View className="gap-3">
          <Shimmer width="100%" height={110} rounded="xl" />
          <Shimmer width="100%" height={260} rounded="xl" />
          <Shimmer width="100%" height={140} rounded="xl" />
        </View>
      ) : periods.length ? (
        <View className="gap-5">
          <MotiView {...staggerChild(0)}>
            <GlassCard padding="lg" rounded="2xl">
              <TimelineScrubber periods={periods} activeIdx={activeIdx} onChange={setActiveIdx} />
            </GlassCard>
          </MotiView>

          {activePeriod ? <TimelineSnapshot period={activePeriod} /> : null}

          {explorer.data?.cells.length ? (
            <MotiView {...staggerChild(2)}>
              <GlassCard padding="lg" rounded="2xl">
                <Text className="text-10 uppercase tracking-widest2 text-white/35">Listening activity</Text>
                <Text className="mb-4 mt-1 text-13 text-white/45">{explorer.data.selectedRange.label}</Text>
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
        <Text className="text-13 text-white/40">No timeline data yet — keep listening.</Text>
      )}
    </ScreenScroll>
  );
}

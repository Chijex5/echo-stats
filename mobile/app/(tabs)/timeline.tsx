import { useState } from "react";
import { ScrollView, View, Text, Pressable, StyleSheet } from "react-native";
import { MotiView } from "moti";
import { Shuffle, TrendingUp, Music2, Moon } from "lucide-react-native";
import { Shimmer } from "@/components/ui";
import { ProfileHeaderButton } from "@/components/dashboard/ProfileHeaderButton";
import { MonthChapterHero } from "@/components/timeline/MonthChapterHero";
import { YearRail } from "@/components/timeline/YearRail";
import { ThenVsNow } from "@/components/timeline/ThenVsNow";
import { RandomMemorySheet } from "@/components/timeline/RandomMemorySheet";
import { CalendarHeatmap } from "@/components/charts";
import { staggerChild } from "@/lib/motion/presets";
import { colorForKey } from "@/lib/theme/gradients";
import { colors, alpha, spacing, fontSize, radius, trackingWidest2 } from "@/lib/theme/tokens";
import { useTimelinePage, useTimelineExplorer } from "@/lib/api/hooks";

const INSIGHT_ICONS = [TrendingUp, Music2, Moon];

function SectionTitle({ title, sub }: { title: string; sub: string }) {
  return (
    <View style={styles.sectionTitle}>
      <Text style={styles.sectionTitleText}>{title}</Text>
      <Text style={styles.sectionSubText}>{sub}</Text>
    </View>
  );
}

export default function TimelineScreen() {
  const page = useTimelinePage();
  const explorer = useTimelineExplorer();
  const [memoryOpen, setMemoryOpen] = useState(false);

  const periods = page.data?.periods ?? [];
  const latest = periods.at(-1);
  const insights = page.data?.insights ?? [];

  return (
    <View style={{ flex: 1, paddingTop: spacing.screenTop, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: spacing.screenX, paddingBottom: spacing.screenBottom }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Rewind</Text>
            <Text style={styles.subtitle}>Your listening, month by month</Text>
          </View>
          <Pressable
            onPress={() => setMemoryOpen(true)}
            disabled={!periods.length}
            style={styles.shuffleButton}
            hitSlop={8}
          >
            <Shuffle size={16} color={periods.length ? colors.white : alpha.white(0.3)} />
          </Pressable>
          <ProfileHeaderButton />
        </View>

        {page.isLoading ? (
          <View style={{ gap: 14 }}>
            <Shimmer width="100%" height={230} rounded="xl" />
            <Shimmer width="100%" height={140} rounded="xl" />
            <Shimmer width="100%" height={260} rounded="xl" />
          </View>
        ) : periods.length ? (
          <View>
            {latest ? (
              <MotiView {...staggerChild(0)} style={styles.section}>
                <MonthChapterHero period={latest} />
              </MotiView>
            ) : null}

            <MotiView {...staggerChild(1)} style={styles.section}>
              <SectionTitle title="Then vs now" sub="You, about a year apart" />
              <ThenVsNow periods={periods} />
            </MotiView>

            <MotiView {...staggerChild(2)} style={styles.section}>
              <SectionTitle title="The archive" sub="Tap a month to reopen it" />
              <YearRail periods={periods} yearHours={page.data?.yearHours ?? []} />
            </MotiView>

            {explorer.data?.cells.length ? (
              <MotiView {...staggerChild(3)} style={styles.section}>
                <SectionTitle title="Listening activity" sub={explorer.data.selectedRange.label} />
                <View style={styles.heatmapCard}>
                  <CalendarHeatmap cells={explorer.data.cells} />
                </View>
              </MotiView>
            ) : null}

            {insights.length ? (
              <MotiView {...staggerChild(4)}>
                <SectionTitle title="Patterns" sub="What the years add up to" />
                <View style={{ gap: 10 }}>
                  {insights.map((insight, i) => {
                    const Icon = INSIGHT_ICONS[i % INSIGHT_ICONS.length];
                    const accent = colorForKey(insight.label);
                    return (
                      <View key={insight.label} style={styles.insightCard}>
                        <View style={styles.insightHead}>
                          <Icon size={13} color={accent} />
                          <Text style={styles.insightLabel}>{insight.label}</Text>
                        </View>
                        <Text style={styles.insightTitle}>{insight.title}</Text>
                        <Text style={styles.insightSub}>{insight.sub}</Text>
                      </View>
                    );
                  })}
                </View>
              </MotiView>
            ) : null}
          </View>
        ) : (
          <Text style={styles.empty}>No timeline data yet — keep listening.</Text>
        )}
      </ScrollView>

      <RandomMemorySheet periods={periods} visible={memoryOpen} onClose={() => setMemoryOpen(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: { marginBottom: 24, flexDirection: "row", alignItems: "center", gap: 12 },
  title: { fontSize: fontSize[26], fontFamily: "GeistSansBold", color: colors.white },
  subtitle: { marginTop: 2, fontSize: fontSize[13], fontFamily: "GeistSans", color: alpha.white(0.45) },
  shuffleButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceRaised,
    alignItems: "center",
    justifyContent: "center",
  },

  section: { marginBottom: 28 },
  sectionTitle: { marginBottom: 14 },
  sectionTitleText: { fontSize: fontSize[20], fontFamily: "GeistSansBold", color: colors.white },
  sectionSubText: { marginTop: 3, fontSize: fontSize[12], fontFamily: "GeistSans", color: alpha.white(0.45) },

  heatmapCard: { borderRadius: radius["2xl"], backgroundColor: colors.surface, padding: 16 },

  insightCard: { borderRadius: radius["2xl"], backgroundColor: colors.surface, padding: 16 },
  insightHead: { flexDirection: "row", alignItems: "center", gap: 8 },
  insightLabel: {
    fontSize: fontSize[10],
    fontFamily: "GeistSans",
    textTransform: "uppercase",
    letterSpacing: trackingWidest2(fontSize[10]),
    color: alpha.white(0.35),
  },
  insightTitle: { marginTop: 8, fontSize: fontSize[15], fontFamily: "GeistSansSemiBold", color: colors.white },
  insightSub: { marginTop: 3, fontSize: fontSize[12], fontFamily: "GeistSans", color: alpha.white(0.45) },
  empty: { fontSize: fontSize[13], fontFamily: "GeistSans", color: alpha.white(0.4) },
});

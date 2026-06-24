import { useState } from "react";
import { ScrollView, View, Text } from "react-native";
import { MotiView } from "moti";
import { Shimmer } from "@/components/ui";
import { staggerChild } from "@/lib/motion/presets";
import { useSongOfTheDay } from "@/lib/api/hooks";
import { SotdHero, QuickStats, TheStory, InsightTabs, RelatedForgotten, DailyRitual, ShareSheet } from "@/components/sotd";

export default function SongOfTheDayScreen() {
  const sotd = useSongOfTheDay();
  const [shareOpen, setShareOpen] = useState(false);
  const data = sotd.data;

  return (
    <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 72, paddingBottom: 140 }}>
      {sotd.isLoading ? (
        <View className="gap-4">
          <Shimmer width="100%" height={420} rounded="xl" />
          <Shimmer width="100%" height={70} rounded="xl" />
          <Shimmer width="100%" height={120} rounded="xl" />
          <Shimmer width="100%" height={320} rounded="xl" />
        </View>
      ) : sotd.isError || !data ? (
        <Text className="mt-20 text-center text-[13px] text-white/40">
          Could not load today&apos;s song. Please try again.
        </Text>
      ) : (
        <View className="gap-8">
          <MotiView {...staggerChild(0)}>
            <SotdHero song={data.song} onShare={() => setShareOpen(true)} />
          </MotiView>

          <MotiView {...staggerChild(1)}>
            <QuickStats
              pastPlays={data.stats.pastPlays}
              lastPlayed={data.stats.lastPlayed}
              affinityScore={data.affinityScore}
              affinityLabel={data.affinityLabel}
              streakDays={data.dailyRitual.streakDays}
            />
          </MotiView>

          <MotiView {...staggerChild(2)}>
            <TheStory beats={data.storyBeats} />
          </MotiView>

          <MotiView {...staggerChild(3)}>
            <InsightTabs
              reasons={data.algoReasons}
              mood={data.moodReconstruction}
              snapshot={data.memorySnapshot}
              song={data.song}
            />
          </MotiView>

          <MotiView {...staggerChild(4)}>
            <RelatedForgotten related={data.related} />
          </MotiView>

          <MotiView {...staggerChild(5)}>
            <DailyRitual data={data.dailyRitual} />
          </MotiView>

          <ShareSheet
            visible={shareOpen}
            song={data.song}
            stats={data.stats}
            affinityScore={data.affinityScore}
            affinityLabel={data.affinityLabel}
            onClose={() => setShareOpen(false)}
          />
        </View>
      )}
    </ScrollView>
  );
}

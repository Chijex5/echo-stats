import { useState } from "react";
import { ScrollView, View, Text } from "react-native";
import { MotiView } from "moti";
import { SectionHeading, Shimmer } from "@/components/ui";
import { staggerChild } from "@/lib/motion/presets";
import { useSongOfTheDay } from "@/lib/api/hooks";
import { SotdHero, TheStory, MemorySnapshot, WhyWePickedThis, RelatedForgotten, MoodReconstruction, DailyRitual, ShareSheet } from "@/components/sotd";

export default function SongOfTheDayScreen() {
  const sotd = useSongOfTheDay();
  const [shareOpen, setShareOpen] = useState(false);
  const data = sotd.data;

  return (
    <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 72, paddingBottom: 140 }}>
      <View className="mb-6">
        <SectionHeading label="Today's pick" title="Song of the day" align="left" />
      </View>

      {sotd.isLoading ? (
        <View className="gap-4">
          <Shimmer width="100%" height={420} rounded="xl" />
          <Shimmer width="100%" height={180} rounded="xl" />
          <Shimmer width="100%" height={260} rounded="xl" />
        </View>
      ) : sotd.isError || !data ? (
        <Text className="mt-10 text-center text-[13px] text-white/40">
          Could not load today&apos;s song. Please try again.
        </Text>
      ) : (
        <View className="gap-10">
          <MotiView {...staggerChild(0)}>
            <SotdHero song={data.song} stats={data.stats} onShare={() => setShareOpen(true)} />
          </MotiView>

          <MotiView {...staggerChild(1)}>
            <TheStory beats={data.storyBeats} />
          </MotiView>

          <MotiView {...staggerChild(2)}>
            <MemorySnapshot data={data.memorySnapshot} />
          </MotiView>

          <MotiView {...staggerChild(3)}>
            <WhyWePickedThis reasons={data.algoReasons} affinityScore={data.affinityScore} affinityLabel={data.affinityLabel} />
          </MotiView>

          <MotiView {...staggerChild(4)}>
            <RelatedForgotten related={data.related} />
          </MotiView>

          <MotiView {...staggerChild(5)}>
            <MoodReconstruction data={data.moodReconstruction} song={data.song} />
          </MotiView>

          <MotiView {...staggerChild(6)}>
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

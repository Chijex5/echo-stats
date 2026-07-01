import { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { MotiView } from "moti";
import { SectionHeading, Shimmer, ScreenScroll } from "@/components/ui";
import { staggerChild } from "@/lib/motion/presets";
import { useSongOfTheDay } from "@/lib/api/hooks";
import { SotdHero, TheStory, MemorySnapshot, WhyWePickedThis, RelatedForgotten, MoodReconstruction, DailyRitual, ShareSheet } from "@/components/sotd";
import { alpha, fontSize } from "@/lib/theme/tokens";

export default function SongOfTheDayScreen() {
  const sotd = useSongOfTheDay();
  const [shareOpen, setShareOpen] = useState(false);
  const data = sotd.data;

  return (
    <ScreenScroll>
      <View style={{ marginBottom: 24 }}>
        <SectionHeading label="Today's pick" title="Song of the day" align="left" />
      </View>

      {sotd.isLoading ? (
        <View style={{ gap: 16 }}>
          <Shimmer width="100%" height={420} rounded="xl" />
          <Shimmer width="100%" height={180} rounded="xl" />
          <Shimmer width="100%" height={260} rounded="xl" />
        </View>
      ) : sotd.isError || !data ? (
        <Text style={styles.error}>Could not load today&apos;s song. Please try again.</Text>
      ) : (
        <View style={{ gap: 40 }}>
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
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  error: { marginTop: 40, textAlign: "center", fontSize: fontSize[13], color: alpha.white(0.4) },
});

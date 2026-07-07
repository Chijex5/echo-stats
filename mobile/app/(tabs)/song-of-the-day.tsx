import { useState } from "react";
import { ScrollView, View, Text, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { X } from "lucide-react-native";
import { MotiView } from "moti";
import { Shimmer } from "@/components/ui";
import { staggerChild } from "@/lib/motion/presets";
import { useSongOfTheDay } from "@/lib/api/hooks";
import { colorForKey } from "@/lib/theme/gradients";
import {
  SotdHero,
  TheStory,
  MemorySnapshot,
  WhyWePickedThis,
  RelatedForgotten,
  MoodReconstruction,
  DailyRitual,
  ShareSheet,
} from "@/components/sotd";
import { colors, alpha, spacing, fontSize } from "@/lib/theme/tokens";

function SectionTitle({ title, sub }: { title: string; sub: string }) {
  return (
    <View style={styles.sectionTitle}>
      <Text style={styles.sectionTitleText}>{title}</Text>
      <Text style={styles.sectionSubText}>{sub}</Text>
    </View>
  );
}

export default function SongOfTheDayScreen() {
  const router = useRouter();
  const sotd = useSongOfTheDay();
  const [shareOpen, setShareOpen] = useState(false);
  const data = sotd.data;

  // Accent for the whole page, derived client-side from the pick itself —
  // the backend's gradientFrom/gradientTo hints are never used.
  const accent = data ? colorForKey(data.song.title) : colors.echoGreen;

  return (
    <View style={{ flex: 1, paddingTop: spacing.screenTop, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: spacing.screenX, paddingBottom: spacing.screenBottom }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Song of the day</Text>
            <Text style={styles.subtitle}>One resurfaced memory, every morning</Text>
          </View>
          <Pressable onPress={() => router.back()} hitSlop={8} style={styles.close}>
            <X size={18} color={alpha.white(0.6)} />
          </Pressable>
        </View>

        {sotd.isLoading ? (
          <View style={{ gap: 14 }}>
            <Shimmer width="100%" height={360} rounded="xl" />
            <Shimmer width="100%" height={180} rounded="xl" />
            <Shimmer width="100%" height={240} rounded="xl" />
          </View>
        ) : sotd.isError || !data ? (
          <Text style={styles.error}>Could not load today&apos;s song. Please try again.</Text>
        ) : (
          <View>
            <MotiView {...staggerChild(0)} style={styles.section}>
              <SotdHero song={data.song} stats={data.stats} onShare={() => setShareOpen(true)} />
            </MotiView>

            <MotiView {...staggerChild(1)} style={styles.section}>
              <SectionTitle title="The story" sub="How this song lived with you" />
              <TheStory beats={data.storyBeats} accent={accent} />
            </MotiView>

            <MotiView {...staggerChild(2)} style={styles.section}>
              <SectionTitle title="When it peaked" sub={`What surrounded it in ${data.memorySnapshot.peakMonthLabel}`} />
              <MemorySnapshot data={data.memorySnapshot} />
            </MotiView>

            <MotiView {...staggerChild(3)} style={styles.section}>
              <SectionTitle title="Why we picked it" sub="The signals behind today's choice" />
              <WhyWePickedThis
                reasons={data.algoReasons}
                affinityScore={data.affinityScore}
                affinityLabel={data.affinityLabel}
                accent={accent}
              />
            </MotiView>

            <MotiView {...staggerChild(4)} style={styles.section}>
              <SectionTitle title="The texture" sub="When this song was in heavy rotation" />
              <MoodReconstruction data={data.moodReconstruction} accent={accent} />
            </MotiView>

            {data.related.length ? (
              <MotiView {...staggerChild(5)} style={styles.section}>
                <SectionTitle title="More memories" sub="What we'd resurface next" />
                <RelatedForgotten related={data.related} />
              </MotiView>
            ) : null}

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
    </View>
  );
}

const styles = StyleSheet.create({
  header: { marginBottom: 20, flexDirection: "row", alignItems: "center", gap: 12 },
  title: { fontSize: fontSize[26], fontFamily: "GeistSansBold", color: colors.white },
  subtitle: { marginTop: 2, fontSize: fontSize[13], fontFamily: "GeistSans", color: alpha.white(0.45) },
  close: {
    height: 36,
    width: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
    backgroundColor: colors.surfaceRaised,
  },

  section: { marginBottom: 28 },
  sectionTitle: { marginBottom: 14 },
  sectionTitleText: { fontSize: fontSize[20], fontFamily: "GeistSansBold", color: colors.white },
  sectionSubText: { marginTop: 3, fontSize: fontSize[12], fontFamily: "GeistSans", color: alpha.white(0.45) },

  error: { marginTop: 40, textAlign: "center", fontSize: fontSize[13], color: alpha.white(0.4) },
});

import { ScrollView, View, Text, StyleSheet, useWindowDimensions } from "react-native";
import { MotiView } from "moti";
import { Shimmer } from "@/components/ui";
import { ProfileHeaderButton } from "@/components/dashboard/ProfileHeaderButton";
import { SoundDNAOrbit } from "@/components/insights/SoundDNAOrbit";
import { ListeningClock } from "@/components/insights/ListeningClock";
import { DecadeSkyline } from "@/components/insights/DecadeSkyline";
import { MomentsCarousel, buildMoments } from "@/components/insights/MomentsCarousel";
import { staggerChild } from "@/lib/motion/presets";
import { colors, alpha, spacing, fontSize } from "@/lib/theme/tokens";
import { useInsights } from "@/lib/api/hooks";

function SectionTitle({ title, sub }: { title: string; sub: string }) {
  return (
    <View style={styles.sectionTitle}>
      <Text style={styles.sectionTitleText}>{title}</Text>
      <Text style={styles.sectionSubText}>{sub}</Text>
    </View>
  );
}

export default function InsightsScreen() {
  const insights = useInsights();
  const { width } = useWindowDimensions();
  const data = insights.data;

  const orbitSize = Math.min(width - spacing.screenX * 2, 340);
  const moments = data ? buildMoments(data) : [];
  const hasGenres = Boolean(data?.analysisResult.genreProfile.nodes.length);

  return (
    <View style={{ flex: 1, paddingTop: spacing.screenTop, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ paddingBottom: spacing.screenBottom }} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Your sound</Text>
            <Text style={styles.subtitle}>What your listening says about you</Text>
          </View>
          <ProfileHeaderButton />
        </View>

        {insights.isLoading ? (
          <View style={styles.loading}>
            <Shimmer width="100%" height={320} rounded="xl" />
            <Shimmer width="100%" height={200} rounded="xl" />
            <Shimmer width="100%" height={220} rounded="xl" />
          </View>
        ) : data ? (
          <View>
            <MotiView {...staggerChild(0)} style={styles.section}>
              <View style={{ paddingHorizontal: spacing.screenX }}>
                <SectionTitle title="Sound DNA" sub="Your genres, and how tightly they orbit each other" />
              </View>
              {hasGenres ? (
                <>
                  <SoundDNAOrbit profile={data.analysisResult.genreProfile} size={orbitSize} />
                  <Text style={styles.orbitHint}>Tap a genre to read its share</Text>
                </>
              ) : (
                <Text style={styles.empty}>Not enough genre data yet — keep listening.</Text>
              )}
            </MotiView>

            <MotiView {...staggerChild(1)} style={[styles.section, { paddingHorizontal: spacing.screenX }]}>
              <SectionTitle title="Listening clock" sub="When the music actually happens" />
              <ListeningClock profile={data.emotionalProfile} />
            </MotiView>

            <MotiView {...staggerChild(2)} style={[styles.section, { paddingHorizontal: spacing.screenX }]}>
              <SectionTitle title="Era profile" sub="Which decade your ears live in" />
              <DecadeSkyline decade={data.favoriteDecade} musicAge={data.analysisResult.musicAge} />
            </MotiView>

            {moments.length ? (
              <MotiView {...staggerChild(3)}>
                <View style={{ paddingHorizontal: spacing.screenX }}>
                  <SectionTitle title="Moments" sub="Small stories hiding in your history" />
                </View>
                <MomentsCarousel moments={moments} />
              </MotiView>
            ) : null}
          </View>
        ) : (
          <Text style={styles.empty}>Could not load your insights. Pull to retry.</Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.screenX,
    marginBottom: 24,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  title: { fontSize: fontSize[26], fontFamily: "GeistSansBold", color: colors.white },
  subtitle: { marginTop: 2, fontSize: fontSize[13], fontFamily: "GeistSans", color: alpha.white(0.45) },

  loading: { paddingHorizontal: spacing.screenX, gap: 14 },
  empty: { paddingHorizontal: spacing.screenX, fontSize: fontSize[13], color: alpha.white(0.4) },

  section: { marginBottom: 32 },
  sectionTitle: { marginBottom: 14 },
  sectionTitleText: { fontSize: fontSize[20], fontFamily: "GeistSansBold", color: colors.white },
  sectionSubText: { marginTop: 3, fontSize: fontSize[12], fontFamily: "GeistSans", color: alpha.white(0.45) },
  orbitHint: {
    marginTop: 6,
    textAlign: "center",
    fontSize: fontSize[10],
    fontFamily: "GeistSans",
    color: alpha.white(0.3),
  },
});

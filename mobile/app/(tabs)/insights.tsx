import { ScrollView, View, Text, StyleSheet } from "react-native";
import { MotiView } from "moti";
import { Gem, Shuffle, Heart, CalendarDays, Music2 } from "lucide-react-native";
import { GlassCard, SectionHeading, ListRow, Shimmer, ScreenScroll } from "@/components/ui";
import { RadialGauge, ProportionalBars } from "@/components/charts";
import { GenreBarList } from "@/components/dashboard/GenreBarList";
import { ProfileHeaderButton } from "@/components/dashboard/ProfileHeaderButton";
import { staggerChild } from "@/lib/motion/presets";
import { colors, alpha, palettes, fontSize, trackingWidest2 } from "@/lib/theme/tokens";
import { useInsights } from "@/lib/api/hooks";

const ERA_ORDER = ["pre-70s", "70s", "80s", "90s", "2000s", "2010s", "2020s+"];

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}

export default function InsightsScreen() {
  const insights = useInsights();
  const data = insights.data;

  const eraSegments = data
    ? ERA_ORDER.map((era, i) => ({
        label: era,
        pct: data.analysisResult.musicAge.eraBreakdown[era]?.percentage ?? 0,
        color: palettes.era[i],
      })).filter((segment) => segment.pct > 0)
    : [];

  return (
    <ScreenScroll style={{ backgroundColor: colors.background }}>
      <View style={styles.screenHeader}>
        <SectionHeading label="Discoveries" title="Insights" align="left" />
        <ProfileHeaderButton />
      </View>

      {insights.isLoading ? (
        <View style={{ gap: 12 }}>
          <Shimmer width="100%" height={180} rounded="xl" />
          <Shimmer width="100%" height={140} rounded="xl" />
          <Shimmer width="100%" height={140} rounded="xl" />
        </View>
      ) : data ? (
        <View style={{ gap: 20 }}>
          <MotiView {...staggerChild(0)}>
            <GlassCard padding="lg" rounded="2xl">
              <View style={styles.ageRow}>
                <RadialGauge
                  value={data.analysisResult.musicAge.avgTrackAgeYears}
                  min={0}
                  max={50}
                  valueLabel={`${data.analysisResult.musicAge.avgTrackAgeYears.toFixed(1)}`}
                  label="yrs old"
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.eyebrow}>Music age</Text>
                  <Text style={styles.ageTitle}>Your music averages {data.analysisResult.musicAge.avgTrackAgeYears.toFixed(1)} years old</Text>
                  <Text style={styles.ageSub}>Weighted by plays: {data.analysisResult.musicAge.weightedAvgTrackAgeYears.toFixed(1)} yrs</Text>
                  {data.analysisResult.musicAge.dominantReleaseYear ? (
                    <Text style={styles.ageSub}>Most common release year: {data.analysisResult.musicAge.dominantReleaseYear}</Text>
                  ) : null}
                </View>
              </View>

              {eraSegments.length ? (
                <View style={{ marginTop: 20 }}>
                  <Text style={styles.sectionLabel}>Era breakdown</Text>
                  <ProportionalBars segments={eraSegments} />
                </View>
              ) : null}
            </GlassCard>
          </MotiView>

          <MotiView {...staggerChild(1)}>
            <GlassCard padding="lg" rounded="2xl">
              <View style={styles.cardHeader}>
                <Music2 size={14} color={colors.echoGreen} />
                <Text style={styles.cardHeaderLabel}>Genre breakdown</Text>
              </View>
              <GenreBarList genres={data.analysisResult.genreProfile.nodes} />
            </GlassCard>
          </MotiView>

          <MotiView {...staggerChild(2)}>
            <Text style={styles.quickFactsLabel}>Quick facts</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
              <GlassCard padding="md" rounded="2xl" style={{ width: 240 }}>
                <View style={styles.cardHeader}>
                  <Gem size={14} color={colors.accentPurple} />
                  <Text style={styles.cardHeaderLabel}>Hidden gem</Text>
                </View>
                {data.hiddenGem ? (
                  <View style={{ marginTop: 8 }}>
                    <ListRow
                      imageUrl={data.hiddenGem.albumImageUrl}
                      title={data.hiddenGem.trackName}
                      subtitle={data.hiddenGem.artistName}
                      trailing={<Text style={styles.trailingText}>{data.hiddenGem.plays}×</Text>}
                    />
                  </View>
                ) : (
                  <Text style={styles.emptyText}>Keep listening to surface one.</Text>
                )}
              </GlassCard>

              <GlassCard padding="md" rounded="2xl" style={{ width: 220 }}>
                <View style={styles.cardHeader}>
                  <Shuffle size={14} color={colors.accentBlue} />
                  <Text style={styles.cardHeaderLabel}>Genre drift</Text>
                </View>
                <Text style={styles.bodyText}>
                  {data.genreDrift.drifted
                    ? `${data.genreDrift.from ?? "Unknown"} → ${data.genreDrift.to ?? "Unknown"}`
                    : "Your taste has stayed steady this month."}
                </Text>
              </GlassCard>

              <GlassCard padding="md" rounded="2xl" style={{ width: 220 }}>
                <View style={styles.cardHeader}>
                  <CalendarDays size={14} color={colors.accentAmber} />
                  <Text style={styles.cardHeaderLabel}>Favorite decade</Text>
                </View>
                {data.favoriteDecade.bars.some((bar) => bar.count > 0) ? (
                  <>
                    <Text style={styles.bodyText}>
                      {data.favoriteDecade.topDecade} · {Math.round(data.favoriteDecade.topPct)}%
                    </Text>
                    <View style={styles.decadeBars}>
                      {data.favoriteDecade.bars.map((bar) => (
                        <View key={bar.decade} style={styles.decadeBarItem}>
                          <View
                            style={[
                              styles.decadeBarFill,
                              {
                                height: Math.max(4, (bar.heightPct / 100) * 32),
                                backgroundColor: bar.isTop ? colors.echoGreen : alpha.white(0.15),
                              },
                            ]}
                          />
                          <Text style={styles.decadeBarLabel}>{bar.label}</Text>
                        </View>
                      ))}
                    </View>
                  </>
                ) : (
                  <Text style={styles.emptyText}>Not enough decade data yet.</Text>
                )}
              </GlassCard>

              <GlassCard padding="md" rounded="2xl" style={{ width: 240 }}>
                <View style={styles.cardHeader}>
                  <Heart size={14} color={colors.accentRed} />
                  <Text style={styles.cardHeaderLabel}>First song</Text>
                </View>
                {data.firstSong ? (
                  <View style={{ marginTop: 8 }}>
                    <ListRow
                      imageUrl={data.firstSong.albumImageUrl}
                      title={data.firstSong.trackName}
                      subtitle={data.firstSong.artistName}
                      trailing={<Text style={styles.trailingText}>{formatDate(data.firstSong.ts)}</Text>}
                    />
                  </View>
                ) : (
                  <Text style={styles.emptyText}>No history found yet.</Text>
                )}
              </GlassCard>
            </ScrollView>
          </MotiView>
        </View>
      ) : null}
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  screenHeader: { marginBottom: 20, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  ageRow: { flexDirection: "row", alignItems: "center", gap: 20 },
  eyebrow: {
    fontSize: fontSize[10],
    textTransform: "uppercase",
    letterSpacing: trackingWidest2(fontSize[10]),
    color: alpha.white(0.35),
  },
  ageTitle: { marginTop: 4, fontSize: fontSize[15], fontFamily: "GeistSansSemiBold", color: colors.white },
  ageSub: { marginTop: 6, fontSize: fontSize[12], color: alpha.white(0.45) },
  sectionLabel: { marginBottom: 8, fontSize: fontSize[12], fontFamily: "GeistSansMedium", color: alpha.white(0.7) },
  cardHeader: { marginBottom: 16, flexDirection: "row", alignItems: "center", gap: 8 },
  cardHeaderLabel: {
    fontSize: fontSize[11],
    textTransform: "uppercase",
    letterSpacing: trackingWidest2(fontSize[11]),
    color: alpha.white(0.35),
  },
  quickFactsLabel: {
    marginBottom: 12,
    fontSize: fontSize[11],
    fontFamily: "GeistSansSemiBold",
    textTransform: "uppercase",
    letterSpacing: trackingWidest2(fontSize[11]),
    color: alpha.white(0.3),
  },
  trailingText: { fontSize: fontSize[12], color: alpha.white(0.4) },
  emptyText: { marginTop: 8, fontSize: fontSize[13], color: alpha.white(0.4) },
  bodyText: { marginTop: 8, fontSize: fontSize[14], color: alpha.white(0.85) },
  decadeBars: { marginTop: 12, height: 44, flexDirection: "row", alignItems: "flex-end", gap: 6 },
  decadeBarItem: { flex: 1, alignItems: "center" },
  decadeBarFill: { width: "100%", borderTopLeftRadius: 6, borderTopRightRadius: 6 },
  decadeBarLabel: { marginTop: 4, fontSize: fontSize[9], color: alpha.white(0.35) },
});

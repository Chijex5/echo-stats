import { ScrollView, View, Text } from "react-native";
import { MotiView } from "moti";
import { Gem, Shuffle, Heart, CalendarDays, Music2 } from "lucide-react-native";
import { GlassCard, SectionHeading, ListRow, Shimmer, ScreenScroll } from "@/components/ui";
import { RadialGauge, ProportionalBars } from "@/components/charts";
import { GenreBarList } from "@/components/dashboard/GenreBarList";
import { staggerChild } from "@/lib/motion/presets";
import { colors, alpha, palettes } from "@/lib/theme/tokens";
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
    <ScreenScroll>
      <View className="mb-5">
        <SectionHeading label="Discoveries" title="Insights" align="left" />
      </View>

      {insights.isLoading ? (
        <View className="gap-3">
          <Shimmer width="100%" height={180} rounded="xl" />
          <Shimmer width="100%" height={140} rounded="xl" />
          <Shimmer width="100%" height={140} rounded="xl" />
        </View>
      ) : data ? (
        <View className="gap-5">
          <MotiView {...staggerChild(0)}>
            <GlassCard padding="lg" rounded="2xl">
              <View className="flex-row items-center gap-5">
                <RadialGauge
                  value={data.analysisResult.musicAge.avgTrackAgeYears}
                  min={0}
                  max={50}
                  valueLabel={`${data.analysisResult.musicAge.avgTrackAgeYears.toFixed(1)}`}
                  label="yrs old"
                />
                <View className="flex-1">
                  <Text className="text-10 uppercase tracking-widest2 text-white/35">Music age</Text>
                  <Text className="mt-1 text-15 font-sans-semibold text-white">
                    Your music averages {data.analysisResult.musicAge.avgTrackAgeYears.toFixed(1)} years old
                  </Text>
                  <Text className="mt-1.5 text-12 text-white/45">
                    Weighted by plays: {data.analysisResult.musicAge.weightedAvgTrackAgeYears.toFixed(1)} yrs
                  </Text>
                  {data.analysisResult.musicAge.dominantReleaseYear ? (
                    <Text className="mt-1 text-12 text-white/45">
                      Most common release year: {data.analysisResult.musicAge.dominantReleaseYear}
                    </Text>
                  ) : null}
                </View>
              </View>

              {eraSegments.length ? (
                <View className="mt-5">
                  <Text className="mb-2 text-12 font-sans-medium text-white/70">Era breakdown</Text>
                  <ProportionalBars segments={eraSegments} />
                </View>
              ) : null}
            </GlassCard>
          </MotiView>

          <MotiView {...staggerChild(1)}>
            <GlassCard padding="lg" rounded="2xl">
              <View className="mb-4 flex-row items-center gap-2">
                <Music2 size={14} color={colors.echoGreen} />
                <Text className="text-11 uppercase tracking-widest2 text-white/35">Genre breakdown</Text>
              </View>
              <GenreBarList genres={data.analysisResult.genreProfile.nodes} />
            </GlassCard>
          </MotiView>

          <MotiView {...staggerChild(2)}>
            <Text className="mb-3 text-11 font-sans-semibold uppercase tracking-widest2 text-white/30">
              Quick facts
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
              <GlassCard padding="md" rounded="2xl" style={{ width: 240 }}>
                <View className="flex-row items-center gap-2">
                  <Gem size={14} color={colors.accentPurple} />
                  <Text className="text-11 uppercase tracking-widest2 text-white/35">Hidden gem</Text>
                </View>
                {data.hiddenGem ? (
                  <View className="mt-2">
                    <ListRow
                      imageUrl={data.hiddenGem.albumImageUrl}
                      title={data.hiddenGem.trackName}
                      subtitle={data.hiddenGem.artistName}
                      trailing={<Text className="text-12 text-white/40">{data.hiddenGem.plays}×</Text>}
                    />
                  </View>
                ) : (
                  <Text className="mt-2 text-13 text-white/40">Keep listening to surface one.</Text>
                )}
              </GlassCard>

              <GlassCard padding="md" rounded="2xl" style={{ width: 220 }}>
                <View className="flex-row items-center gap-2">
                  <Shuffle size={14} color={colors.accentBlue} />
                  <Text className="text-11 uppercase tracking-widest2 text-white/35">Genre drift</Text>
                </View>
                <Text className="mt-2 text-14 text-white/85">
                  {data.genreDrift.drifted
                    ? `${data.genreDrift.from ?? "Unknown"} → ${data.genreDrift.to ?? "Unknown"}`
                    : "Your taste has stayed steady this month."}
                </Text>
              </GlassCard>

              <GlassCard padding="md" rounded="2xl" style={{ width: 220 }}>
                <View className="flex-row items-center gap-2">
                  <CalendarDays size={14} color={colors.accentAmber} />
                  <Text className="text-11 uppercase tracking-widest2 text-white/35">Favorite decade</Text>
                </View>
                {data.favoriteDecade.bars.some((bar) => bar.count > 0) ? (
                  <>
                    <Text className="mt-2 text-14 text-white/85">
                      {data.favoriteDecade.topDecade} · {Math.round(data.favoriteDecade.topPct)}%
                    </Text>
                    <View className="mt-3 flex-row items-end gap-1.5" style={{ height: 44 }}>
                      {data.favoriteDecade.bars.map((bar) => (
                        <View key={bar.decade} className="flex-1 items-center">
                          <View
                            className="w-full rounded-t-md"
                            style={{
                              height: Math.max(4, (bar.heightPct / 100) * 32),
                              backgroundColor: bar.isTop ? colors.echoGreen : alpha.white(0.15),
                            }}
                          />
                          <Text className="mt-1 text-9 text-white/35">{bar.label}</Text>
                        </View>
                      ))}
                    </View>
                  </>
                ) : (
                  <Text className="mt-2 text-13 text-white/40">Not enough decade data yet.</Text>
                )}
              </GlassCard>

              <GlassCard padding="md" rounded="2xl" style={{ width: 240 }}>
                <View className="flex-row items-center gap-2">
                  <Heart size={14} color={colors.accentRed} />
                  <Text className="text-11 uppercase tracking-widest2 text-white/35">First song</Text>
                </View>
                {data.firstSong ? (
                  <View className="mt-2">
                    <ListRow
                      imageUrl={data.firstSong.albumImageUrl}
                      title={data.firstSong.trackName}
                      subtitle={data.firstSong.artistName}
                      trailing={<Text className="text-12 text-white/40">{formatDate(data.firstSong.ts)}</Text>}
                    />
                  </View>
                ) : (
                  <Text className="mt-2 text-13 text-white/40">No history found yet.</Text>
                )}
              </GlassCard>
            </ScrollView>
          </MotiView>
        </View>
      ) : null}
    </ScreenScroll>
  );
}

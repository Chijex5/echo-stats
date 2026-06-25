import { ScrollView, View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { MotiView } from "moti";
import { Gem, Shuffle, Flame, Compass, Sparkles, Disc3 } from "lucide-react-native";
import { GlassCard, SectionHeading, ListRow, Shimmer, StatTile } from "@/components/ui";
import { Sparkline, ProportionalBars } from "@/components/charts";
import { NowPlayingPill } from "@/components/dashboard/NowPlayingPill";
import { ExploreCTACard } from "@/components/dashboard/ExploreCTACard";
import { RediscoveryCardView } from "@/components/dashboard/RediscoveryCardView";
import { staggerChild } from "@/lib/motion/presets";
import { colors } from "@/lib/theme/tokens";
import { resolveColor } from "@/lib/theme/colorMap";
import {
  useDashboardStats,
  useNowPlayingPolling,
  useInsights,
  useTopTracks,
  useTopArtists,
  useRediscovery,
} from "@/lib/api/hooks";

const ERA_ORDER = ["pre-70s", "70s", "80s", "90s", "2000s", "2010s", "2020s+"];

function formatMonthYear(value: string | null) {
  if (!value) return "Unknown";
  return new Intl.DateTimeFormat("en", { month: "short", year: "numeric" }).format(new Date(value));
}


export default function OverviewScreen() {
  const router = useRouter();
  const stats = useDashboardStats();
  const nowPlaying = useNowPlayingPolling();
  const insights = useInsights();
  const topTracks = useTopTracks(4);
  const topArtists = useTopArtists(4);
  const rediscovery = useRediscovery();

  const eraSparkline = insights.data
    ? ERA_ORDER.map(
        (era) => insights.data!.analysisResult.musicAge.eraBreakdown[era]?.percentage ?? 0
      )
    : [];

  const emotional = insights.data?.emotionalProfile;
  const personalitySegments = emotional
    ? [
        { label: "Calm", pct: emotional.calm, color: resolveColor("blue-400") },
        { label: "Neutral", pct: emotional.neutral, color: resolveColor("violet-400") },
        { label: "Energetic", pct: emotional.energetic, color: colors.echoGreen },
        { label: "Intense", pct: emotional.intense, color: resolveColor("red-400") },
      ]
    : [];

  return (
    <ScrollView
      contentContainerStyle={{
        paddingHorizontal: 20,
        paddingTop: 72,
        paddingBottom: 140,
        backgroundColor: colors.background,
        gap: 24,
      }}
    >
      {/* Header */}
      <MotiView {...staggerChild(0)}>
        <SectionHeading label="Welcome back" title="Your listening" accentWord="pulse" />
        {nowPlaying.data && (
          <View style={{ marginTop: 14 }}>
            <NowPlayingPill
              nowPlaying={nowPlaying.data.nowPlaying}
              lastPlayed={nowPlaying.data.lastPlayed}
            />
          </View>
        )}
      </MotiView>

      {/* Stat tiles — 3-column wrap, fixed width per tile */}
      <MotiView {...staggerChild(1)}>
        {stats.isLoading ? (
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
            {Array.from({ length: 7 }).map((_, i) => (
              <Shimmer key={i} width={100} height={56} rounded="xl" />
            ))}
          </View>
        ) : stats.data ? (
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
            <StatTile label="Total plays" value={stats.data.totalPlays.toLocaleString()} />
            <StatTile
              label="Hours listened"
              value={stats.data.totalHours.toLocaleString()}
              accentColor={colors.echoGreen}
            />
            <StatTile label="Unique tracks" value={stats.data.uniqueTrackCount.toLocaleString()} />
            <StatTile label="Unique artists" value={stats.data.uniqueArtistCount.toLocaleString()} />
            <StatTile
              label="Day streak"
              value={stats.data.streak.toLocaleString()}
              accentColor={resolveColor("violet-400")}
            />
            <StatTile
              label="Night listening"
              value={`${stats.data.nightPct}%`}
              accentColor={resolveColor("blue-400")}
            />
            <StatTile label="First play" value={formatMonthYear(stats.data.firstPlay)} />
          </View>
        ) : null}
      </MotiView>

      {/* Music age + listening personality */}
      <MotiView {...staggerChild(2)}>
        <GlassCard padding="lg" rounded="2xl">
          <Text
            style={{
              fontSize: 10,
              color: "rgba(255,255,255,0.35)",
              textTransform: "uppercase",
              letterSpacing: 1.4,
              marginBottom: 8,
            }}
          >
            Music age
          </Text>
          {insights.isLoading ? (
            <Shimmer width="100%" height={80} rounded="lg" />
          ) : insights.data ? (
            <>
              <View style={{ flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between" }}>
                <Text style={{ fontSize: 28, fontStyle: "italic", color: "#ffffff", fontWeight: "300" }}>
                  {insights.data.analysisResult.musicAge.avgTrackAgeYears.toFixed(1)} yrs
                </Text>
                <Sparkline data={eraSparkline} width={120} height={40} />
              </View>
              <Text style={{ marginTop: 4, fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
                Average age of the music you play
              </Text>
              {personalitySegments.length > 0 && (
                <View style={{ marginTop: 18 }}>
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "500",
                      color: "rgba(255,255,255,0.7)",
                      marginBottom: 8,
                    }}
                  >
                    Listening personality
                  </Text>
                  <ProportionalBars segments={personalitySegments} />
                </View>
              )}
            </>
          ) : null}
        </GlassCard>
      </MotiView>

      {/* Top tracks */}
      <MotiView {...staggerChild(3)}>
        <SectionHeading label="On repeat" title="Top tracks" align="left" />
        <View style={{ marginTop: 12 }}>
          {topTracks.isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <Shimmer key={i} width="100%" height={56} style={{ marginBottom: 8 }} />
              ))
            : topTracks.data?.tracks.slice(0, 4).map((track) => (
                <ListRow
                  key={track.uri}
                  imageUrl={track.albumImageUrl}
                  title={track.trackName}
                  subtitle={track.artistName}
                  trailing={
                    <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
                      {track.playCount}×
                    </Text>
                  }
                />
              ))}
        </View>
      </MotiView>

      {/* Top artists */}
      <MotiView {...staggerChild(4)}>
        <SectionHeading label="Most played" title="Top artists" align="left" />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginTop: 12 }}
          contentContainerStyle={{ gap: 12 }}
        >
          {topArtists.isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <Shimmer key={i} width={140} height={120} rounded="xl" />
              ))
            : topArtists.data?.artists.slice(0, 4).map((artist) => (
                <GlassCard key={artist.name} padding="sm" rounded="xl" style={{ width: 140 }}>
                  <Text
                    numberOfLines={1}
                    style={{ fontSize: 13, fontWeight: "600", color: "#ffffff" }}
                  >
                    {artist.name}
                  </Text>
                  <Text style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 8 }}>
                    {artist.plays} plays
                  </Text>
                  <Sparkline
                    data={artist.sparkline.map((p) => p.v)}
                    width={110}
                    height={28}
                    color={resolveColor(artist.color)}
                  />
                </GlassCard>
              ))}
        </ScrollView>
      </MotiView>

      {/* Insights */}
      <MotiView {...staggerChild(5)}>
        <SectionHeading label="Discoveries" title="Insights" align="left" />
        <View style={{ marginTop: 12, gap: 10 }}>
          {insights.isLoading ? (
            <Shimmer width="100%" height={140} rounded="xl" />
          ) : insights.data ? (
            <>
              {/* Hidden gem */}
              <GlassCard padding="md" rounded="2xl">
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 8 }}>
                  <Gem size={14} color={resolveColor("violet-400")} />
                  <Text
                    style={{
                      fontSize: 10,
                      color: "rgba(255,255,255,0.35)",
                      textTransform: "uppercase",
                      letterSpacing: 1.4,
                    }}
                  >
                    Hidden gem
                  </Text>
                </View>
                {insights.data.hiddenGem ? (
                  <ListRow
                    imageUrl={insights.data.hiddenGem.albumImageUrl}
                    title={insights.data.hiddenGem.trackName}
                    subtitle={insights.data.hiddenGem.artistName}
                    trailing={
                      <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
                        {insights.data.hiddenGem.plays}×
                      </Text>
                    }
                  />
                ) : (
                  <Text style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>
                    Keep listening to surface one.
                  </Text>
                )}
              </GlassCard>

              {/* Genre drift */}
              <GlassCard padding="md" rounded="2xl">
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 8 }}>
                  <Shuffle size={14} color={resolveColor("blue-400")} />
                  <Text
                    style={{
                      fontSize: 10,
                      color: "rgba(255,255,255,0.35)",
                      textTransform: "uppercase",
                      letterSpacing: 1.4,
                    }}
                  >
                    Genre drift
                  </Text>
                </View>
                <Text style={{ fontSize: 14, color: "rgba(255,255,255,0.85)" }}>
                  {insights.data.genreDrift.drifted
                    ? `${insights.data.genreDrift.from ?? "Unknown"} → ${insights.data.genreDrift.to ?? "Unknown"}`
                    : "Your taste has stayed steady this month."}
                </Text>
              </GlassCard>

              {/* Longest streak */}
              <GlassCard padding="md" rounded="2xl">
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 8 }}>
                  <Flame size={14} color={resolveColor("red-400")} />
                  <Text
                    style={{
                      fontSize: 10,
                      color: "rgba(255,255,255,0.35)",
                      textTransform: "uppercase",
                      letterSpacing: 1.4,
                    }}
                  >
                    Longest streak
                  </Text>
                </View>
                {insights.data.longestStreak ? (
                  <ListRow
                    imageUrl={insights.data.longestStreak.albumImageUrl}
                    title={insights.data.longestStreak.trackName}
                    subtitle={insights.data.longestStreak.artistName}
                    trailing={
                      <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
                        {insights.data.longestStreak.days}d
                      </Text>
                    }
                  />
                ) : (
                  <Text style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>No streak yet.</Text>
                )}
              </GlassCard>
            </>
          ) : null}
        </View>
      </MotiView>

      {/* Rediscovery */}
      <MotiView {...staggerChild(6)}>
        <SectionHeading label="Rediscover" title="Forgotten favorites" align="left" />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginTop: 12 }}
          contentContainerStyle={{ gap: 12 }}
        >
          {rediscovery.isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <Shimmer key={i} width={160} height={120} rounded="xl" />
              ))
            : rediscovery.data?.cards.map((card) => (
                <RediscoveryCardView key={card.key} card={card} />
              ))}
        </ScrollView>
      </MotiView>

      {/* Explore CTAs */}
      <MotiView {...staggerChild(7)} style={{ gap: 10 }}>
        <ExploreCTACard
          title="Explore your timeline"
          subtitle="Scrub through every era of your listening history"
          icon={Compass}
          onPress={() => router.push("/(tabs)/timeline")}
        />
        <ExploreCTACard
          title="Relive your story"
          subtitle="A cinematic recap of your year in music"
          icon={Sparkles}
          onPress={() => router.push("/(tabs)/story")}
        />
        <ExploreCTACard
          title="Song of the day"
          subtitle="A forgotten favourite, resurfaced just for today"
          icon={Disc3}
          onPress={() => router.push("/(tabs)/song-of-the-day")}
        />
      </MotiView>
    </ScrollView>
  );
}
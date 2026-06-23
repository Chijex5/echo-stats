import { ScrollView, View, Text } from "react-native";
import { useRouter } from "expo-router";
import { MotiView } from "moti";
import { Gem, Shuffle, Flame, Compass, Sparkles } from "lucide-react-native";
import { GlassCard, SectionHeading, StatTile, ListRow, Shimmer } from "@/components/ui";
import { Sparkline, ProportionalBars } from "@/components/charts";
import { NowPlayingPill } from "@/components/dashboard/NowPlayingPill";
import { ExploreCTACard } from "@/components/dashboard/ExploreCTACard";
import { RediscoveryCardView } from "@/components/dashboard/RediscoveryCardView";
import { staggerChild } from "@/lib/motion/presets";
import { colors } from "@/lib/theme/tokens";
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
    ? ERA_ORDER.map((era) => insights.data!.analysisResult.musicAge.eraBreakdown[era]?.percentage ?? 0)
    : [];

  const emotional = insights.data?.emotionalProfile;
  const personalitySegments = emotional
    ? [
        { label: "Calm", pct: emotional.calm, color: "#60a5fa" },
        { label: "Neutral", pct: emotional.neutral, color: "#a78bfa" },
        { label: "Energetic", pct: emotional.energetic, color: colors.echoGreen },
        { label: "Intense", pct: emotional.intense, color: "#f87171" },
      ]
    : [];

  return (
    <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 72, paddingBottom: 140 }}>
      <MotiView {...staggerChild(0)} className="mb-5">
        <SectionHeading label="Welcome back" title="Your listening" accentWord="pulse" />
        {nowPlaying.data ? (
          <View className="mt-4">
            <NowPlayingPill nowPlaying={nowPlaying.data.nowPlaying} lastPlayed={nowPlaying.data.lastPlayed} />
          </View>
        ) : null}
      </MotiView>

      <MotiView {...staggerChild(1)} className="mb-5 flex-row flex-wrap gap-3">
        {stats.isLoading ? (
          Array.from({ length: 7 }).map((_, i) => <Shimmer key={i} width={100} height={56} rounded="xl" />)
        ) : stats.data ? (
          <>
            <StatTile label="Total plays" value={stats.data.totalPlays.toLocaleString()} />
            <StatTile label="Hours listened" value={stats.data.totalHours.toLocaleString()} accentColor="#1DB954" />
            <StatTile label="Unique tracks" value={stats.data.uniqueTrackCount.toLocaleString()} />
            <StatTile label="Unique artists" value={stats.data.uniqueArtistCount.toLocaleString()} />
            <StatTile label="Day streak" value={stats.data.streak.toLocaleString()} accentColor="#a78bfa" />
            <StatTile label="Night listening" value={`${stats.data.nightPct}%`} accentColor="#60a5fa" />
            <StatTile label="First play" value={formatMonthYear(stats.data.firstPlay)} />
          </>
        ) : null}
      </MotiView>

      <MotiView {...staggerChild(2)} className="mb-5">
        <GlassCard padding="lg" rounded="2xl">
          <Text className="mb-1 text-[10px] uppercase tracking-widest2 text-white/35">Music age</Text>
          {insights.isLoading ? (
            <Shimmer width="100%" height={80} rounded="lg" />
          ) : insights.data ? (
            <>
              <View className="flex-row items-baseline justify-between">
                <Text className="text-2xl font-serif italic text-white">
                  {insights.data.analysisResult.musicAge.avgTrackAgeYears.toFixed(1)} yrs
                </Text>
                <Sparkline data={eraSparkline} width={120} height={40} />
              </View>
              <Text className="mt-1 text-[12px] text-white/45">Average age of the music you play</Text>
              {personalitySegments.length ? (
                <View className="mt-5">
                  <Text className="mb-2 text-[12px] font-sans-medium text-white/70">Listening personality</Text>
                  <ProportionalBars segments={personalitySegments} />
                </View>
              ) : null}
            </>
          ) : null}
        </GlassCard>
      </MotiView>

      <MotiView {...staggerChild(3)} className="mb-5">
        <SectionHeading label="On repeat" title="Top tracks" align="left" />
        <View className="mt-3">
          {topTracks.isLoading ? (
            Array.from({ length: 4 }).map((_, i) => <Shimmer key={i} width="100%" height={56} className="mb-2" />)
          ) : topTracks.data ? (
            topTracks.data.tracks.slice(0, 4).map((track) => (
              <ListRow
                key={track.uri}
                imageUrl={track.albumImageUrl}
                title={track.trackName}
                subtitle={track.artistName}
                trailing={<Text className="text-[12px] text-white/40">{track.playCount}×</Text>}
              />
            ))
          ) : null}
        </View>
      </MotiView>

      <MotiView {...staggerChild(4)} className="mb-5">
        <SectionHeading label="Most played" title="Top artists" align="left" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-3" contentContainerStyle={{ gap: 12 }}>
          {topArtists.isLoading
            ? Array.from({ length: 4 }).map((_, i) => <Shimmer key={i} width={140} height={120} rounded="xl" />)
            : topArtists.data?.artists.slice(0, 4).map((artist) => (
                <GlassCard key={artist.name} padding="sm" rounded="xl" style={{ width: 140 }}>
                  <Text numberOfLines={1} className="text-[13px] font-sans-semibold text-white">
                    {artist.name}
                  </Text>
                  <Text className="mb-2 text-[11px] text-white/45">{artist.plays} plays</Text>
                  <Sparkline data={artist.sparkline.map((p) => p.v)} width={110} height={28} color={artist.color} />
                </GlassCard>
              ))}
        </ScrollView>
      </MotiView>

      <MotiView {...staggerChild(5)} className="mb-5 gap-3">
        <SectionHeading label="Discoveries" title="Insights" align="left" />

        {insights.isLoading ? (
          <Shimmer width="100%" height={140} rounded="xl" />
        ) : insights.data ? (
          <>
            <GlassCard padding="md" rounded="2xl">
              <View className="flex-row items-center gap-2">
                <Gem size={14} color="#a78bfa" />
                <Text className="text-[11px] uppercase tracking-widest2 text-white/35">Hidden gem</Text>
              </View>
              {insights.data.hiddenGem ? (
                <View className="mt-2">
                  <ListRow
                    imageUrl={insights.data.hiddenGem.albumImageUrl}
                    title={insights.data.hiddenGem.trackName}
                    subtitle={insights.data.hiddenGem.artistName}
                    trailing={<Text className="text-[12px] text-white/40">{insights.data.hiddenGem.plays}×</Text>}
                  />
                </View>
              ) : (
                <Text className="mt-2 text-[13px] text-white/40">Keep listening to surface one.</Text>
              )}
            </GlassCard>

            <GlassCard padding="md" rounded="2xl">
              <View className="flex-row items-center gap-2">
                <Shuffle size={14} color="#60a5fa" />
                <Text className="text-[11px] uppercase tracking-widest2 text-white/35">Genre drift</Text>
              </View>
              <Text className="mt-2 text-[14px] text-white/85">
                {insights.data.genreDrift.drifted
                  ? `${insights.data.genreDrift.from ?? "Unknown"} → ${insights.data.genreDrift.to ?? "Unknown"}`
                  : "Your taste has stayed steady this month."}
              </Text>
            </GlassCard>

            <GlassCard padding="md" rounded="2xl">
              <View className="flex-row items-center gap-2">
                <Flame size={14} color="#f87171" />
                <Text className="text-[11px] uppercase tracking-widest2 text-white/35">Longest streak</Text>
              </View>
              {insights.data.longestStreak ? (
                <View className="mt-2">
                  <ListRow
                    imageUrl={insights.data.longestStreak.albumImageUrl}
                    title={insights.data.longestStreak.trackName}
                    subtitle={insights.data.longestStreak.artistName}
                    trailing={<Text className="text-[12px] text-white/40">{insights.data.longestStreak.days}d</Text>}
                  />
                </View>
              ) : (
                <Text className="mt-2 text-[13px] text-white/40">No streak yet.</Text>
              )}
            </GlassCard>
          </>
        ) : null}
      </MotiView>

      <MotiView {...staggerChild(6)} className="mb-5">
        <SectionHeading label="Rediscover" title="Forgotten favorites" align="left" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-3" contentContainerStyle={{ gap: 12 }}>
          {rediscovery.isLoading
            ? Array.from({ length: 4 }).map((_, i) => <Shimmer key={i} width={160} height={120} rounded="xl" />)
            : rediscovery.data?.cards.map((card) => <RediscoveryCardView key={card.key} card={card} />)}
        </ScrollView>
      </MotiView>

      <MotiView {...staggerChild(7)} className="gap-3">
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
      </MotiView>
    </ScrollView>
  );
}

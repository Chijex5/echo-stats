import { ScrollView, View, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { MotiView } from "moti";
import { Gem, Shuffle, Flame, Sparkles, Disc3 } from "lucide-react-native";
import { GlassCard, SectionHeading, StatTile, ListRow, Shimmer, ScreenScroll } from "@/components/ui";
import { Sparkline, ProportionalBars } from "@/components/charts";
import { NowPlayingPill } from "@/components/dashboard/NowPlayingPill";
import { ExploreCTACard } from "@/components/dashboard/ExploreCTACard";
import { RediscoveryCardView } from "@/components/dashboard/RediscoveryCardView";
import { staggerChild } from "@/lib/motion/presets";
import { colors, alpha, fontSize, trackingWidest2 } from "@/lib/theme/tokens";
import { colorForKey } from "@/lib/theme/gradients";
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
        { label: "Calm", pct: emotional.calm, color: colors.accentBlue },
        { label: "Neutral", pct: emotional.neutral, color: colors.accentPurple },
        { label: "Energetic", pct: emotional.energetic, color: colors.echoGreen },
        { label: "Intense", pct: emotional.intense, color: colors.accentRed },
      ]
    : [];

  return (
    <ScreenScroll>
      <MotiView {...staggerChild(0)} style={styles.section}>
        <SectionHeading label="Welcome back" title="Your listening" accentWord="pulse" />
        {nowPlaying.data ? (
          <View style={{ marginTop: 16 }}>
            <NowPlayingPill nowPlaying={nowPlaying.data.nowPlaying} lastPlayed={nowPlaying.data.lastPlayed} />
          </View>
        ) : null}
      </MotiView>

      <MotiView {...staggerChild(1)} style={styles.section}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
          {stats.isLoading ? (
            Array.from({ length: 7 }).map((_, i) => <Shimmer key={i} width={104} height={64} rounded="xl" />)
          ) : stats.data ? (
            <>
              <StatTile width={104} label="Total plays" value={stats.data.totalPlays.toLocaleString()} />
              <StatTile width={104} label="Hours listened" value={stats.data.totalHours.toLocaleString()} accentColor={colors.spotify} />
              <StatTile width={104} label="Unique tracks" value={stats.data.uniqueTrackCount.toLocaleString()} />
              <StatTile width={104} label="Unique artists" value={stats.data.uniqueArtistCount.toLocaleString()} />
              <StatTile width={104} label="Day streak" value={stats.data.streak.toLocaleString()} accentColor={colors.accentPurple} />
              <StatTile width={104} label="Night listening" value={`${stats.data.nightPct}%`} accentColor={colors.accentBlue} />
              <StatTile width={104} label="First play" value={formatMonthYear(stats.data.firstPlay)} />
            </>
          ) : null}
        </ScrollView>
      </MotiView>

      <MotiView {...staggerChild(2)} style={styles.section}>
        <GlassCard padding="lg" rounded="2xl">
          <Text style={styles.eyebrow}>Music age</Text>
          {insights.isLoading ? (
            <Shimmer width="100%" height={80} rounded="lg" />
          ) : insights.data ? (
            <>
              <View style={styles.ageRow}>
                <Text style={styles.ageValue}>{insights.data.analysisResult.musicAge.avgTrackAgeYears.toFixed(1)} yrs</Text>
                <Sparkline data={eraSparkline} width={120} height={40} />
              </View>
              <Text style={styles.ageCaption}>Average age of the music you play</Text>
              {personalitySegments.length ? (
                <View style={{ marginTop: 20 }}>
                  <Text style={styles.personalityLabel}>Listening personality</Text>
                  <ProportionalBars segments={personalitySegments} />
                </View>
              ) : null}
            </>
          ) : null}
        </GlassCard>
      </MotiView>

      <MotiView {...staggerChild(3)} style={styles.section}>
        <SectionHeading label="On repeat" title="Top tracks" align="left" />
        <View style={{ marginTop: 12 }}>
          {topTracks.isLoading ? (
            Array.from({ length: 4 }).map((_, i) => <Shimmer key={i} width="100%" height={56} style={{ marginBottom: 8 }} />)
          ) : topTracks.data ? (
            topTracks.data.tracks.slice(0, 4).map((track) => (
              <ListRow
                key={track.uri}
                imageUrl={track.albumImageUrl}
                title={track.trackName}
                subtitle={track.artistName}
                trailing={<Text style={styles.trailingCount}>{track.playCount}×</Text>}
              />
            ))
          ) : null}
        </View>
      </MotiView>

      <MotiView {...staggerChild(4)} style={styles.section}>
        <SectionHeading label="Most played" title="Top artists" align="left" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12 }} contentContainerStyle={{ gap: 12 }}>
          {topArtists.isLoading
            ? Array.from({ length: 4 }).map((_, i) => <Shimmer key={i} width={140} height={120} rounded="xl" />)
            : topArtists.data?.artists.slice(0, 4).map((artist) => (
                <GlassCard key={artist.name} padding="sm" rounded="xl" style={{ width: 140 }}>
                  <Text numberOfLines={1} style={styles.artistName}>
                    {artist.name}
                  </Text>
                  <Text style={styles.artistPlays}>{artist.plays} plays</Text>
                  <Sparkline data={artist.sparkline.map((p) => p.v)} width={110} height={28} color={colorForKey(artist.name)} />
                </GlassCard>
              ))}
        </ScrollView>
      </MotiView>

      <MotiView {...staggerChild(5)} style={styles.section}>
        <SectionHeading label="Discoveries" title="Insights" align="left" />
        {insights.isLoading ? (
          <Shimmer width="100%" height={140} rounded="xl" style={{ marginTop: 12 }} />
        ) : insights.data ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12 }} contentContainerStyle={{ gap: 12 }}>
            <GlassCard padding="md" rounded="2xl" style={{ width: 220 }}>
              <View style={styles.cardHeader}>
                <Gem size={14} color={colors.accentPurple} />
                <Text style={styles.cardHeaderLabel}>Hidden gem</Text>
              </View>
              {insights.data.hiddenGem ? (
                <View style={{ marginTop: 8 }}>
                  <ListRow
                    imageUrl={insights.data.hiddenGem.albumImageUrl}
                    title={insights.data.hiddenGem.trackName}
                    subtitle={insights.data.hiddenGem.artistName}
                    trailing={<Text style={styles.trailingCount}>{insights.data.hiddenGem.plays}×</Text>}
                  />
                </View>
              ) : (
                <Text style={styles.emptyText}>Keep listening to surface one.</Text>
              )}
            </GlassCard>

            <GlassCard padding="md" rounded="2xl" style={{ width: 200 }}>
              <View style={styles.cardHeader}>
                <Shuffle size={14} color={colors.accentBlue} />
                <Text style={styles.cardHeaderLabel}>Genre drift</Text>
              </View>
              <Text style={styles.driftText}>
                {insights.data.genreDrift.drifted
                  ? `${insights.data.genreDrift.from ?? "Unknown"} → ${insights.data.genreDrift.to ?? "Unknown"}`
                  : "Your taste has stayed steady this month."}
              </Text>
            </GlassCard>

            <GlassCard padding="md" rounded="2xl" style={{ width: 220 }}>
              <View style={styles.cardHeader}>
                <Flame size={14} color={colors.accentRed} />
                <Text style={styles.cardHeaderLabel}>Longest streak</Text>
              </View>
              {insights.data.longestStreak ? (
                <View style={{ marginTop: 8 }}>
                  <ListRow
                    imageUrl={insights.data.longestStreak.albumImageUrl}
                    title={insights.data.longestStreak.trackName}
                    subtitle={insights.data.longestStreak.artistName}
                    trailing={<Text style={styles.trailingCount}>{insights.data.longestStreak.days}d</Text>}
                  />
                </View>
              ) : (
                <Text style={styles.emptyText}>No streak yet.</Text>
              )}
            </GlassCard>
          </ScrollView>
        ) : null}
      </MotiView>

      <MotiView {...staggerChild(6)} style={styles.section}>
        <SectionHeading label="Rediscover" title="Forgotten favorites" align="left" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12 }} contentContainerStyle={{ gap: 12 }}>
          {rediscovery.isLoading
            ? Array.from({ length: 4 }).map((_, i) => <Shimmer key={i} width={160} height={120} rounded="xl" />)
            : rediscovery.data?.cards.map((card) => <RediscoveryCardView key={card.key} card={card} />)}
        </ScrollView>
      </MotiView>

      <MotiView {...staggerChild(7)} style={{ gap: 12 }}>
        <ExploreCTACard
          title="Relive your story"
          subtitle="A cinematic recap of your year in music"
          icon={Sparkles}
          onPress={() => router.push("/(tabs)/story")}
        />
        <ExploreCTACard
          title="Song of the day"
          subtitle="A forgotten favorite, resurfaced just for today"
          icon={Disc3}
          onPress={() => router.push("/(tabs)/song-of-the-day")}
        />
      </MotiView>
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: 20 },
  eyebrow: {
    marginBottom: 4,
    fontSize: fontSize[10],
    textTransform: "uppercase",
    letterSpacing: trackingWidest2(fontSize[10]),
    color: alpha.white(0.35),
  },
  ageRow: { flexDirection: "row", alignItems: "baseline", justifyContent: "space-between" },
  ageValue: { fontSize: fontSize[24], fontFamily: "PlayfairDisplayItalic", fontStyle: "italic", color: colors.white },
  ageCaption: { marginTop: 4, fontSize: fontSize[12], color: alpha.white(0.45) },
  personalityLabel: { marginBottom: 8, fontSize: fontSize[12], fontFamily: "GeistSansMedium", color: alpha.white(0.7) },
  trailingCount: { fontSize: fontSize[12], color: alpha.white(0.4) },
  artistName: { fontSize: fontSize[13], fontFamily: "GeistSansSemiBold", color: colors.white },
  artistPlays: { marginBottom: 8, fontSize: fontSize[11], color: alpha.white(0.45) },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  cardHeaderLabel: {
    fontSize: fontSize[11],
    textTransform: "uppercase",
    letterSpacing: trackingWidest2(fontSize[11]),
    color: alpha.white(0.35),
  },
  emptyText: { marginTop: 8, fontSize: fontSize[13], color: alpha.white(0.4) },
  driftText: { marginTop: 8, fontSize: fontSize[14], color: alpha.white(0.85) },
});

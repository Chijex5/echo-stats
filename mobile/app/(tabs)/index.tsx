import { ScrollView, View, Text, Image, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { MotiView } from "moti";
import {
  Play,
  Clock3,
  Music2,
  Users,
  Moon,
  CalendarDays,
  Gem,
  Shuffle,
  Flame,
  Sparkles,
  Disc3,
  ChevronRight,
  type LucideIcon,
} from "lucide-react-native";
import { GlassCard, ListRow, Shimmer, ScreenScroll } from "@/components/ui";
import { Sparkline, ProportionalBars } from "@/components/charts";
import { NowPlayingHero } from "@/components/dashboard/NowPlayingHero";
import { ArtistAvatar } from "@/components/dashboard/ArtistAvatar";
import { ProfileHeaderButton } from "@/components/dashboard/ProfileHeaderButton";
import { ExploreCTACard } from "@/components/dashboard/ExploreCTACard";
import { RediscoveryCardView } from "@/components/dashboard/RediscoveryCardView";
import { staggerChild } from "@/lib/motion/presets";
import { colors, alpha, fontSize, trackingWidest2 } from "@/lib/theme/tokens";
import {
  useDashboardStats,
  useNowPlayingPolling,
  useInsights,
  useTopTracks,
  useTopArtists,
  useRediscovery,
  useRecentlyPlayed,
} from "@/lib/api/hooks";

const ERA_ORDER = ["pre-70s", "70s", "80s", "90s", "2000s", "2010s", "2020s+"];

function formatMonthYear(value: string | null) {
  if (!value) return "Unknown";
  return new Intl.DateTimeFormat("en", { month: "short", year: "numeric" }).format(new Date(value));
}

function timeGreeting() {
  const h = new Date().getHours();
  if (h < 5) return "Still up";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  if (h < 22) return "Good evening";
  return "Late night";
}

function timeAgo(value: string) {
  const mins = Math.floor((Date.now() - new Date(value).getTime()) / 60_000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return days < 7 ? `${days}d ago` : `${Math.floor(days / 7)}w ago`;
}

function FeedHeader({ title, onSeeAll }: { title: string; onSeeAll?: () => void }) {
  return (
    <View style={styles.feedHeader}>
      <Text style={styles.feedTitle}>{title}</Text>
      {onSeeAll ? (
        <Pressable onPress={onSeeAll} hitSlop={8} style={styles.seeAll}>
          <Text style={styles.seeAllText}>See all</Text>
          <ChevronRight size={14} color={alpha.white(0.4)} />
        </Pressable>
      ) : null}
    </View>
  );
}

function ShortcutTile({ imageUrl, title, onPress }: { imageUrl: string | null; title: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.shortcut}>
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.shortcutImg} />
      ) : (
        <View style={[styles.shortcutImg, styles.shortcutFallback]}>
          <Music2 size={18} color={alpha.white(0.5)} />
        </View>
      )}
      <Text numberOfLines={2} style={styles.shortcutText}>
        {title}
      </Text>
    </Pressable>
  );
}

function StatChip({ icon: Icon, value, label, accent }: { icon: LucideIcon; value: string; label: string; accent: string }) {
  return (
    <View style={styles.statChip}>
      <View style={[styles.statIcon, { backgroundColor: alpha.hex(accent, 0.12) }]}>
        <Icon size={14} color={accent} />
      </View>
      <Text numberOfLines={1} style={styles.statValue}>
        {value}
      </Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export default function OverviewScreen() {
  const router = useRouter();
  const stats = useDashboardStats();
  const nowPlaying = useNowPlayingPolling();
  const insights = useInsights();
  const topTracks = useTopTracks(4);
  const topArtists = useTopArtists(6);
  const rediscovery = useRediscovery();
  const recentlyPlayed = useRecentlyPlayed(12);

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

  const statItems = stats.data
    ? [
        { icon: Play, label: "Total plays", value: stats.data.totalPlays.toLocaleString(), accent: colors.echoGreen },
        { icon: Clock3, label: "Hours", value: stats.data.totalHours.toLocaleString(), accent: colors.spotify },
        { icon: Music2, label: "Tracks", value: stats.data.uniqueTrackCount.toLocaleString(), accent: colors.accentBlue },
        { icon: Users, label: "Artists", value: stats.data.uniqueArtistCount.toLocaleString(), accent: colors.accentPurple },
        { icon: Flame, label: "Day streak", value: stats.data.streak.toLocaleString(), accent: colors.accentAmber },
        { icon: Moon, label: "Night", value: `${stats.data.nightPct}%`, accent: colors.accentCyan },
        { icon: CalendarDays, label: "First play", value: formatMonthYear(stats.data.firstPlay), accent: colors.accentRose },
      ]
    : [];

  return (
    <ScreenScroll style={{ backgroundColor: colors.background }}>
      <MotiView {...staggerChild(0)} style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.greeting}>{timeGreeting()}</Text>
          <Text style={styles.headerSub}>
            Here&apos;s your <Text style={styles.headerSubAccent}>pulse</Text> today
          </Text>
        </View>
        <ProfileHeaderButton />
      </MotiView>

      {nowPlaying.data ? (
        <MotiView {...staggerChild(1)} style={styles.section}>
          <NowPlayingHero nowPlaying={nowPlaying.data.nowPlaying} lastPlayed={nowPlaying.data.lastPlayed} />
        </MotiView>
      ) : null}

      {recentlyPlayed.isLoading || recentlyPlayed.data?.tracks.length ? (
        <MotiView {...staggerChild(2)} style={styles.section}>
          <FeedHeader title="Recently played" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
            {recentlyPlayed.isLoading
              ? Array.from({ length: 4 }).map((_, i) => <Shimmer key={i} width={104} height={150} rounded="lg" />)
              : recentlyPlayed.data?.tracks.map((play, i) => (
                  <View key={`${play.ts}-${i}`} style={styles.recentTile}>
                    {play.albumImageUrl ? (
                      <Image source={{ uri: play.albumImageUrl }} style={styles.recentArt} />
                    ) : (
                      <View style={[styles.recentArt, styles.recentArtFallback]}>
                        <Music2 size={20} color={alpha.white(0.4)} />
                      </View>
                    )}
                    <Text numberOfLines={1} style={styles.recentTitle}>
                      {play.trackName}
                    </Text>
                    <Text numberOfLines={1} style={styles.recentSub}>
                      {play.artistName}
                    </Text>
                    <Text style={styles.recentTime}>{timeAgo(play.ts)}</Text>
                  </View>
                ))}
          </ScrollView>
        </MotiView>
      ) : null}

      <MotiView {...staggerChild(2)} style={styles.section}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
          {stats.isLoading
            ? Array.from({ length: 7 }).map((_, i) => <Shimmer key={i} width={116} height={92} rounded="xl" />)
            : statItems.map((s) => <StatChip key={s.label} {...s} />)}
        </ScrollView>
      </MotiView>

      <MotiView {...staggerChild(3)} style={styles.section}>
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

      <MotiView {...staggerChild(4)} style={styles.section}>
        <FeedHeader title="Top tracks" onSeeAll={() => router.push("/(tabs)/tracks")} />
        <View style={styles.shortcutGrid}>
          {topTracks.isLoading
            ? Array.from({ length: 4 }).map((_, i) => <Shimmer key={i} width="48%" height={56} rounded="lg" />)
            : topTracks.data?.tracks
                .slice(0, 4)
                .map((track) => (
                  <ShortcutTile
                    key={track.uri}
                    imageUrl={track.albumImageUrl}
                    title={track.trackName}
                    onPress={() => router.push("/(tabs)/tracks")}
                  />
                ))}
        </View>
      </MotiView>

      <MotiView {...staggerChild(5)} style={styles.section}>
        <FeedHeader title="Top artists" onSeeAll={() => router.push("/(tabs)/artists")} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 16 }}>
          {topArtists.isLoading
            ? Array.from({ length: 5 }).map((_, i) => (
                <View key={i} style={styles.artistItem}>
                  <Shimmer width={80} height={80} rounded="full" />
                </View>
              ))
            : topArtists.data?.artists.slice(0, 6).map((artist) => (
                <Pressable key={artist.name} onPress={() => router.push("/(tabs)/artists")} style={styles.artistItem}>
                  <ArtistAvatar artist={artist} size="md" />
                  <Text numberOfLines={1} style={styles.artistLabel}>
                    {artist.name}
                  </Text>
                  <Text numberOfLines={1} style={styles.artistSub}>
                    {artist.plays.toLocaleString()} plays
                  </Text>
                </Pressable>
              ))}
        </ScrollView>
      </MotiView>

      <MotiView {...staggerChild(6)} style={styles.section}>
        <FeedHeader title="Insights" onSeeAll={() => router.push("/(tabs)/insights")} />
        {insights.isLoading ? (
          <Shimmer width="100%" height={140} rounded="xl" />
        ) : insights.data ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
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

      <MotiView {...staggerChild(7)} style={styles.section}>
        <FeedHeader title="Forgotten favorites" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
          {rediscovery.isLoading
            ? Array.from({ length: 4 }).map((_, i) => <Shimmer key={i} width={160} height={120} rounded="xl" />)
            : rediscovery.data?.cards.map((card) => <RediscoveryCardView key={card.key} card={card} />)}
        </ScrollView>
      </MotiView>

      <MotiView {...staggerChild(8)} style={{ gap: 12 }}>
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
  section: { marginBottom: 24 },
  header: { marginBottom: 18, flexDirection: "row", alignItems: "center", gap: 12 },
  greeting: { fontSize: fontSize[30], fontFamily: "GeistSansBold", color: colors.white },
  headerSub: { marginTop: 4, fontSize: fontSize[14], fontFamily: "GeistSans", color: alpha.white(0.5) },
  headerSubAccent: { fontFamily: "PlayfairDisplayItalic", fontStyle: "italic", color: colors.echoGreen },
  recentTile: { width: 104 },
  recentArt: { width: 104, height: 104, borderRadius: 10 },
  recentArtFallback: { backgroundColor: colors.surfaceRaised, alignItems: "center", justifyContent: "center" },
  recentTitle: { marginTop: 8, fontSize: fontSize[12], fontFamily: "GeistSansMedium", color: colors.white },
  recentSub: { marginTop: 1, fontSize: fontSize[10], fontFamily: "GeistSans", color: alpha.white(0.45) },
  recentTime: { marginTop: 3, fontSize: fontSize[9], fontFamily: "GeistSans", color: alpha.white(0.28) },

  feedHeader: { marginBottom: 14, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  feedTitle: { fontSize: fontSize[20], fontFamily: "GeistSansBold", color: colors.white },
  seeAll: { flexDirection: "row", alignItems: "center", gap: 1 },
  seeAllText: { fontSize: fontSize[12], fontFamily: "GeistSansMedium", color: alpha.white(0.4) },

  shortcutGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  shortcut: {
    flexBasis: "48%",
    flexGrow: 1,
    flexDirection: "row",
    alignItems: "center",
    height: 56,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: colors.surface,
  },
  shortcutImg: { width: 56, height: 56 },
  shortcutFallback: { alignItems: "center", justifyContent: "center", backgroundColor: alpha.white(0.06) },
  shortcutText: { flex: 1, paddingHorizontal: 10, fontSize: fontSize[12], fontFamily: "GeistSansBold", color: colors.white },

  statChip: { width: 116, borderRadius: 14, backgroundColor: colors.surface, padding: 14 },
  statIcon: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  statValue: { marginTop: 12, fontSize: fontSize[18], fontFamily: "GeistSansBold", color: colors.white },
  statLabel: {
    marginTop: 2,
    fontSize: fontSize[10],
    fontFamily: "GeistSans",
    textTransform: "uppercase",
    letterSpacing: trackingWidest2(fontSize[10]),
    color: alpha.white(0.4),
  },

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

  artistItem: { width: 88, alignItems: "center" },
  artistLabel: { marginTop: 10, fontSize: fontSize[12], fontFamily: "GeistSansSemiBold", color: colors.white, textAlign: "center" },
  artistSub: { marginTop: 2, fontSize: fontSize[11], color: alpha.white(0.45), textAlign: "center" },

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

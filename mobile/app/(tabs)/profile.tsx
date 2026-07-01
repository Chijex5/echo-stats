import { ScrollView, View, Text } from "react-native";
import {
  Activity,
  Archive,
  BadgeCheck,
  Clock3,
  Compass,
  Database,
  Fingerprint,
  Flame,
  Heart,
  Music2,
  Orbit,
  Radio,
  ShieldCheck,
  Sparkles,
  type LucideIcon,
} from "lucide-react-native";
import { GlassCard, SectionHeading, StatTile, Shimmer, ScreenScroll } from "@/components/ui";
import { ProfileHero } from "@/components/dashboard/ProfileHero";
import { MilestoneTimeline, type MilestoneItem } from "@/components/dashboard/MilestoneTimeline";
import { ServiceRow } from "@/components/dashboard/ServiceRow";
import { HighlightsSection } from "@/components/dashboard/HighlightsSection";
import { useProfile, type SongMoment } from "@/lib/api/hooks";
import { colors, alpha } from "@/lib/theme/tokens";

function formatDate(value: string | null | undefined) {
  if (!value) return "Not yet";
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}

function songLabel(song: SongMoment) {
  if (!song) return "No track yet";
  return `${song.trackName} — ${song.artistName}`;
}

function IdentityCard({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <GlassCard padding="md" rounded="2xl" style={{ width: 168 }}>
      <View
        className="h-9 w-9 items-center justify-center rounded-xl border"
        style={{ borderColor: alpha.spotify(0.2), backgroundColor: alpha.spotify(0.08) }}
      >
        <Icon size={16} color={colors.echoGreen} />
      </View>
      <Text className="mt-3.5 text-10 font-sans-semibold uppercase tracking-widest2 text-white/35">{label}</Text>
      <Text numberOfLines={1} className="mt-1.5 text-15 font-sans-semibold text-white">
        {value}
      </Text>
    </GlassCard>
  );
}

export default function ProfileScreen() {
  const profile = useProfile();
  const data = profile.data;

  return (
    <ScreenScroll>
      <View className="mb-5">
        <SectionHeading label="Your archive" title="Profile" align="left" />
      </View>

      {profile.isLoading ? (
        <View className="gap-3">
          <Shimmer width="100%" height={300} rounded="xl" />
          <View className="flex-row flex-wrap gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <Shimmer key={i} width={100} height={64} rounded="xl" />
            ))}
          </View>
        </View>
      ) : data ? (
        <View className="gap-8">
          <ProfileHero user={data.user} connectedDate={data.summary.connectedDate} />

          <View>
            <Text className="mb-3 text-12 font-sans-semibold uppercase tracking-widest2 text-white/30">
              User summary
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
              <StatTile width={112} label="Songs analyzed" value={data.summary.totalSongsAnalyzed.toLocaleString()} />
              <StatTile width={112} label="Years imported" value={data.summary.yearsImported} />
              <StatTile width={112} label="Artists discovered" value={data.summary.totalArtistsDiscovered.toLocaleString()} />
              <StatTile width={112} label="Favorite genre" value={data.summary.favoriteGenre} />
              <StatTile width={112} label="Listening streak" value={`${data.summary.listeningStreak}d`} accentColor={colors.accentAmber} />
              <StatTile width={112} label="Connected date" value={data.summary.connectedDate} />
              <StatTile width={112} label="Hours listened" value={data.summary.totalHoursListened.toLocaleString()} accentColor={colors.accentBlue} />
              <StatTile width={112} label="Total plays" value={data.summary.totalPlays.toLocaleString()} />
            </ScrollView>
          </View>

          <View>
            <Text className="mb-3 text-12 font-sans-semibold uppercase tracking-widest2 text-white/30">
              Music identity
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
              <IdentityCard icon={Fingerprint} label="Listening personality" value={data.identity.listeningPersonality} />
              <IdentityCard icon={Archive} label="Music age" value={data.identity.musicAge} />
              <IdentityCard icon={Orbit} label="Favorite decade" value={data.identity.favoriteDecade} />
              <IdentityCard icon={Compass} label="Hidden genre" value={data.identity.hiddenGenre} />
              <IdentityCard icon={Clock3} label="Top listening hour" value={data.identity.topListeningHour} />
              <IdentityCard icon={Sparkles} label="Top listening season" value={data.identity.topListeningSeason} />
            </ScrollView>
          </View>

          <View>
            <Text className="mb-3 text-12 font-sans-semibold uppercase tracking-widest2 text-white/30">
              Personal milestones
            </Text>
            <GlassCard padding="md" rounded="2xl">
              <MilestoneTimeline
                items={
                  [
                    {
                      key: "firstImportedSong",
                      icon: Music2,
                      title: "First imported song",
                      value: songLabel(data.milestones.firstImportedSong),
                      meta: formatDate(data.milestones.firstImportedSong?.ts),
                    },
                    {
                      key: "firstSyncedSong",
                      icon: Radio,
                      title: "First synced song",
                      value: songLabel(data.milestones.firstSyncedSong),
                      meta: formatDate(data.milestones.firstSyncedSong?.ts),
                    },
                    {
                      key: "oldestFavoriteTrack",
                      icon: Heart,
                      title: "Oldest favorite track",
                      value: songLabel(data.milestones.oldestFavoriteTrack),
                      meta: formatDate(data.milestones.oldestFavoriteTrack?.firstPlayed),
                    },
                    {
                      key: "longestObsession",
                      icon: Flame,
                      title: "Longest obsession",
                      value: songLabel(data.milestones.longestObsession),
                      meta: `${data.milestones.longestObsession?.plays ?? 0} plays recorded`,
                    },
                    {
                      key: "latestGenreShift",
                      icon: Activity,
                      title: "Latest genre shift",
                      value: data.milestones.latestGenreShift.to
                        ? `${data.milestones.latestGenreShift.from ?? "New signal"} → ${data.milestones.latestGenreShift.to}`
                        : "No shift detected",
                      meta: "Based on the last 60 days of artist gravity",
                    },
                  ] satisfies MilestoneItem[]
                }
              />
            </GlassCard>
          </View>

          <View>
            <Text className="mb-3 text-12 font-sans-semibold uppercase tracking-widest2 text-white/30">
              Connected services
            </Text>
            <View className="gap-2.5">
              <ServiceRow
                icon={BadgeCheck}
                title="Spotify"
                value={data.services.spotifyConnected ? "Connected" : "Disconnected"}
                active={data.services.spotifyConnected}
              />
              <ServiceRow
                icon={Clock3}
                title="Last sync"
                value={formatDate(data.services.lastSync)}
                active={Boolean(data.services.lastSync)}
              />
              <ServiceRow
                icon={ShieldCheck}
                title="Sync health"
                value={data.services.syncHealth}
                active={data.services.syncHealth === "Healthy"}
              />
              <ServiceRow
                icon={Archive}
                title="Archive"
                value={data.services.archiveImported ? "Imported" : "Pending"}
                active={data.services.archiveImported}
              />
              <ServiceRow icon={Database} title="Storage used" value={data.services.storageUsed} active />
            </View>
          </View>

          <View>
            <Text className="mb-3 text-12 font-sans-semibold uppercase tracking-widest2 text-white/30">
              Highlights
            </Text>
            <HighlightsSection highlights={data.highlights} />
          </View>
        </View>
      ) : null}
    </ScreenScroll>
  );
}

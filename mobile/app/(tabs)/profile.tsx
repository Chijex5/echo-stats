import { ScrollView, View, Text, Pressable, Alert, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
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
  LogOut,
  Music2,
  Orbit,
  Radio,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  X,
  type LucideIcon,
} from "lucide-react-native";
import { GlassCard, StatTile, PrimaryButton, Shimmer, ScreenScroll } from "@/components/ui";
import { ProfileHero } from "@/components/dashboard/ProfileHero";
import { MilestoneTimeline, type MilestoneItem } from "@/components/dashboard/MilestoneTimeline";
import { ServiceRow } from "@/components/dashboard/ServiceRow";
import { HighlightsSection } from "@/components/dashboard/HighlightsSection";
import { useProfile, useImportStatus, type SongMoment } from "@/lib/api/hooks";
import { useAuth } from "@/lib/auth/AuthContext";
import { colors, alpha, fontSize, trackingWidest2 } from "@/lib/theme/tokens";

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
      <View style={styles.identityIcon}>
        <Icon size={16} color={colors.echoGreen} />
      </View>
      <Text style={styles.identityLabel}>{label}</Text>
      <Text numberOfLines={1} style={styles.identityValue}>
        {value}
      </Text>
    </GlassCard>
  );
}

export default function ProfileScreen() {
  const profile = useProfile();
  const importStatus = useImportStatus();
  const { logout } = useAuth();
  const router = useRouter();
  const data = profile.data;
  const sync = importStatus.data;

  function handleLogout() {
    Alert.alert("Log out", "You'll need to reconnect Spotify to sign back in.", [
      { text: "Cancel", style: "cancel" },
      { text: "Log out", style: "destructive", onPress: () => void logout() },
    ]);
  }

  return (
    <ScreenScroll style={{ backgroundColor: colors.background }}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <Pressable onPress={() => router.back()} hitSlop={8} style={styles.close}>
          <X size={18} color={alpha.white(0.6)} />
        </Pressable>
      </View>

      {profile.isLoading ? (
        <View style={{ gap: 12 }}>
          <Shimmer width="100%" height={300} rounded="xl" />
          <View style={styles.loadingRow}>
            {Array.from({ length: 8 }).map((_, i) => (
              <Shimmer key={i} width={100} height={64} rounded="xl" />
            ))}
          </View>
        </View>
      ) : data ? (
        <View style={{ gap: 32 }}>
          <ProfileHero user={data.user} connectedDate={data.summary.connectedDate} />

          <View>
            <Text style={styles.sectionLabel}>User summary</Text>
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
            <Text style={styles.sectionLabel}>Music identity</Text>
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
            <Text style={styles.sectionLabel}>Personal milestones</Text>
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
            <Text style={styles.sectionLabel}>Connected services</Text>
            <View style={{ gap: 10 }}>
              <ServiceRow
                icon={BadgeCheck}
                title="Spotify"
                value={data.services.spotifyConnected ? "Connected" : "Disconnected"}
                active={data.services.spotifyConnected}
              />
              <ServiceRow icon={Clock3} title="Last sync" value={formatDate(data.services.lastSync)} active={Boolean(data.services.lastSync)} />
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
            <Text style={styles.sectionLabel}>Your data</Text>
            <View style={styles.resyncCard}>
              <Text style={styles.resyncTitle}>
                {sync?.dueForResync ? "Time for a fresh export" : "Your vault is current"}
              </Text>
              <Text style={styles.resyncSub}>
                {sync?.lastImportAt
                  ? `Last import ${formatDate(sync.lastImportAt)} · ${sync.totalEntries.toLocaleString()} plays stored.`
                  : "Upload a Spotify export to backfill anything the live sync missed."}{" "}
                Re-uploading is always safe — duplicates are skipped automatically, and we&apos;ll nudge you monthly.
              </Text>
              <View style={{ marginTop: 14 }}>
                <PrimaryButton
                  label="Re-sync history"
                  icon={RefreshCw}
                  variant={sync?.dueForResync ? "spotify-solid" : "outline"}
                  fullWidth
                  onPress={() => router.push("/(tabs)/resync")}
                />
              </View>
            </View>
          </View>

          <View>
            <Text style={styles.sectionLabel}>Highlights</Text>
            <HighlightsSection highlights={data.highlights} />
          </View>
        </View>
      ) : null}

      <View style={styles.logoutWrap}>
        <PrimaryButton label="Log out" variant="outline" icon={LogOut} fullWidth onPress={handleLogout} />
      </View>
    </ScreenScroll>
  );
}

const styles = StyleSheet.create({
  header: { marginBottom: 24, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  headerTitle: { fontSize: fontSize[26], fontFamily: "GeistSansBold", color: colors.white },
  close: {
    height: 36,
    width: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
    backgroundColor: colors.surfaceRaised,
  },
  logoutWrap: { marginTop: 32 },
  loadingRow: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  sectionLabel: {
    marginBottom: 12,
    fontSize: fontSize[12],
    fontFamily: "GeistSansSemiBold",
    textTransform: "uppercase",
    letterSpacing: trackingWidest2(fontSize[12]),
    color: alpha.white(0.3),
  },
  identityIcon: {
    height: 36,
    width: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: alpha.spotify(0.2),
    backgroundColor: alpha.spotify(0.08),
  },
  identityLabel: {
    marginTop: 14,
    fontSize: fontSize[10],
    fontFamily: "GeistSansSemiBold",
    textTransform: "uppercase",
    letterSpacing: trackingWidest2(fontSize[10]),
    color: alpha.white(0.35),
  },
  identityValue: { marginTop: 6, fontSize: fontSize[15], fontFamily: "GeistSansSemiBold", color: colors.white },
  resyncCard: { borderRadius: 18, backgroundColor: colors.surface, padding: 16 },
  resyncTitle: { fontSize: fontSize[15], fontFamily: "GeistSansSemiBold", color: colors.white },
  resyncSub: {
    marginTop: 6,
    fontSize: fontSize[12],
    fontFamily: "GeistSans",
    lineHeight: fontSize[12] * 1.45,
    color: alpha.white(0.5),
  },
});

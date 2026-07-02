import { FlatList, Text, View, Image, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { TrendingUp, TrendingDown, Minus } from "lucide-react-native";
import { Shimmer } from "@/components/ui";
import { ProfileHeaderButton } from "@/components/dashboard/ProfileHeaderButton";
import { gradientForKey } from "@/lib/theme/gradients";
import { colors, alpha, spacing, fontSize, trackingWidest2 } from "@/lib/theme/tokens";
import { useTopTracks, type Trend, type TopTrack } from "@/lib/api/hooks";

function TrendIcon({ trend, size = 14 }: { trend: Trend; size?: number }) {
  if (trend === "up") return <TrendingUp size={size} color={colors.echoGreen} />;
  if (trend === "down") return <TrendingDown size={size} color={colors.accentRed} />;
  return <Minus size={size} color={alpha.white(0.3)} />;
}

function FeatureTrack({ track }: { track: TopTrack }) {
  return (
    <View style={styles.feature}>
      {track.albumImageUrl ? (
        <Image source={{ uri: track.albumImageUrl }} style={styles.featureArt} />
      ) : (
        <LinearGradient colors={gradientForKey(track.trackName)} style={styles.featureArt} />
      )}
      <View style={styles.featureMeta}>
        <Text style={styles.featureLabel}>#1 most played</Text>
        <Text numberOfLines={2} style={styles.featureTitle}>
          {track.trackName}
        </Text>
        <Text numberOfLines={1} style={styles.featureArtist}>
          {track.artistName}
        </Text>
        <View style={styles.featureStat}>
          <TrendIcon trend={track.trend} size={13} />
          <Text style={styles.featurePlays}>{track.playCount.toLocaleString()} plays</Text>
        </View>
      </View>
    </View>
  );
}

function TrackRow({ track, rank }: { track: TopTrack; rank: number }) {
  const rankColor = rank === 1 ? colors.echoGreen : rank <= 3 ? colors.white : alpha.white(0.4);
  return (
    <View style={styles.row}>
      <Text style={[styles.rank, { color: rankColor }]}>{rank}</Text>
      {track.albumImageUrl ? (
        <Image source={{ uri: track.albumImageUrl }} style={styles.art} />
      ) : (
        <LinearGradient colors={gradientForKey(track.trackName)} style={styles.art} />
      )}
      <View style={styles.meta}>
        <Text numberOfLines={1} style={styles.rowTitle}>
          {track.trackName}
        </Text>
        <Text numberOfLines={1} style={styles.rowArtist}>
          {track.artistName}
        </Text>
      </View>
      <View style={styles.rowTrailing}>
        <TrendIcon trend={track.trend} />
        <Text style={styles.rowPlays}>{track.playCount}×</Text>
      </View>
    </View>
  );
}

export default function TracksScreen() {
  const topTracks = useTopTracks(50);
  const tracks = topTracks.data?.tracks ?? [];
  const feature = tracks[0];
  const rest = tracks.slice(1);

  return (
    <View style={{ flex: 1, paddingTop: spacing.screenTop, backgroundColor: colors.background }}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Top tracks</Text>
          <Text style={styles.subtitle}>Your most played, all time</Text>
        </View>
        <ProfileHeaderButton />
      </View>

      {topTracks.isLoading ? (
        <View style={[styles.loadingWrap, { paddingHorizontal: spacing.screenX }]}>
          <Shimmer width="100%" height={112} rounded="xl" />
          <View style={styles.loadingList}>
            {Array.from({ length: 8 }).map((_, i) => (
              <Shimmer key={i} width="100%" height={48} />
            ))}
          </View>
        </View>
      ) : tracks.length ? (
        <FlatList
          data={rest}
          keyExtractor={(item) => item.uri}
          ListHeaderComponent={feature ? <FeatureTrack track={feature} /> : null}
          contentContainerStyle={{ paddingHorizontal: spacing.screenX, paddingBottom: spacing.screenBottom }}
          renderItem={({ item, index }) => <TrackRow track={item} rank={index + 2} />}
        />
      ) : (
        <Text style={styles.empty}>No tracks yet — keep listening.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.screenX,
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  title: { fontSize: fontSize[26], fontFamily: "GeistSansBold", color: colors.white },
  subtitle: { marginTop: 2, fontSize: fontSize[13], fontFamily: "GeistSans", color: alpha.white(0.45) },

  loadingWrap: { marginTop: 4 },
  loadingList: { marginTop: 16, gap: 10 },
  empty: { paddingHorizontal: spacing.screenX, fontSize: fontSize[13], color: alpha.white(0.4) },

  feature: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderRadius: 16,
    backgroundColor: colors.surface,
    padding: 14,
    marginBottom: 24,
  },
  featureArt: { width: 84, height: 84, borderRadius: 10 },
  featureMeta: { flex: 1 },
  featureLabel: {
    fontSize: fontSize[10],
    fontFamily: "GeistSansSemiBold",
    textTransform: "uppercase",
    letterSpacing: trackingWidest2(fontSize[10]),
    color: colors.echoGreen,
  },
  featureTitle: { marginTop: 6, fontSize: fontSize[18], fontFamily: "GeistSansBold", color: colors.white },
  featureArtist: { marginTop: 2, fontSize: fontSize[13], color: alpha.white(0.5) },
  featureStat: { marginTop: 8, flexDirection: "row", alignItems: "center", gap: 6 },
  featurePlays: { fontSize: fontSize[12], fontFamily: "GeistSansMedium", color: alpha.white(0.6) },

  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 8 },
  rank: { width: 22, textAlign: "center", fontSize: fontSize[13], fontFamily: "GeistSansSemiBold" },
  art: { width: 48, height: 48, borderRadius: 6 },
  meta: { flex: 1 },
  rowTitle: { fontSize: fontSize[14], fontFamily: "GeistSansMedium", color: colors.white },
  rowArtist: { marginTop: 2, fontSize: fontSize[12], color: alpha.white(0.45) },
  rowTrailing: { flexDirection: "row", alignItems: "center", gap: 8 },
  rowPlays: { fontSize: fontSize[12], color: alpha.white(0.4) },
});

import { FlatList, View, Text, StyleSheet } from "react-native";
import { TrendingUp, TrendingDown, Minus } from "lucide-react-native";
import { Shimmer } from "@/components/ui";
import { ArtistAvatar } from "@/components/dashboard/ArtistAvatar";
import { ProfileHeaderButton } from "@/components/dashboard/ProfileHeaderButton";
import { colors, alpha, spacing, fontSize, trackingWidest2 } from "@/lib/theme/tokens";
import { useTopArtists, type Trend, type TopArtist } from "@/lib/api/hooks";

function computeMovers(artists: TopArtist[]) {
  const fastRising = [...artists].sort((a, b) => b.delta - a.delta).find((a) => a.delta > 0) ?? null;
  const forgotten = [...artists].sort((a, b) => a.delta - b.delta).find((a) => a.delta < 0) ?? null;
  return { fastRising, forgotten };
}

function TrendIcon({ trend, size = 14 }: { trend: Trend; size?: number }) {
  if (trend === "up") return <TrendingUp size={size} color={colors.echoGreen} />;
  if (trend === "down") return <TrendingDown size={size} color={colors.accentRed} />;
  return <Minus size={size} color={alpha.white(0.3)} />;
}

function FeatureArtist({ artist }: { artist: TopArtist }) {
  return (
    <View style={styles.feature}>
      <ArtistAvatar artist={artist} size="lg" ring />
      <View style={styles.featureMeta}>
        <Text style={styles.featureLabel}>#1 most played</Text>
        <Text numberOfLines={1} style={styles.featureTitle}>
          {artist.name}
        </Text>
        <Text style={styles.featureArtist}>{artist.plays.toLocaleString()} plays</Text>
        <View style={styles.featureStat}>
          <TrendIcon trend={artist.trend} size={13} />
          <Text style={styles.featurePlays}>{artist.deltaLabel}</Text>
        </View>
      </View>
    </View>
  );
}

function Mover({ up, label, name }: { up: boolean; label: string; name: string }) {
  return (
    <View style={styles.mover}>
      <View style={styles.moverHead}>
        {up ? <TrendingUp size={12} color={colors.echoGreen} /> : <TrendingDown size={12} color={colors.accentRed} />}
        <Text style={styles.moverLabel}>{label}</Text>
      </View>
      <Text numberOfLines={1} style={styles.moverName}>
        {name}
      </Text>
    </View>
  );
}

function ArtistRow({ artist, rank }: { artist: TopArtist; rank: number }) {
  const rankColor = rank === 1 ? colors.echoGreen : rank <= 3 ? colors.white : alpha.white(0.4);
  return (
    <View style={styles.row}>
      <Text style={[styles.rank, { color: rankColor }]}>{rank}</Text>
      <ArtistAvatar artist={artist} size="sm" />
      <View style={styles.rowMeta}>
        <Text numberOfLines={1} style={styles.rowTitle}>
          {artist.name}
        </Text>
        <Text numberOfLines={1} style={styles.rowArtist}>
          {artist.plays.toLocaleString()} plays
        </Text>
      </View>
      <View style={styles.rowTrailing}>
        <TrendIcon trend={artist.trend} />
        <Text style={styles.rowDelta}>{artist.deltaLabel}</Text>
      </View>
    </View>
  );
}

export default function ArtistsScreen() {
  const topArtists = useTopArtists(30);
  const artists = topArtists.data?.artists ?? [];
  const feature = artists[0];
  const rest = artists.slice(1);
  const { fastRising, forgotten } = computeMovers(artists);

  return (
    <View style={{ flex: 1, paddingTop: spacing.screenTop, backgroundColor: colors.background }}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Top artists</Text>
          <Text style={styles.subtitle}>Your most played, all time</Text>
        </View>
        <ProfileHeaderButton />
      </View>

      {topArtists.isLoading ? (
        <View style={[styles.loadingWrap, { paddingHorizontal: spacing.screenX }]}>
          <Shimmer width="100%" height={128} rounded="xl" />
          <View style={styles.loadingList}>
            {Array.from({ length: 8 }).map((_, i) => (
              <Shimmer key={i} width="100%" height={48} />
            ))}
          </View>
        </View>
      ) : artists.length ? (
        <FlatList
          data={rest}
          keyExtractor={(item) => item.name}
          ListHeaderComponent={
            <View>
              {feature ? <FeatureArtist artist={feature} /> : null}
              {fastRising || forgotten ? (
                <View style={styles.movers}>
                  {fastRising ? <Mover up label="Rising" name={fastRising.name} /> : null}
                  {forgotten ? <Mover up={false} label="Fading" name={forgotten.name} /> : null}
                </View>
              ) : null}
            </View>
          }
          contentContainerStyle={{ paddingHorizontal: spacing.screenX, paddingBottom: spacing.screenBottom }}
          renderItem={({ item, index }) => <ArtistRow artist={item} rank={index + 2} />}
        />
      ) : (
        <Text style={styles.empty}>No artists yet — keep listening.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: spacing.screenX, marginBottom: 20, flexDirection: "row", alignItems: "center", gap: 12 },
  title: { fontSize: fontSize[26], fontFamily: "GeistSansBold", color: colors.white },
  subtitle: { marginTop: 2, fontSize: fontSize[13], fontFamily: "GeistSans", color: alpha.white(0.45) },

  loadingWrap: { marginTop: 4 },
  loadingList: { marginTop: 16, gap: 10 },
  empty: { paddingHorizontal: spacing.screenX, fontSize: fontSize[13], color: alpha.white(0.4) },

  feature: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    borderRadius: 16,
    backgroundColor: colors.surface,
    padding: 16,
  },
  featureMeta: { flex: 1 },
  featureLabel: {
    fontSize: fontSize[10],
    fontFamily: "GeistSansSemiBold",
    textTransform: "uppercase",
    letterSpacing: trackingWidest2(fontSize[10]),
    color: colors.echoGreen,
  },
  featureTitle: { marginTop: 6, fontSize: fontSize[20], fontFamily: "GeistSansBold", color: colors.white },
  featureArtist: { marginTop: 2, fontSize: fontSize[13], color: alpha.white(0.5) },
  featureStat: { marginTop: 8, flexDirection: "row", alignItems: "center", gap: 6 },
  featurePlays: { fontSize: fontSize[12], fontFamily: "GeistSansMedium", color: alpha.white(0.6) },

  movers: { flexDirection: "row", gap: 10, marginTop: 12, marginBottom: 24 },
  mover: { flex: 1, borderRadius: 12, backgroundColor: colors.surface, padding: 14 },
  moverHead: { flexDirection: "row", alignItems: "center", gap: 6 },
  moverLabel: {
    fontSize: fontSize[10],
    fontFamily: "GeistSansSemiBold",
    textTransform: "uppercase",
    letterSpacing: trackingWidest2(fontSize[10]),
    color: alpha.white(0.4),
  },
  moverName: { marginTop: 8, fontSize: fontSize[14], fontFamily: "GeistSansSemiBold", color: colors.white },

  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 8 },
  rank: { width: 22, textAlign: "center", fontSize: fontSize[13], fontFamily: "GeistSansSemiBold" },
  rowMeta: { flex: 1 },
  rowTitle: { fontSize: fontSize[14], fontFamily: "GeistSansMedium", color: colors.white },
  rowArtist: { marginTop: 2, fontSize: fontSize[12], color: alpha.white(0.45) },
  rowTrailing: { flexDirection: "row", alignItems: "center", gap: 6 },
  rowDelta: { fontSize: fontSize[11], color: alpha.white(0.4) },
});

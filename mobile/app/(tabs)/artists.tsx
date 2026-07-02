import { FlatList, View, StyleSheet } from "react-native";
import { SectionHeading, StatTile, Shimmer } from "@/components/ui";
import { FeaturedArtistCard } from "@/components/dashboard/FeaturedArtistCard";
import { ArtistGridCard } from "@/components/dashboard/ArtistGridCard";
import { ProfileHeaderButton } from "@/components/dashboard/ProfileHeaderButton";
import { colors, spacing } from "@/lib/theme/tokens";
import { useTopArtists, type TopArtist } from "@/lib/api/hooks";

function computeInsights(artists: TopArtist[]) {
  const sortedByDelta = [...artists].sort((a, b) => b.delta - a.delta);
  const fastRising = sortedByDelta.find((a) => a.delta > 0) ?? null;
  const forgotten = [...artists].sort((a, b) => a.delta - b.delta).find((a) => a.delta < 0) ?? null;
  const totalDrift = artists.reduce((acc, a) => acc + Math.abs(a.delta), 0);
  const totalPlays = artists.reduce((sum, a) => sum + a.plays, 1);
  const driftPct = artists.length ? Math.min(100, Math.round((totalDrift / totalPlays) * 100)) : 0;
  return { fastRising, forgotten, driftPct };
}

export default function ArtistsScreen() {
  const topArtists = useTopArtists(30);
  const artists = topArtists.data?.artists ?? [];
  const featured = artists[0] ?? null;
  const grid = artists.slice(1);
  const { fastRising, forgotten, driftPct } = computeInsights(artists);

  return (
    <View style={{ flex: 1, paddingTop: spacing.screenTop }}>
      <View style={styles.headerRow}>
        <SectionHeading label="Most played" title="Top artists" align="left" />
        <ProfileHeaderButton />
      </View>

      {topArtists.isLoading ? (
        <View style={[styles.loadingWrap, { paddingHorizontal: spacing.screenX }]}>
          <Shimmer width="100%" height={280} rounded="xl" />
          <View style={styles.loadingRow}>
            <Shimmer width="100%" height={80} rounded="xl" />
            <Shimmer width="100%" height={80} rounded="xl" />
          </View>
        </View>
      ) : (
        <FlatList
          data={grid}
          keyExtractor={(item) => item.name}
          numColumns={2}
          columnWrapperStyle={{ gap: 12 }}
          contentContainerStyle={{ paddingHorizontal: spacing.screenX, paddingBottom: spacing.screenBottom, gap: 12 }}
          ListHeaderComponent={
            <View style={styles.header}>
              {featured ? <FeaturedArtistCard artist={featured} /> : null}
              <View style={styles.statsRow}>
                <StatTile label="Monthly drift" value={`${driftPct}%`} />
                <StatTile label="Fast rising" value={fastRising?.name ?? "None yet"} accentColor={colors.echoGreen} />
                <StatTile label="Fading out" value={forgotten?.name ?? "None"} accentColor={colors.accentRed} />
              </View>
            </View>
          }
          renderItem={({ item, index }) => <ArtistGridCard artist={item} rank={index + 2} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: { paddingHorizontal: spacing.screenX, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  loadingWrap: { marginTop: 20, gap: 12 },
  loadingRow: { flexDirection: "row", gap: 12 },
  header: { marginBottom: 20, marginTop: 20, gap: 12 },
  statsRow: { flexDirection: "row", gap: 12 },
});

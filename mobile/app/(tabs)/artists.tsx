import { FlatList, View } from "react-native";
import { SectionHeading, StatTile, Shimmer } from "@/components/ui";
import { FeaturedArtistCard } from "@/components/dashboard/FeaturedArtistCard";
import { ArtistGridCard } from "@/components/dashboard/ArtistGridCard";
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
    <View style={{ flex: 1, paddingTop: 72 }}>
      <View className="px-5">
        <SectionHeading label="Most played" title="Top artists" align="left" />
      </View>

      {topArtists.isLoading ? (
        <View className="mt-5 gap-3 px-5">
          <Shimmer width="100%" height={280} rounded="xl" />
          <View className="flex-row gap-3">
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
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 140, gap: 12 }}
          ListHeaderComponent={
            <View className="mb-5 mt-5 gap-3">
              {featured ? <FeaturedArtistCard artist={featured} /> : null}
              <View className="flex-row gap-3">
                <StatTile label="Monthly drift" value={`${driftPct}%`} />
                <StatTile label="Fast rising" value={fastRising?.name ?? "None yet"} accentColor="#18d87e" />
                <StatTile label="Fading out" value={forgotten?.name ?? "None"} accentColor="#f87171" />
              </View>
            </View>
          }
          renderItem={({ item, index }) => <ArtistGridCard artist={item} rank={index + 2} />}
        />
      )}
    </View>
  );
}

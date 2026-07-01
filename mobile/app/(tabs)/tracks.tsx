import { FlatList, Text, View } from "react-native";
import { TrendingUp, TrendingDown, Minus } from "lucide-react-native";
import { SectionHeading, ListRow, Shimmer } from "@/components/ui";
import { TopTracksPodium } from "@/components/dashboard/TopTracksPodium";
import { colors, alpha, spacing } from "@/lib/theme/tokens";
import { useTopTracks, type Trend, type TopTrack } from "@/lib/api/hooks";

function TrendIcon({ trend }: { trend: Trend }) {
  if (trend === "up") return <TrendingUp size={14} color={colors.echoGreen} />;
  if (trend === "down") return <TrendingDown size={14} color={colors.accentRed} />;
  return <Minus size={14} color={alpha.white(0.3)} />;
}

export default function TracksScreen() {
  const topTracks = useTopTracks(50);
  const tracks = topTracks.data?.tracks ?? [];
  const podium = tracks.slice(0, 3);
  const rest = tracks.slice(3);

  return (
    <View style={{ flex: 1, paddingTop: spacing.screenTop }}>
      <View className="px-screen-x">
        <SectionHeading label="On repeat" title="Top tracks" align="left" />
      </View>

      {topTracks.isLoading ? (
        <View className="mt-5 px-screen-x">
          <Shimmer width="100%" height={160} rounded="xl" />
          <View className="mt-3 gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Shimmer key={i} width="100%" height={56} />
            ))}
          </View>
        </View>
      ) : (
        <FlatList
          data={rest}
          keyExtractor={(item) => item.uri}
          ListHeaderComponent={
            podium.length === 3 ? (
              <View className="mb-6 mt-5">
                <TopTracksPodium tracks={podium} />
              </View>
            ) : null
          }
          contentContainerStyle={{ paddingHorizontal: spacing.screenX, paddingBottom: spacing.screenBottom }}
          renderItem={({ item, index }: { item: TopTrack; index: number }) => (
            <ListRow
              imageUrl={item.albumImageUrl}
              title={item.trackName}
              subtitle={item.artistName}
              trailing={
                <View className="flex-row items-center gap-2">
                  <Text className="text-12 text-white/40">{item.playCount}×</Text>
                  <TrendIcon trend={item.trend} />
                  <Text className="w-6 text-right text-11 text-white/30">#{index + 4}</Text>
                </View>
              }
            />
          )}
        />
      )}
    </View>
  );
}

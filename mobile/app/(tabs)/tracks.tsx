import { FlatList, Text, View, StyleSheet } from "react-native";
import { TrendingUp, TrendingDown, Minus } from "lucide-react-native";
import { SectionHeading, ListRow, Shimmer } from "@/components/ui";
import { TopTracksPodium } from "@/components/dashboard/TopTracksPodium";
import { colors, alpha, spacing, fontSize } from "@/lib/theme/tokens";
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
      <View style={{ paddingHorizontal: spacing.screenX }}>
        <SectionHeading label="On repeat" title="Top tracks" align="left" />
      </View>

      {topTracks.isLoading ? (
        <View style={[styles.loadingWrap, { paddingHorizontal: spacing.screenX }]}>
          <Shimmer width="100%" height={160} rounded="xl" />
          <View style={styles.loadingList}>
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
              <View style={styles.podiumWrap}>
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
                <View style={styles.trailing}>
                  <Text style={styles.playCount}>{item.playCount}×</Text>
                  <TrendIcon trend={item.trend} />
                  <Text style={styles.rank}>#{index + 4}</Text>
                </View>
              }
            />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  loadingWrap: { marginTop: 20 },
  loadingList: { marginTop: 12, gap: 8 },
  podiumWrap: { marginBottom: 24, marginTop: 20 },
  trailing: { flexDirection: "row", alignItems: "center", gap: 8 },
  playCount: { fontSize: fontSize[12], color: alpha.white(0.4) },
  rank: { width: 24, textAlign: "right", fontSize: fontSize[11], color: alpha.white(0.3) },
});

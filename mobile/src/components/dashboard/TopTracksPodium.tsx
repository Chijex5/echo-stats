import { View, Text, Image, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors, alpha, fontSize } from "@/lib/theme/tokens";
import type { TopTrack } from "@/lib/api/hooks";

function PodiumSlot({ track, rank, size }: { track: TopTrack; rank: number; size: number }) {
  return (
    <View style={styles.slot}>
      <View style={{ width: size, height: size }}>
        {track.albumImageUrl ? (
          <Image source={{ uri: track.albumImageUrl }} style={{ width: size, height: size, borderRadius: 16 }} />
        ) : (
          <LinearGradient colors={[alpha.spotify(0.25), alpha.teal(0.1)]} style={{ width: size, height: size, borderRadius: 16 }} />
        )}
        <View style={[styles.rankBadge, { backgroundColor: colors.echoGreen }]}>
          <Text style={styles.rankText}>{rank}</Text>
        </View>
      </View>
      <Text numberOfLines={1} style={[styles.title, { maxWidth: size + 24 }]}>
        {track.trackName}
      </Text>
      <Text numberOfLines={1} style={[styles.artist, { maxWidth: size + 24 }]}>
        {track.artistName}
      </Text>
    </View>
  );
}

// Podium order is left-to-right [rank2, rank1, rank3] via array
// reordering, not CSS `order` (no RN equivalent) — mirrors the web's
// visual hierarchy with #1 centered and tallest.
export function TopTracksPodium({ tracks }: { tracks: TopTrack[] }) {
  if (tracks.length < 3) return null;
  const [first, second, third] = tracks;

  return (
    <View style={styles.row}>
      <PodiumSlot track={second} rank={2} size={64} />
      <PodiumSlot track={first} rank={1} size={88} />
      <PodiumSlot track={third} rank={3} size={64} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "flex-end", gap: 8, paddingHorizontal: 20 },
  slot: { flex: 1, alignItems: "center" },
  rankBadge: { position: "absolute", right: -8, top: -8, height: 24, width: 24, alignItems: "center", justifyContent: "center", borderRadius: 999 },
  rankText: { fontSize: fontSize[11], fontFamily: "GeistSansBold", color: colors.onSpotify },
  title: { marginTop: 8, textAlign: "center", fontSize: fontSize[12], fontFamily: "GeistSansSemiBold", color: colors.white },
  artist: { textAlign: "center", fontSize: fontSize[11], color: alpha.white(0.45) },
});

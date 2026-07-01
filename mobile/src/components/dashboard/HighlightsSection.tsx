import { View, Text, Image, StyleSheet } from "react-native";
import { Disc3 } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { GlassCard, EyebrowLabel } from "@/components/ui";
import { alpha, colors, fontSize } from "@/lib/theme/tokens";
import { albumPlaceholderGradient, FALLBACK_ARTIST_GRADIENT } from "@/lib/theme/gradients";
import type { ProfileResponse } from "@/lib/api/hooks";

function AlbumTile({ album, index }: { album: ProfileResponse["highlights"]["topAlbums"][number]; index: number }) {
  return (
    <View style={styles.albumTile}>
      {album.albumImageUrl ? (
        <View style={styles.albumFill}>
          <Image source={{ uri: album.albumImageUrl }} style={styles.albumFill} />
          <View style={[styles.albumOverlay, { backgroundColor: alpha.black(0.25) }]}>
            <Text style={styles.albumPlaysLight}>{album.plays} plays</Text>
            <Text numberOfLines={2} style={styles.albumTitleLight}>
              {album._id}
            </Text>
          </View>
        </View>
      ) : (
        <LinearGradient colors={albumPlaceholderGradient(index)} style={styles.albumOverlay}>
          <Text style={styles.albumPlaysDark}>{album.plays} plays</Text>
          <Text numberOfLines={2} style={styles.albumTitleDark}>
            {album._id}
          </Text>
        </LinearGradient>
      )}
    </View>
  );
}

export function HighlightsSection({ highlights }: { highlights: ProfileResponse["highlights"] }) {
  const albums = highlights.topAlbums.slice(0, 6);

  return (
    <View style={{ gap: 12 }}>
      {albums.length ? (
        <GlassCard padding="md" rounded="2xl">
          <View style={styles.collageHeader}>
            <View>
              <EyebrowLabel>Top album art collage</EyebrowLabel>
              <Text style={styles.collageTitle}>Albums that colored the archive</Text>
            </View>
            <Disc3 size={18} color={alpha.spotify(0.7)} />
          </View>
          <View style={styles.albumGrid}>
            {albums.map((album, i) => (
              <View key={`${album._id}-${i}`} style={{ width: "31%" }}>
                <AlbumTile album={album} index={i} />
              </View>
            ))}
          </View>
        </GlassCard>
      ) : null}

      <View style={styles.row}>
        <GlassCard padding="md" rounded="2xl" style={{ flex: 1 }}>
          <EyebrowLabel>Most played artist</EyebrowLabel>
          {highlights.mostPlayedArtist ? (
            <>
              <View style={{ marginTop: 16, width: 56, height: 56 }}>
                {highlights.mostPlayedArtist.artistImageUrl ? (
                  <Image
                    source={{ uri: highlights.mostPlayedArtist.artistImageUrl }}
                    style={{ width: 56, height: 56, borderRadius: 28 }}
                  />
                ) : (
                  <LinearGradient colors={FALLBACK_ARTIST_GRADIENT} style={styles.artistFallback}>
                    <Text style={styles.artistInitials}>{highlights.mostPlayedArtist._id.slice(0, 2).toUpperCase()}</Text>
                  </LinearGradient>
                )}
              </View>
              <Text numberOfLines={1} style={styles.artistName}>
                {highlights.mostPlayedArtist._id}
              </Text>
              <Text style={styles.mutedSmall}>{highlights.mostPlayedArtist.plays} lifetime plays</Text>
            </>
          ) : (
            <Text style={styles.emptyText}>Still emerging</Text>
          )}
        </GlassCard>

        <GlassCard padding="md" rounded="2xl" style={{ flex: 1 }}>
          <EyebrowLabel>Favorite song this year</EyebrowLabel>
          {highlights.favoriteSongThisYear ? (
            <>
              <Text numberOfLines={2} style={styles.songTitle}>
                {highlights.favoriteSongThisYear.trackName} — {highlights.favoriteSongThisYear.artistName}
              </Text>
              <Text style={styles.mutedSmall}>{highlights.favoriteSongThisYear.plays} plays this year</Text>
            </>
          ) : (
            <Text style={styles.emptyText}>No track yet</Text>
          )}
        </GlassCard>
      </View>

      <GlassCard padding="md" rounded="2xl">
        <EyebrowLabel>Forgotten favorites</EyebrowLabel>
        <Text style={styles.bigCount}>{highlights.forgottenFavoriteCount}</Text>
        <Text style={styles.mutedSmall}>Tracks with enough history to deserve a rediscovery pass.</Text>
      </GlassCard>
    </View>
  );
}

const styles = StyleSheet.create({
  albumTile: { aspectRatio: 1, flex: 1, overflow: "hidden", borderRadius: 18 },
  albumFill: { height: "100%", width: "100%" },
  albumOverlay: { flex: 1, justifyContent: "space-between", padding: 10, position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
  albumPlaysLight: { fontSize: fontSize[9], fontFamily: "GeistSansBold", textTransform: "uppercase", letterSpacing: 1.5, color: alpha.white(0.7) },
  albumTitleLight: { fontSize: fontSize[11], fontFamily: "GeistSansSemiBold", lineHeight: fontSize[11] * 1.1, color: colors.white },
  albumPlaysDark: { fontSize: fontSize[9], fontFamily: "GeistSansBold", textTransform: "uppercase", letterSpacing: 1.5, color: alpha.black(0.5) },
  albumTitleDark: { fontSize: fontSize[11], fontFamily: "GeistSansSemiBold", lineHeight: fontSize[11] * 1.1, color: alpha.black(0.8) },
  collageHeader: { marginBottom: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  collageTitle: { marginTop: 4, fontSize: fontSize[15], fontFamily: "GeistSansSemiBold", color: colors.white },
  albumGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  row: { flexDirection: "row", gap: 12 },
  artistFallback: { width: 56, height: 56, borderRadius: 28, alignItems: "center", justifyContent: "center" },
  artistInitials: { fontSize: fontSize[17], fontFamily: "GeistSansBold", color: colors.black },
  artistName: { marginTop: 12, fontSize: fontSize[15], fontFamily: "GeistSansBold", color: colors.white },
  mutedSmall: { marginTop: 4, fontSize: fontSize[12], color: alpha.white(0.4) },
  emptyText: { marginTop: 16, fontSize: fontSize[13], color: alpha.white(0.4) },
  songTitle: { marginTop: 16, fontSize: fontSize[15], fontFamily: "GeistSansSemiBold", lineHeight: fontSize[15] * 1.3, color: colors.white },
  bigCount: { marginTop: 12, fontSize: fontSize[30], fontFamily: "GeistSansBold", color: colors.white },
});

import { View, Text, Image } from "react-native";
import { Disc3 } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { GlassCard, EyebrowLabel } from "@/components/ui";
import { alpha } from "@/lib/theme/tokens";
import { albumPlaceholderGradient, FALLBACK_ARTIST_GRADIENT } from "@/lib/theme/gradients";
import type { ProfileResponse } from "@/lib/api/hooks";

function AlbumTile({ album, index }: { album: ProfileResponse["highlights"]["topAlbums"][number]; index: number }) {
  return (
    <View className="aspect-square flex-1 overflow-hidden rounded-2xl">
      {album.albumImageUrl ? (
        <View className="h-full w-full">
          <Image source={{ uri: album.albumImageUrl }} style={{ width: "100%", height: "100%" }} />
          <View className="absolute inset-0 justify-between p-2.5" style={{ backgroundColor: alpha.black(0.25) }}>
            <Text className="text-9 font-sans-bold uppercase tracking-widest2 text-white/70">
              {album.plays} plays
            </Text>
            <Text numberOfLines={2} className="text-11 font-sans-semibold leading-tight text-white">
              {album._id}
            </Text>
          </View>
        </View>
      ) : (
        <LinearGradient colors={albumPlaceholderGradient(index)} className="h-full w-full justify-between p-2.5">
          <Text className="text-9 font-sans-bold uppercase tracking-widest2 text-black/50">
            {album.plays} plays
          </Text>
          <Text numberOfLines={2} className="text-11 font-sans-semibold leading-tight text-black/80">
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
    <View className="gap-3">
      {albums.length ? (
        <GlassCard padding="md" rounded="2xl">
          <View className="mb-4 flex-row items-center justify-between">
            <View>
              <EyebrowLabel>Top album art collage</EyebrowLabel>
              <Text className="mt-1 text-15 font-sans-semibold text-white">Albums that colored the archive</Text>
            </View>
            <Disc3 size={18} color={alpha.spotify(0.7)} />
          </View>
          <View className="flex-row flex-wrap gap-2.5">
            {albums.map((album, i) => (
              <View key={`${album._id}-${i}`} style={{ width: "31%" }}>
                <AlbumTile album={album} index={i} />
              </View>
            ))}
          </View>
        </GlassCard>
      ) : null}

      <View className="flex-row gap-3">
        <GlassCard padding="md" rounded="2xl" style={{ flex: 1 }}>
          <EyebrowLabel>Most played artist</EyebrowLabel>
          {highlights.mostPlayedArtist ? (
            <>
              <View className="mt-4" style={{ width: 56, height: 56 }}>
                {highlights.mostPlayedArtist.artistImageUrl ? (
                  <Image
                    source={{ uri: highlights.mostPlayedArtist.artistImageUrl }}
                    style={{ width: 56, height: 56, borderRadius: 28 }}
                  />
                ) : (
                  <LinearGradient
                    colors={FALLBACK_ARTIST_GRADIENT}
                    style={{ width: 56, height: 56, borderRadius: 28, alignItems: "center", justifyContent: "center" }}
                  >
                    <Text className="text-17 font-sans-bold text-black">
                      {highlights.mostPlayedArtist._id.slice(0, 2).toUpperCase()}
                    </Text>
                  </LinearGradient>
                )}
              </View>
              <Text numberOfLines={1} className="mt-3 text-15 font-sans-bold text-white">
                {highlights.mostPlayedArtist._id}
              </Text>
              <Text className="mt-1 text-12 text-white/40">{highlights.mostPlayedArtist.plays} lifetime plays</Text>
            </>
          ) : (
            <Text className="mt-4 text-13 text-white/40">Still emerging</Text>
          )}
        </GlassCard>

        <GlassCard padding="md" rounded="2xl" style={{ flex: 1 }}>
          <EyebrowLabel>Favorite song this year</EyebrowLabel>
          {highlights.favoriteSongThisYear ? (
            <>
              <Text numberOfLines={2} className="mt-4 text-15 font-sans-semibold leading-snug text-white">
                {highlights.favoriteSongThisYear.trackName} — {highlights.favoriteSongThisYear.artistName}
              </Text>
              <Text className="mt-2 text-12 text-white/40">{highlights.favoriteSongThisYear.plays} plays this year</Text>
            </>
          ) : (
            <Text className="mt-4 text-13 text-white/40">No track yet</Text>
          )}
        </GlassCard>
      </View>

      <GlassCard padding="md" rounded="2xl">
        <EyebrowLabel>Forgotten favorites</EyebrowLabel>
        <Text className="mt-3 text-30 font-sans-bold text-white">{highlights.forgottenFavoriteCount}</Text>
        <Text className="mt-1.5 text-13 text-white/40">
          Tracks with enough history to deserve a rediscovery pass.
        </Text>
      </GlassCard>
    </View>
  );
}

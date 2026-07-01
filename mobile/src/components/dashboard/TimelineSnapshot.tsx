import { View, Text, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MotiView } from "moti";
import { GlassCard } from "@/components/ui";
import { gradientForKey } from "@/lib/theme/gradients";
import type { TimelinePagePeriod } from "@/lib/api/hooks";

function ArtistBadge({ name, imageUrl, size }: { name: string; imageUrl?: string; size: number }) {
  const initials = name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  if (imageUrl) {
    return <Image source={{ uri: imageUrl }} style={{ width: size, height: size, borderRadius: size / 2 }} />;
  }
  return (
    <LinearGradient
      colors={gradientForKey(name)}
      style={{ width: size, height: size, borderRadius: size / 2, alignItems: "center", justifyContent: "center" }}
    >
      <Text className="text-12 font-sans-bold text-white">{initials}</Text>
    </LinearGradient>
  );
}

export function TimelineSnapshot({ period }: { period: TimelinePagePeriod }) {
  return (
    <MotiView key={period.id} from={{ opacity: 0, translateY: 16 }} animate={{ opacity: 1, translateY: 0 }} transition={{ duration: 350 }}>
      <GlassCard padding="lg" rounded="2xl">
        <Text className="text-10 uppercase tracking-widest2 text-white/35">Snapshot</Text>
        <Text className="mt-1 text-2xl font-sans-bold text-white">
          {period.monthName} <Text className="font-serif italic text-white/70">{period.year}</Text>
        </Text>
        <Text className="mt-2 text-13 text-white/55">
          You felt <Text className="font-sans-medium text-white/85">{period.mood.toLowerCase()}</Text>. {period.totalHours} hours of music
          across {period.uniqueArtists} unique artists.
        </Text>

        <View className="mt-5 flex-row gap-2.5">
          <View className="flex-1 rounded-xl border border-white/5 bg-white/[0.03] p-3">
            <Text className="text-9 uppercase tracking-widest2 text-white/35">Top artist</Text>
            <View className="mt-2 flex-row items-center gap-2">
              <ArtistBadge name={period.topArtist} imageUrl={period.topArtistImageUrl} size={28} />
              <Text numberOfLines={1} className="flex-1 text-12 font-sans-medium text-white">
                {period.topArtist}
              </Text>
            </View>
          </View>
          <View className="flex-1 rounded-xl border border-white/5 bg-white/[0.03] p-3">
            <Text className="text-9 uppercase tracking-widest2 text-white/35">Top genre</Text>
            <Text numberOfLines={1} className="mt-2 text-12 font-sans-medium text-white">
              {period.topGenre}
            </Text>
          </View>
          <View className="flex-1 rounded-xl border border-white/5 bg-white/[0.03] p-3">
            <Text className="text-9 uppercase tracking-widest2 text-white/35">Mood score</Text>
            <Text className="mt-2 text-14 font-serif italic text-white">{period.moodScore.toFixed(1)} / 10</Text>
          </View>
        </View>

        {period.tracks.length ? (
          <View className="mt-5">
            <Text className="mb-2.5 text-9 uppercase tracking-widest2 text-white/35">Top songs then</Text>
            <View className="gap-3">
              {period.tracks.map((track, i) => (
                <View key={`${track.title}-${i}`} className="flex-row items-center gap-3">
                  <Text className="w-4 text-11 text-white/25">{i + 1}</Text>
                  {track.albumImageUrl ? (
                    <Image source={{ uri: track.albumImageUrl }} className="h-10 w-10 rounded-lg" />
                  ) : (
                    <LinearGradient colors={gradientForKey(track.title)} style={{ width: 40, height: 40, borderRadius: 10 }} />
                  )}
                  <View className="min-w-0 flex-1">
                    <Text numberOfLines={1} className="text-13 font-sans-medium text-white">
                      {track.title}
                    </Text>
                    <Text numberOfLines={1} className="text-11 text-white/45">
                      {track.artist}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        {period.story ? (
          <View className="mt-5 flex-row items-start gap-2.5 border-t border-white/[0.06] pt-4">
            <View className="rounded-full border border-white/10 bg-white/[0.05] px-2 py-1">
              <Text className="text-9 uppercase tracking-widest2 text-white/55">{period.story.tag}</Text>
            </View>
            <Text className="flex-1 text-12 font-serif italic text-white/65">{period.story.line}</Text>
          </View>
        ) : null}
      </GlassCard>
    </MotiView>
  );
}

import { View, Text, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Music2 } from "lucide-react-native";
import { GlassCard, SectionHeading, EyebrowLabel, StatTile } from "@/components/ui";
import { gradientForKey } from "@/lib/theme/gradients";
import { alpha } from "@/lib/theme/tokens";
import type { SotdMemorySnapshot } from "@/lib/api/hooks/types";

type MemorySnapshotProps = {
  data: SotdMemorySnapshot;
};

export function MemorySnapshot({ data }: MemorySnapshotProps) {
  return (
    <View>
      <View className="mb-5">
        <SectionHeading
          label="Memory snapshot"
          title="When it peaked"
          subtitle={`What surrounded this song in ${data.peakMonthLabel}.`}
        />
      </View>

      <View className="gap-4">
        <GlassCard padding="lg" rounded="2xl">
          <View className="mb-3 flex-row items-center gap-1.5">
            <Music2 size={10} color={alpha.white(0.35)} />
            <EyebrowLabel>What else you played</EyebrowLabel>
          </View>
          <View className="gap-2.5">
            {data.snapshotTracks.map((t, i) => {
              const gradient = gradientForKey(t.title);
              return (
                <View key={i} className="flex-row items-center gap-3">
                  <View className="h-10 w-10 overflow-hidden rounded-lg">
                    {t.albumImageUrl ? (
                      <Image source={{ uri: t.albumImageUrl }} className="h-full w-full" />
                    ) : (
                      <LinearGradient colors={gradient} className="h-full w-full" />
                    )}
                  </View>
                  <View className="min-w-0 flex-1">
                    <Text numberOfLines={1} className="text-14 font-sans-medium text-white">
                      {t.title}
                    </Text>
                    <Text numberOfLines={1} className="mt-0.5 text-12 text-white/45">
                      {t.artist}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </GlassCard>

        <GlassCard padding="lg" rounded="2xl">
          {data.topArtist ? (
            <View className="mb-5 flex-row items-center gap-3">
              <View className="h-12 w-12 overflow-hidden rounded-full">
                {data.topArtist.imageUrl ? (
                  <Image source={{ uri: data.topArtist.imageUrl }} className="h-full w-full" />
                ) : (
                  <LinearGradient colors={gradientForKey(data.topArtist.name)} className="h-full w-full items-center justify-center">
                    <Text className="text-13 font-sans-bold text-white">{data.topArtist.initials}</Text>
                  </LinearGradient>
                )}
              </View>
              <View>
                <Text className="text-14 font-sans-semibold text-white">{data.topArtist.name}</Text>
                <Text className="text-12 text-white/45">{data.topArtist.plays} plays that month</Text>
              </View>
            </View>
          ) : null}
          <View className="flex-row gap-3 border-t border-white/5 pt-4">
            <StatTile label="Hours streamed" value={`${data.peakMonthHours}h`} variant="serif-lg" />
            <StatTile label="Peak period" value={data.peakMonthLabel} />
          </View>
        </GlassCard>

        <GlassCard padding="lg" rounded="2xl">
          <View className="mb-3 flex-row items-center justify-between">
            <EyebrowLabel>Snapshot</EyebrowLabel>
            <Text className="text-12 font-sans-medium text-white/50">{data.peakMonthLabel}</Text>
          </View>
          <View className="flex-row flex-wrap gap-2">
            {data.snapshotCollage.map((_, i) => (
              <LinearGradient
                key={i}
                colors={gradientForKey(`collage-${i}`)}
                style={{ width: "30.5%", aspectRatio: 1, borderRadius: 12, opacity: 0.55 + ((i * 13) % 5) * 0.08 }}
              />
            ))}
          </View>
          <Text className="mt-3.5 text-12 leading-relaxed text-white/40">
            You streamed <Text className="font-sans-medium text-white">{data.peakMonthHours} hours</Text> of music that
            month.
          </Text>
        </GlassCard>
      </View>
    </View>
  );
}

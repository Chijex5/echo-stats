import { ScrollView, View, Text, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Clock } from "lucide-react-native";
import { GlassCard, SectionHeading } from "@/components/ui";
import { gradientForKey } from "@/lib/theme/gradients";
import { alpha } from "@/lib/theme/tokens";
import type { SotdRelatedTrack } from "@/lib/api/hooks/types";

type RelatedForgottenProps = {
  related: SotdRelatedTrack[];
};

export function RelatedForgotten({ related }: RelatedForgottenProps) {
  return (
    <View>
      <View className="mb-5">
        <SectionHeading label="More memories" title="Other forgotten favorites" subtitle="What we'd resurface next." />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
        {related.map((r, i) => (
          <GlassCard key={r.title + i} padding="sm" rounded="2xl" style={{ width: 160 }}>
            <View className="overflow-hidden rounded-xl" style={{ aspectRatio: 1 }}>
              {r.albumImageUrl ? (
                <Image source={{ uri: r.albumImageUrl }} className="h-full w-full" />
              ) : (
                <LinearGradient colors={gradientForKey(r.title)} className="h-full w-full" />
              )}
              <View className="absolute inset-0 bg-black/12" />
              <View className="absolute left-2 top-2 rounded-full bg-black/45 px-2 py-1">
                <Text className="text-9 font-sans-semibold uppercase tracking-widest text-white/90">{r.tag}</Text>
              </View>
            </View>
            <Text numberOfLines={1} className="mt-2.5 text-13 font-sans-semibold text-white">
              {r.title}
            </Text>
            <Text numberOfLines={1} className="mt-0.5 text-11 text-white/45">
              {r.artist}
            </Text>
            <View className="mt-2 flex-row items-center gap-1.5">
              <Clock size={10} color={alpha.white(0.35)} />
              <Text numberOfLines={1} className="flex-1 text-10 text-white/35">
                Last played {r.lastPlayed}
              </Text>
            </View>
          </GlassCard>
        ))}
      </ScrollView>
    </View>
  );
}

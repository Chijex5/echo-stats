import { View, Text, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Play, Heart, Share2, Disc3, Sparkles } from "lucide-react-native";
import { GlassCard, PrimaryButton, StatTile, AmbientBlob, EyebrowLabel } from "@/components/ui";
import { colors, alpha, shadows } from "@/lib/theme/tokens";
import type { SotdSong, SotdStats } from "@/lib/api/hooks/types";

type SotdHeroProps = {
  song: SotdSong;
  stats: SotdStats;
  onShare: () => void;
};

const WEEKDAY = new Date().toLocaleDateString("en-US", { weekday: "long" });

export function SotdHero({ song, stats, onShare }: SotdHeroProps) {
  return (
    <View>
      <AmbientBlob color={song.gradientFrom} size={340} blur={70} style={{ top: -80, left: -60 }} durationMs={8000} />
      <AmbientBlob color={song.gradientTo} size={260} blur={70} style={{ top: 40, right: -60 }} durationMs={7000} delayMs={300} />

      <View className="items-center px-2">
        <View className="mb-5 flex-row items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5">
          <Sparkles size={11} color={colors.spotify} />
          <Text className="text-10 uppercase tracking-widest2 text-white/60">
            Song of the day · {WEEKDAY}
          </Text>
        </View>
        <Text className="text-center text-26 font-sans-bold leading-tight text-white">
          A song you <Text className="font-serif italic text-white/90">loved</Text> once.
        </Text>
        <Text className="mt-2 text-center text-13 text-white/50">
          A memory waiting to return. Today, we found it.
        </Text>
      </View>

      <View className="mt-7">
        <GlassCard padding="lg" rounded="2xl" glow>
          <View className="items-center gap-6">
            <View className="h-44 w-44 overflow-hidden rounded-2xl" style={shadows.ambient}>
              {song.albumImageUrl ? (
                <Image source={{ uri: song.albumImageUrl }} className="h-full w-full" />
              ) : (
                <LinearGradient colors={[song.gradientFrom, song.gradientTo]} className="h-full w-full" />
              )}
              <View className="absolute inset-0 bg-black/15" />
              <Disc3 size={28} color={alpha.white(0.3)} style={{ position: "absolute", bottom: 12, right: 12 }} />
            </View>

            <View className="w-full items-center">
              <EyebrowLabel className="mb-1.5">Forgotten favorite</EyebrowLabel>
              <Text className="text-center text-20 font-sans-bold leading-tight text-white">{song.title}</Text>
              <Text className="mt-1 text-center text-13 text-white/55">
                {song.artist} · {song.album} · {song.released}
              </Text>
            </View>

            <View className="w-full flex-row gap-3">
              <StatTile label="Past plays" value={stats.pastPlays} variant="serif-lg" />
              <StatTile label="Last played" value={stats.lastPlayed} />
            </View>

            <View className="w-full gap-2.5">
              <PrimaryButton label="Play preview" variant="spotify-solid" icon={Play} fullWidth onPress={() => {}} />
              <View className="flex-row gap-2.5">
                <View className="flex-1">
                  <PrimaryButton label="Save" variant="outline" icon={Heart} fullWidth onPress={() => {}} />
                </View>
                <View className="flex-1">
                  <PrimaryButton label="Share card" variant="outline" icon={Share2} fullWidth onPress={onShare} />
                </View>
              </View>
            </View>
          </View>
        </GlassCard>
      </View>
    </View>
  );
}

import { useState } from "react";
import { View, Text, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Shuffle, X, Clock, Users, Music2 } from "lucide-react-native";
import { GlassCard, PrimaryButton, EyebrowLabel, BottomSheet } from "@/components/ui";
import { colors, alpha } from "@/lib/theme/tokens";
import { gradientForKey } from "@/lib/theme/gradients";
import type { TimelinePagePeriod } from "@/lib/api/hooks";

function MemoryStat({ icon: Icon, label, value }: { icon: typeof Clock; label: string; value: string }) {
  return (
    <View className="flex-1 rounded-xl border border-white/5 bg-white/[0.03] p-3">
      <View className="flex-row items-center gap-1.5">
        <Icon size={11} color={alpha.white(0.35)} />
        <Text className="text-9 uppercase tracking-widest2 text-white/35">{label}</Text>
      </View>
      <Text numberOfLines={1} className="mt-1.5 text-13 font-sans-semibold text-white">
        {value}
      </Text>
    </View>
  );
}

function MemoryCard({ period, onAnother, onClose }: { period: TimelinePagePeriod; onAnother: () => void; onClose: () => void }) {
  return (
    <View>
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1">
          <Text className="text-9 uppercase tracking-widest2 text-white/35">You were here</Text>
          <Text className="mt-1 text-26 font-sans-bold leading-tight text-white">{period.monthName}</Text>
          <Text className="text-17 font-serif italic text-white/45">{period.year}</Text>
          <Text className="mt-2 text-12 text-white/45">
            Mood: <Text className="font-sans-medium text-white/80">{period.mood.toLowerCase()}</Text>
          </Text>
        </View>
        <View className="h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.07] bg-white/[0.04]">
          <Text className="text-lg font-sans-bold" style={{ color: colors.echoGreen }}>
            {period.moodScore.toFixed(1)}
          </Text>
          <Text className="text-9 uppercase tracking-widest2 text-white/25">mood</Text>
        </View>
      </View>

      <View className="mt-5 flex-row gap-2">
        <MemoryStat icon={Clock} label="Hours" value={`${period.totalHours}h`} />
        <MemoryStat icon={Users} label="Artists" value={String(period.uniqueArtists)} />
        <MemoryStat icon={Music2} label="Top" value={period.topGenre} />
      </View>

      {period.tracks.length ? (
        <View className="mt-5 gap-3">
          <Text className="text-9 uppercase tracking-widest2 text-white/25">Top songs</Text>
          {period.tracks.slice(0, 3).map((track, i) => (
            <View key={`${track.title}-${i}`} className="flex-row items-center gap-3">
              <Text className="w-4 text-10 text-white/20">{i + 1}</Text>
              {track.albumImageUrl ? (
                <Image source={{ uri: track.albumImageUrl }} className="h-9 w-9 rounded-xl" />
              ) : (
                <LinearGradient colors={gradientForKey(track.title)} style={{ width: 36, height: 36, borderRadius: 12 }} />
              )}
              <View className="min-w-0 flex-1">
                <Text numberOfLines={1} className="text-13 font-sans-medium text-white">
                  {track.title}
                </Text>
                <Text numberOfLines={1} className="text-11 text-white/40">
                  {track.artist}
                </Text>
              </View>
            </View>
          ))}
        </View>
      ) : null}

      {period.story ? (
        <View className="mt-5 flex-row items-start gap-2.5 border-t border-white/[0.06] pt-4">
          <View className="rounded-full border border-white/[0.08] bg-white/[0.04] px-2 py-0.5">
            <Text className="text-9 uppercase tracking-widest2 text-white/45">{period.story.tag}</Text>
          </View>
          <Text className="flex-1 text-12 font-serif italic text-white/55">{period.story.line}</Text>
        </View>
      ) : null}

      <View className="mt-6 flex-row gap-2.5">
        <PrimaryButton label="Another memory" icon={Shuffle} variant="spotify-solid" fullWidth onPress={onAnother} />
        <PrimaryButton label="Close" icon={X} variant="outline" onPress={onClose} />
      </View>
    </View>
  );
}

export function RandomNostalgiaSheet({ periods }: { periods: TimelinePagePeriod[] }) {
  const [open, setOpen] = useState(false);
  const [period, setPeriod] = useState<TimelinePagePeriod | null>(null);

  function pickRandom() {
    if (!periods.length) return;
    setPeriod(periods[Math.floor(Math.random() * periods.length)]);
  }

  function openSheet() {
    pickRandom();
    setOpen(true);
  }

  return (
    <>
      <GlassCard padding="lg" rounded="2xl">
        <EyebrowLabel>Surprise me</EyebrowLabel>
        <Text className="mt-3 text-2xl font-sans-bold leading-tight text-white">
          Take me somewhere <Text className="font-serif italic" style={{ color: colors.echoGreen }}>random</Text>.
        </Text>
        <Text className="mt-2 text-13 text-white/50">
          We&apos;ll drop you into a forgotten month — the songs, the mood, the memories that came with it.
        </Text>
        <View className="mt-5">
          <PrimaryButton label="Jump to a random memory" icon={Shuffle} onPress={openSheet} disabled={!periods.length} />
        </View>
      </GlassCard>

      <BottomSheet visible={open} onClose={() => setOpen(false)} maxHeight="85%">
        {period ? <MemoryCard period={period} onAnother={pickRandom} onClose={() => setOpen(false)} /> : null}
      </BottomSheet>
    </>
  );
}

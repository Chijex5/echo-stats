import { useState } from "react";
import { View, Text, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Calendar, Heart, Moon, Sparkles, CloudRain, type LucideIcon } from "lucide-react-native";
import { GlassCard, SectionHeading, EyebrowLabel, Pill } from "@/components/ui";
import { Sparkline } from "@/components/charts";
import { MoodRadar } from "./MoodRadar";
import { snapshotGradientFor } from "./sotdColors";
import type {
  SotdAlgoReason,
  SotdAlgoIconName,
  SotdMoodReconstruction,
  SotdMemorySnapshot,
  SotdSong,
} from "@/lib/api/hooks/types";

const ICON_MAP: Record<SotdAlgoIconName, LucideIcon> = { Calendar, Heart, Moon, Sparkles, CloudRain };

type Tab = "why" | "mood" | "month";

const TABS: { key: Tab; label: string }[] = [
  { key: "why", label: "Why this" },
  { key: "mood", label: "The mood" },
  { key: "month", label: "That month" },
];

const HOUR_BAR_HEIGHT = 90;

function buildMoodRadar(hourHeat: SotdMoodReconstruction["hourHeat"]) {
  const total = hourHeat.reduce((s, h) => s + h.v, 0) || 1;
  const morning = hourHeat.filter((h) => h.hour >= 6 && h.hour <= 11).reduce((s, h) => s + h.v, 0);
  const night = hourHeat.filter((h) => h.hour >= 22 || h.hour <= 4).reduce((s, h) => s + h.v, 0);
  const afternoon = hourHeat.filter((h) => h.hour >= 12 && h.hour <= 17).reduce((s, h) => s + h.v, 0);
  const evening = hourHeat.filter((h) => h.hour >= 18 && h.hour <= 21).reduce((s, h) => s + h.v, 0);

  return [
    { axis: "Energy", value: Math.round((evening / total) * 100) },
    { axis: "Calm", value: Math.round((morning / total) * 100) },
    { axis: "Nostalgia", value: Math.round((night / total) * 150) },
    { axis: "Joy", value: Math.round((afternoon / total) * 80) },
    { axis: "Melancholy", value: Math.round((night / total) * 120) },
  ];
}

type InsightTabsProps = {
  reasons: SotdAlgoReason[];
  mood: SotdMoodReconstruction;
  snapshot: SotdMemorySnapshot;
  song: SotdSong;
};

// Replaces three separate stacked card-walls (WhyWePickedThis,
// MoodReconstruction's 4 cards, MemorySnapshot's 3 cards) with one card
// and a tab switcher — the user chooses what they're curious about
// instead of scrolling past everything whether they care or not.
export function InsightTabs({ reasons, mood, snapshot, song }: InsightTabsProps) {
  const [tab, setTab] = useState<Tab>("why");
  const maxHour = Math.max(...mood.hourHeat.map((h) => h.v), 1);

  return (
    <View>
      <View className="mb-4">
        <SectionHeading label="Dig deeper" title="What's behind this pick" />
      </View>

      <View className="mb-4 flex-row gap-2">
        {TABS.map((t) => (
          <Pill key={t.key} label={t.label} variant="spotify" selected={tab === t.key} onPress={() => setTab(t.key)} />
        ))}
      </View>

      <GlassCard padding="lg" rounded="2xl">
        {tab === "why" ? (
          <View className="flex-row flex-wrap gap-y-6">
            {reasons.map((r) => {
              const Icon = ICON_MAP[r.icon];
              return (
                <View key={r.label} className="w-1/2 items-center px-1">
                  <View className="mb-3 h-14 w-14 items-center justify-center rounded-2xl border border-white/8 bg-white/[0.04]">
                    <Icon size={18} color="rgba(255,255,255,0.7)" strokeWidth={1.8} />
                  </View>
                  <Text className="mb-1 text-center text-[13px] font-sans-semibold text-white">{r.label}</Text>
                  <Text className="text-center text-[11px] leading-relaxed text-white/45">{r.desc}</Text>
                </View>
              );
            })}
          </View>
        ) : tab === "mood" ? (
          <View className="gap-6">
            <View className="items-center">
              <EyebrowLabel className="mb-2 self-start">Emotional fingerprint</EyebrowLabel>
              <MoodRadar data={buildMoodRadar(mood.hourHeat)} color={song.gradientFrom} size={200} />
            </View>
            <View className="border-t border-white/5 pt-5">
              <View className="mb-3 flex-row items-center justify-between">
                <EyebrowLabel>Listening by hour</EyebrowLabel>
                <Text className="text-[11px] text-white/40">
                  Peak at <Text className="font-sans-medium text-white">{mood.peakHourLabel}</Text>
                </Text>
              </View>
              <View className="flex-row items-end gap-[2px]" style={{ height: HOUR_BAR_HEIGHT }}>
                {mood.hourHeat.map((h) => {
                  const peak = h.hour >= 23 || h.hour <= 2;
                  return (
                    <View
                      key={h.hour}
                      className="flex-1 rounded-t-sm"
                      style={{
                        height: Math.max(6, Math.round((h.v / maxHour) * HOUR_BAR_HEIGHT)),
                        backgroundColor: peak ? song.gradientFrom : "rgba(255,255,255,0.10)",
                      }}
                    />
                  );
                })}
              </View>
            </View>
          </View>
        ) : (
          <View className="gap-5">
            {snapshot.topArtist ? (
              <View className="flex-row items-center gap-3">
                <View className="h-12 w-12 overflow-hidden rounded-full">
                  {snapshot.topArtist.imageUrl ? (
                    <Image source={{ uri: snapshot.topArtist.imageUrl }} className="h-full w-full" />
                  ) : (
                    <LinearGradient
                      colors={snapshotGradientFor(snapshot.topArtist.color)}
                      className="h-full w-full items-center justify-center"
                    >
                      <Text className="text-[13px] font-sans-bold text-white">{snapshot.topArtist.initials}</Text>
                    </LinearGradient>
                  )}
                </View>
                <View>
                  <Text className="text-[14px] font-sans-semibold text-white">{snapshot.topArtist.name}</Text>
                  <Text className="text-[12px] text-white/45">Your top artist in {snapshot.peakMonthLabel}</Text>
                </View>
              </View>
            ) : null}

            <View>
              <EyebrowLabel className="mb-2.5">What else you played</EyebrowLabel>
              <View className="gap-2.5">
                {snapshot.snapshotTracks.slice(0, 3).map((t, i) => (
                  <View key={i} className="flex-row items-center gap-3">
                    <View className="h-9 w-9 overflow-hidden rounded-lg">
                      {t.albumImageUrl ? (
                        <Image source={{ uri: t.albumImageUrl }} className="h-full w-full" />
                      ) : (
                        <LinearGradient colors={snapshotGradientFor(t.color)} className="h-full w-full" />
                      )}
                    </View>
                    <View className="min-w-0 flex-1">
                      <Text numberOfLines={1} className="text-[13px] font-sans-medium text-white">
                        {t.title}
                      </Text>
                      <Text numberOfLines={1} className="text-[11px] text-white/45">
                        {t.artist}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>

            <View className="border-t border-white/5 pt-5">
              <EyebrowLabel className="mb-2">Plays that month</EyebrowLabel>
              <Sparkline data={mood.monthTrend.map((m) => m.v)} width={260} height={56} color={song.gradientFrom} />
              <Text className="mt-2 text-[12px] text-white/45">
                You streamed <Text className="font-sans-medium text-white">{snapshot.peakMonthHours} hours</Text>{" "}
                that month.
              </Text>
            </View>
          </View>
        )}
      </GlassCard>
    </View>
  );
}

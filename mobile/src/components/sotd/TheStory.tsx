import { Text } from "react-native";
import { EyebrowLabel, GlassCard } from "@/components/ui";
import type { SotdStoryBeat } from "@/lib/api/hooks/types";

type TheStoryProps = {
  beats: SotdStoryBeat[];
};

// app/api/dashboard/song-of-the-day/route.ts always returns these 4 beats
// in this fixed order (peak month, night %, days since last play, season
// anchor), so this reads as one flowing sentence instead of a 4-row stat
// list — a narrative fits "song of the day" better than a mini dashboard.
export function TheStory({ beats }: TheStoryProps) {
  const [peak, night, sinceLastPlay, season] = beats;
  if (!peak || !night || !sinceLastPlay || !season) return null;

  return (
    <GlassCard padding="lg" rounded="2xl">
      <EyebrowLabel className="mb-3">The story so far</EyebrowLabel>
      <Text className="text-[15px] leading-relaxed text-white/75">
        You came back to this song <Text className="font-sans-bold text-white">{peak.stat}</Text> {peak.label}, and{" "}
        <Text className="font-sans-bold text-white">{night.stat}</Text> {night.label}. It&apos;s been{" "}
        <Text className="font-sans-bold text-white">{sinceLastPlay.stat}</Text> {sinceLastPlay.label} — making it
        your <Text className="font-serif italic text-echo-green">{season.stat}</Text> {season.label}.
      </Text>
    </GlassCard>
  );
}

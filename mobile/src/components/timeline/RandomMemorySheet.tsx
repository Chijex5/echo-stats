import { useEffect, useState } from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { Shuffle } from "lucide-react-native";
import { BottomSheet, PrimaryButton } from "@/components/ui";
import { colors, alpha, fontSize, trackingWidest2 } from "@/lib/theme/tokens";
import { colorForKey } from "@/lib/theme/gradients";
import type { TimelinePagePeriod } from "@/lib/api/hooks";

type RandomMemorySheetProps = {
  periods: TimelinePagePeriod[];
  visible: boolean;
  onClose: () => void;
};

// The shuffle-die of the Timeline page: opening it drops you into a random
// month — songs, mood, story — triggered from the header dice button
// instead of occupying a whole teaser card in the feed.
export function RandomMemorySheet({ periods, visible, onClose }: RandomMemorySheetProps) {
  const [period, setPeriod] = useState<TimelinePagePeriod | null>(null);

  function pickRandom() {
    if (!periods.length) return;
    setPeriod(periods[Math.floor(Math.random() * periods.length)]);
  }

  useEffect(() => {
    if (visible) pickRandom();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  if (!period) return null;

  return (
    <BottomSheet visible={visible} onClose={onClose} maxHeight="85%">
      <Text style={styles.eyebrow}>You were here</Text>
      <Text style={styles.month}>
        {period.monthName} <Text style={styles.year}>{period.year}</Text>
      </Text>
      <View style={styles.moodRow}>
        <View style={[styles.moodDot, { backgroundColor: colorForKey(period.mood) }]} />
        <Text style={styles.moodText}>
          Felt {period.mood.toLowerCase()} · {period.moodScore.toFixed(1)} / 10
        </Text>
      </View>

      <View style={styles.stats}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{period.totalHours}h</Text>
          <Text style={styles.statLabel}>of music</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{period.uniqueArtists}</Text>
          <Text style={styles.statLabel}>artists</Text>
        </View>
        <View style={styles.stat}>
          <Text numberOfLines={1} style={styles.statValue}>
            {period.topGenre}
          </Text>
          <Text style={styles.statLabel}>top genre</Text>
        </View>
      </View>

      {period.tracks.length ? (
        <View style={styles.tracks}>
          {period.tracks.slice(0, 3).map((track, i) => (
            <View key={`${track.title}-${i}`} style={styles.trackRow}>
              <Text style={styles.trackIndex}>{i + 1}</Text>
              {track.albumImageUrl ? (
                <Image source={{ uri: track.albumImageUrl }} style={styles.trackThumb} />
              ) : (
                <View style={[styles.trackThumb, { backgroundColor: colorForKey(track.title) }]} />
              )}
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text numberOfLines={1} style={styles.trackTitle}>
                  {track.title}
                </Text>
                <Text numberOfLines={1} style={styles.trackArtist}>
                  {track.artist}
                </Text>
              </View>
            </View>
          ))}
        </View>
      ) : null}

      {period.story ? <Text style={styles.story}>{period.story.line}</Text> : null}

      <View style={{ marginTop: 24 }}>
        <PrimaryButton label="Another memory" icon={Shuffle} variant="spotify-solid" fullWidth onPress={pickRandom} />
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  eyebrow: {
    fontSize: fontSize[9],
    fontFamily: "GeistSans",
    textTransform: "uppercase",
    letterSpacing: trackingWidest2(fontSize[9]),
    color: alpha.white(0.35),
  },
  month: { marginTop: 4, fontSize: fontSize[26], fontFamily: "GeistSansBold", color: colors.white },
  year: { fontFamily: "PlayfairDisplayItalic", fontStyle: "italic", color: alpha.white(0.5) },
  moodRow: { marginTop: 8, flexDirection: "row", alignItems: "center", gap: 7 },
  moodDot: { width: 6, height: 6, borderRadius: 3 },
  moodText: { fontSize: fontSize[12], fontFamily: "GeistSansMedium", color: alpha.white(0.55) },

  stats: { marginTop: 20, flexDirection: "row", gap: 12 },
  stat: { flex: 1, minWidth: 0 },
  statValue: { fontSize: fontSize[17], fontFamily: "GeistSansBold", color: colors.white },
  statLabel: {
    marginTop: 2,
    fontSize: fontSize[9],
    fontFamily: "GeistSans",
    textTransform: "uppercase",
    letterSpacing: trackingWidest2(fontSize[9]),
    color: alpha.white(0.35),
  },

  tracks: { marginTop: 20, gap: 10 },
  trackRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  trackIndex: { width: 14, fontSize: fontSize[10], fontFamily: "GeistSans", color: alpha.white(0.25) },
  trackThumb: { width: 40, height: 40, borderRadius: 6 },
  trackTitle: { fontSize: fontSize[13], fontFamily: "GeistSansMedium", color: colors.white },
  trackArtist: { fontSize: fontSize[11], fontFamily: "GeistSans", color: alpha.white(0.4) },

  story: {
    marginTop: 18,
    fontSize: fontSize[12],
    fontFamily: "PlayfairDisplayItalic",
    fontStyle: "italic",
    lineHeight: fontSize[12] * 1.45,
    color: alpha.white(0.55),
  },
});

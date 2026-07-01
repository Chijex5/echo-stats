import { useState } from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Shuffle, X, Clock, Users, Music2 } from "lucide-react-native";
import { GlassCard, PrimaryButton, EyebrowLabel, BottomSheet } from "@/components/ui";
import { colors, alpha, fontSize, trackingWidest2 } from "@/lib/theme/tokens";
import { gradientForKey } from "@/lib/theme/gradients";
import type { TimelinePagePeriod } from "@/lib/api/hooks";

function MemoryStat({ icon: Icon, label, value }: { icon: typeof Clock; label: string; value: string }) {
  return (
    <View style={styles.statTile}>
      <View style={styles.statHeader}>
        <Icon size={11} color={alpha.white(0.35)} />
        <Text style={styles.statLabel}>{label}</Text>
      </View>
      <Text numberOfLines={1} style={styles.statValue}>
        {value}
      </Text>
    </View>
  );
}

function MemoryCard({ period, onAnother, onClose }: { period: TimelinePagePeriod; onAnother: () => void; onClose: () => void }) {
  return (
    <View>
      <View style={styles.headRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.eyebrow}>You were here</Text>
          <Text style={styles.monthName}>{period.monthName}</Text>
          <Text style={styles.year}>{period.year}</Text>
          <Text style={styles.mood}>
            Mood: <Text style={styles.moodValue}>{period.mood.toLowerCase()}</Text>
          </Text>
        </View>
        <View style={styles.scoreBadge}>
          <Text style={styles.scoreValue}>{period.moodScore.toFixed(1)}</Text>
          <Text style={styles.scoreLabel}>mood</Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <MemoryStat icon={Clock} label="Hours" value={`${period.totalHours}h`} />
        <MemoryStat icon={Users} label="Artists" value={String(period.uniqueArtists)} />
        <MemoryStat icon={Music2} label="Top" value={period.topGenre} />
      </View>

      {period.tracks.length ? (
        <View style={styles.tracksSection}>
          <Text style={[styles.eyebrow, { color: alpha.white(0.25) }]}>Top songs</Text>
          {period.tracks.slice(0, 3).map((track, i) => (
            <View key={`${track.title}-${i}`} style={styles.trackRow}>
              <Text style={styles.trackIndex}>{i + 1}</Text>
              {track.albumImageUrl ? (
                <Image source={{ uri: track.albumImageUrl }} style={styles.trackThumb} />
              ) : (
                <LinearGradient colors={gradientForKey(track.title)} style={styles.trackThumb} />
              )}
              <View style={styles.trackText}>
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

      {period.story ? (
        <View style={styles.storyRow}>
          <View style={styles.storyTagWrap}>
            <Text style={styles.storyTag}>{period.story.tag}</Text>
          </View>
          <Text style={styles.storyLine}>{period.story.line}</Text>
        </View>
      ) : null}

      <View style={styles.buttonsRow}>
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
        <Text style={styles.teaserTitle}>
          Take me somewhere <Text style={styles.teaserAccent}>random</Text>.
        </Text>
        <Text style={styles.teaserSubtitle}>
          We&apos;ll drop you into a forgotten month — the songs, the mood, the memories that came with it.
        </Text>
        <View style={{ marginTop: 20 }}>
          <PrimaryButton label="Jump to a random memory" icon={Shuffle} onPress={openSheet} disabled={!periods.length} />
        </View>
      </GlassCard>

      <BottomSheet visible={open} onClose={() => setOpen(false)} maxHeight="85%">
        {period ? <MemoryCard period={period} onAnother={pickRandom} onClose={() => setOpen(false)} /> : null}
      </BottomSheet>
    </>
  );
}

const styles = StyleSheet.create({
  statTile: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: alpha.white(0.05),
    backgroundColor: alpha.white(0.03),
    padding: 12,
  },
  statHeader: { flexDirection: "row", alignItems: "center", gap: 6 },
  statLabel: {
    fontSize: fontSize[9],
    fontFamily: "GeistSans",
    textTransform: "uppercase",
    letterSpacing: trackingWidest2(fontSize[9]),
    color: alpha.white(0.35),
  },
  statValue: { marginTop: 6, fontSize: fontSize[13], fontFamily: "GeistSansSemiBold", color: colors.white },
  headRow: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 12 },
  eyebrow: {
    fontSize: fontSize[9],
    fontFamily: "GeistSans",
    textTransform: "uppercase",
    letterSpacing: trackingWidest2(fontSize[9]),
    color: alpha.white(0.35),
  },
  monthName: { marginTop: 4, fontSize: fontSize[26], fontFamily: "GeistSansBold", lineHeight: fontSize[26] * 1.1, color: colors.white },
  year: { fontSize: fontSize[17], fontFamily: "PlayfairDisplayItalic", fontStyle: "italic", color: alpha.white(0.45) },
  mood: { marginTop: 8, fontSize: fontSize[12], color: alpha.white(0.45) },
  moodValue: { fontFamily: "GeistSansMedium", color: alpha.white(0.8) },
  scoreBadge: {
    height: 56,
    width: 56,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: alpha.white(0.07),
    backgroundColor: alpha.white(0.04),
  },
  scoreValue: { fontSize: fontSize[18], fontFamily: "GeistSansBold", color: colors.echoGreen },
  scoreLabel: {
    fontSize: fontSize[9],
    textTransform: "uppercase",
    letterSpacing: trackingWidest2(fontSize[9]),
    color: alpha.white(0.25),
  },
  statsRow: { marginTop: 20, flexDirection: "row", gap: 8 },
  tracksSection: { marginTop: 20, gap: 12 },
  trackRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  trackIndex: { width: 16, fontSize: fontSize[10], color: alpha.white(0.2) },
  trackThumb: { width: 36, height: 36, borderRadius: 12 },
  trackText: { flex: 1, minWidth: 0 },
  trackTitle: { fontSize: fontSize[13], fontFamily: "GeistSansMedium", color: colors.white },
  trackArtist: { fontSize: fontSize[11], color: alpha.white(0.4) },
  storyRow: {
    marginTop: 20,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    borderTopWidth: 1,
    borderColor: alpha.white(0.06),
    paddingTop: 16,
  },
  storyTagWrap: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: alpha.white(0.08),
    backgroundColor: alpha.white(0.04),
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  storyTag: {
    fontSize: fontSize[9],
    textTransform: "uppercase",
    letterSpacing: trackingWidest2(fontSize[9]),
    color: alpha.white(0.45),
  },
  storyLine: { flex: 1, fontSize: fontSize[12], fontFamily: "PlayfairDisplayItalic", fontStyle: "italic", color: alpha.white(0.55) },
  buttonsRow: { marginTop: 24, flexDirection: "row", gap: 10 },
  teaserTitle: { marginTop: 12, fontSize: fontSize[24], fontFamily: "GeistSansBold", lineHeight: fontSize[24] * 1.15, color: colors.white },
  teaserAccent: { fontFamily: "PlayfairDisplayItalic", fontStyle: "italic", color: colors.echoGreen },
  teaserSubtitle: { marginTop: 8, fontSize: fontSize[13], color: alpha.white(0.5) },
});

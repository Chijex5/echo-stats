import { View, Text, Image, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MotiView } from "moti";
import { GlassCard } from "@/components/ui";
import { gradientForKey } from "@/lib/theme/gradients";
import { colors, alpha, fontSize, trackingWidest2 } from "@/lib/theme/tokens";
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
      <Text style={styles.badgeInitials}>{initials}</Text>
    </LinearGradient>
  );
}

export function TimelineSnapshot({ period }: { period: TimelinePagePeriod }) {
  return (
    <MotiView key={period.id} from={{ opacity: 0, translateY: 16 }} animate={{ opacity: 1, translateY: 0 }} transition={{ duration: 350 }}>
      <GlassCard padding="lg" rounded="2xl">
        <Text style={styles.eyebrow}>Snapshot</Text>
        <Text style={styles.heading}>
          {period.monthName} <Text style={styles.headingAccent}>{period.year}</Text>
        </Text>
        <Text style={styles.summary}>
          You felt <Text style={styles.summaryStrong}>{period.mood.toLowerCase()}</Text>. {period.totalHours} hours of music
          across {period.uniqueArtists} unique artists.
        </Text>

        <View style={styles.statsRow}>
          <View style={styles.statTile}>
            <Text style={styles.statLabel}>Top artist</Text>
            <View style={styles.statArtistRow}>
              <ArtistBadge name={period.topArtist} imageUrl={period.topArtistImageUrl} size={28} />
              <Text numberOfLines={1} style={styles.statArtistName}>
                {period.topArtist}
              </Text>
            </View>
          </View>
          <View style={styles.statTile}>
            <Text style={styles.statLabel}>Top genre</Text>
            <Text numberOfLines={1} style={styles.statValue}>
              {period.topGenre}
            </Text>
          </View>
          <View style={styles.statTile}>
            <Text style={styles.statLabel}>Mood score</Text>
            <Text style={styles.statValueSerif}>{period.moodScore.toFixed(1)} / 10</Text>
          </View>
        </View>

        {period.tracks.length ? (
          <View style={{ marginTop: 20 }}>
            <Text style={[styles.eyebrow, { marginBottom: 10 }]}>Top songs then</Text>
            <View style={{ gap: 12 }}>
              {period.tracks.map((track, i) => (
                <View key={`${track.title}-${i}`} style={styles.trackRow}>
                  <Text style={styles.trackIndex}>{i + 1}</Text>
                  {track.albumImageUrl ? (
                    <Image source={{ uri: track.albumImageUrl }} style={styles.trackThumbImage} />
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
      </GlassCard>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  badgeInitials: { fontSize: fontSize[12], fontFamily: "GeistSansBold", color: colors.white },
  eyebrow: {
    fontSize: fontSize[10],
    textTransform: "uppercase",
    letterSpacing: trackingWidest2(fontSize[10]),
    color: alpha.white(0.35),
  },
  heading: { marginTop: 4, fontSize: fontSize[24], fontFamily: "GeistSansBold", color: colors.white },
  headingAccent: { fontFamily: "PlayfairDisplayItalic", fontStyle: "italic", color: alpha.white(0.7) },
  summary: { marginTop: 8, fontSize: fontSize[13], color: alpha.white(0.55) },
  summaryStrong: { fontFamily: "GeistSansMedium", color: alpha.white(0.85) },
  statsRow: { marginTop: 20, flexDirection: "row", gap: 10 },
  statTile: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: alpha.white(0.05),
    backgroundColor: alpha.white(0.03),
    padding: 12,
  },
  statLabel: {
    fontSize: fontSize[9],
    textTransform: "uppercase",
    letterSpacing: trackingWidest2(fontSize[9]),
    color: alpha.white(0.35),
  },
  statArtistRow: { marginTop: 8, flexDirection: "row", alignItems: "center", gap: 8 },
  statArtistName: { flex: 1, fontSize: fontSize[12], fontFamily: "GeistSansMedium", color: colors.white },
  statValue: { marginTop: 8, fontSize: fontSize[12], fontFamily: "GeistSansMedium", color: colors.white },
  statValueSerif: { marginTop: 8, fontSize: fontSize[14], fontFamily: "PlayfairDisplayItalic", fontStyle: "italic", color: colors.white },
  trackRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  trackIndex: { width: 16, fontSize: fontSize[11], color: alpha.white(0.25) },
  trackThumbImage: { height: 40, width: 40, borderRadius: 8 },
  trackThumb: { width: 40, height: 40, borderRadius: 10 },
  trackText: { flex: 1, minWidth: 0 },
  trackTitle: { fontSize: fontSize[13], fontFamily: "GeistSansMedium", color: colors.white },
  trackArtist: { fontSize: fontSize[11], color: alpha.white(0.45) },
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
    borderColor: alpha.white(0.1),
    backgroundColor: alpha.white(0.05),
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  storyTag: {
    fontSize: fontSize[9],
    textTransform: "uppercase",
    letterSpacing: trackingWidest2(fontSize[9]),
    color: alpha.white(0.55),
  },
  storyLine: { flex: 1, fontSize: fontSize[12], fontFamily: "PlayfairDisplayItalic", fontStyle: "italic", color: alpha.white(0.65) },
});

import { View, Text, Image, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Music2 } from "lucide-react-native";
import { GlassCard, SectionHeading, EyebrowLabel, StatTile } from "@/components/ui";
import { gradientForKey } from "@/lib/theme/gradients";
import { alpha, colors, fontSize } from "@/lib/theme/tokens";
import type { SotdMemorySnapshot } from "@/lib/api/hooks/types";

type MemorySnapshotProps = {
  data: SotdMemorySnapshot;
};

export function MemorySnapshot({ data }: MemorySnapshotProps) {
  return (
    <View>
      <View style={{ marginBottom: 20 }}>
        <SectionHeading
          label="Memory snapshot"
          title="When it peaked"
          subtitle={`What surrounded this song in ${data.peakMonthLabel}.`}
        />
      </View>

      <View style={{ gap: 16 }}>
        <GlassCard padding="lg" rounded="2xl">
          <View style={styles.rowHeader}>
            <Music2 size={10} color={alpha.white(0.35)} />
            <EyebrowLabel>What else you played</EyebrowLabel>
          </View>
          <View style={{ gap: 10 }}>
            {data.snapshotTracks.map((t, i) => {
              const gradient = gradientForKey(t.title);
              return (
                <View key={i} style={styles.trackRow}>
                  <View style={styles.trackThumb}>
                    {t.albumImageUrl ? (
                      <Image source={{ uri: t.albumImageUrl }} style={styles.fill} />
                    ) : (
                      <LinearGradient colors={gradient} style={styles.fill} />
                    )}
                  </View>
                  <View style={styles.trackText}>
                    <Text numberOfLines={1} style={styles.trackTitle}>
                      {t.title}
                    </Text>
                    <Text numberOfLines={1} style={styles.trackArtist}>
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
            <View style={styles.artistRow}>
              <View style={styles.artistThumb}>
                {data.topArtist.imageUrl ? (
                  <Image source={{ uri: data.topArtist.imageUrl }} style={styles.fill} />
                ) : (
                  <LinearGradient colors={gradientForKey(data.topArtist.name)} style={[styles.fill, styles.center]}>
                    <Text style={styles.artistInitials}>{data.topArtist.initials}</Text>
                  </LinearGradient>
                )}
              </View>
              <View>
                <Text style={styles.artistName}>{data.topArtist.name}</Text>
                <Text style={styles.artistPlays}>{data.topArtist.plays} plays that month</Text>
              </View>
            </View>
          ) : null}
          <View style={styles.statsRow}>
            <StatTile label="Hours streamed" value={`${data.peakMonthHours}h`} variant="serif-lg" />
            <StatTile label="Peak period" value={data.peakMonthLabel} />
          </View>
        </GlassCard>

        <GlassCard padding="lg" rounded="2xl">
          <View style={styles.snapshotHeader}>
            <EyebrowLabel>Snapshot</EyebrowLabel>
            <Text style={styles.peakLabel}>{data.peakMonthLabel}</Text>
          </View>
          <View style={styles.collageGrid}>
            {data.snapshotCollage.map((_, i) => (
              <LinearGradient
                key={i}
                colors={gradientForKey(`collage-${i}`)}
                style={{ width: "30.5%", aspectRatio: 1, borderRadius: 12, opacity: 0.55 + ((i * 13) % 5) * 0.08 }}
              />
            ))}
          </View>
          <Text style={styles.collageCaption}>
            You streamed <Text style={styles.collageCaptionStrong}>{data.peakMonthHours} hours</Text> of music that month.
          </Text>
        </GlassCard>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { height: "100%", width: "100%" },
  center: { alignItems: "center", justifyContent: "center" },
  rowHeader: { marginBottom: 12, flexDirection: "row", alignItems: "center", gap: 6 },
  trackRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  trackThumb: { height: 40, width: 40, overflow: "hidden", borderRadius: 8 },
  trackText: { flex: 1, minWidth: 0 },
  trackTitle: { fontSize: fontSize[14], fontFamily: "GeistSansMedium", color: colors.white },
  trackArtist: { marginTop: 2, fontSize: fontSize[12], color: alpha.white(0.45) },
  artistRow: { marginBottom: 20, flexDirection: "row", alignItems: "center", gap: 12 },
  artistThumb: { height: 48, width: 48, overflow: "hidden", borderRadius: 999 },
  artistInitials: { fontSize: fontSize[13], fontFamily: "GeistSansBold", color: colors.white },
  artistName: { fontSize: fontSize[14], fontFamily: "GeistSansSemiBold", color: colors.white },
  artistPlays: { marginTop: 2, fontSize: fontSize[12], color: alpha.white(0.45) },
  statsRow: { flexDirection: "row", gap: 12, borderTopWidth: 1, borderColor: alpha.white(0.05), paddingTop: 16 },
  snapshotHeader: { marginBottom: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  peakLabel: { fontSize: fontSize[12], fontFamily: "GeistSansMedium", color: alpha.white(0.5) },
  collageGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  collageCaption: { marginTop: 14, fontSize: fontSize[12], lineHeight: fontSize[12] * 1.6, color: alpha.white(0.4) },
  collageCaptionStrong: { fontFamily: "GeistSansMedium", color: colors.white },
});

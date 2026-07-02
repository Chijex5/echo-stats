import { View, Text, Image, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { gradientForKey } from "@/lib/theme/gradients";
import { alpha, colors, fontSize, radius, trackingWidest2 } from "@/lib/theme/tokens";
import type { SotdMemorySnapshot } from "@/lib/api/hooks/types";

type MemorySnapshotProps = {
  data: SotdMemorySnapshot;
};

// One card for the peak month: the tracks that surrounded the pick, the
// artist who owned that month, and the hard numbers underneath. (The old
// decorative "collage" of random gradient squares carried no data and is
// gone.)
export function MemorySnapshot({ data }: MemorySnapshotProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.groupLabel}>What else you played</Text>
      <View style={{ gap: 12 }}>
        {data.snapshotTracks.map((t, i) => (
          <View key={`${t.title}-${i}`} style={styles.trackRow}>
            <View style={styles.trackThumb}>
              {t.albumImageUrl ? (
                <Image source={{ uri: t.albumImageUrl }} style={styles.fill} />
              ) : (
                <LinearGradient colors={gradientForKey(t.title)} style={styles.fill} />
              )}
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text numberOfLines={1} style={styles.trackTitle}>
                {t.title}
              </Text>
              <Text numberOfLines={1} style={styles.trackArtist}>
                {t.artist}
              </Text>
            </View>
          </View>
        ))}
      </View>

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
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={styles.artistLabel}>Owned that month</Text>
            <Text numberOfLines={1} style={styles.artistName}>
              {data.topArtist.name}
            </Text>
          </View>
          <Text style={styles.artistPlays}>{data.topArtist.plays} plays</Text>
        </View>
      ) : null}

      <View style={styles.facts}>
        <View style={{ flex: 1 }}>
          <Text style={styles.factValue}>{data.peakMonthHours}h</Text>
          <Text style={styles.factLabel}>Hours streamed</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.factValue}>{data.peakMonthLabel}</Text>
          <Text style={styles.factLabel}>Peak period</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { height: "100%", width: "100%" },
  center: { alignItems: "center", justifyContent: "center" },
  card: { borderRadius: radius["2xl"], backgroundColor: colors.surface, padding: 16 },
  groupLabel: {
    marginBottom: 12,
    fontSize: fontSize[9],
    fontFamily: "GeistSans",
    textTransform: "uppercase",
    letterSpacing: trackingWidest2(fontSize[9]),
    color: alpha.white(0.35),
  },
  trackRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  trackThumb: { height: 40, width: 40, overflow: "hidden", borderRadius: 6 },
  trackTitle: { fontSize: fontSize[13], fontFamily: "GeistSansMedium", color: colors.white },
  trackArtist: { marginTop: 2, fontSize: fontSize[11], fontFamily: "GeistSans", color: alpha.white(0.45) },

  artistRow: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderTopWidth: 1,
    borderColor: alpha.white(0.06),
    paddingTop: 14,
  },
  artistThumb: { height: 40, width: 40, overflow: "hidden", borderRadius: 20 },
  artistInitials: { fontSize: fontSize[12], fontFamily: "GeistSansBold", color: colors.white },
  artistLabel: {
    fontSize: fontSize[9],
    fontFamily: "GeistSans",
    textTransform: "uppercase",
    letterSpacing: trackingWidest2(fontSize[9]),
    color: alpha.white(0.35),
  },
  artistName: { marginTop: 1, fontSize: fontSize[13], fontFamily: "GeistSansSemiBold", color: colors.white },
  artistPlays: { fontSize: fontSize[11], fontFamily: "GeistSansMedium", color: alpha.white(0.45) },

  facts: {
    marginTop: 16,
    flexDirection: "row",
    borderTopWidth: 1,
    borderColor: alpha.white(0.06),
    paddingTop: 14,
  },
  factValue: { fontSize: fontSize[17], fontFamily: "GeistSansBold", color: colors.white },
  factLabel: {
    marginTop: 3,
    fontSize: fontSize[9],
    fontFamily: "GeistSans",
    textTransform: "uppercase",
    letterSpacing: trackingWidest2(fontSize[9]),
    color: alpha.white(0.4),
  },
});

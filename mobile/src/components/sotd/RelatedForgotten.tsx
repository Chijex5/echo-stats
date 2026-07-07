import { ScrollView, View, Text, Image, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { gradientForKey } from "@/lib/theme/gradients";
import { alpha, colors, fontSize, radius, trackingWidest2 } from "@/lib/theme/tokens";
import type { SotdRelatedTrack } from "@/lib/api/hooks/types";

type RelatedForgottenProps = {
  related: SotdRelatedTrack[];
};

// Horizontal shelf of the next resurfacing candidates — artwork-led tiles
// on plain surface fills.
export function RelatedForgotten({ related }: RelatedForgottenProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
      {related.map((r, i) => (
        <View key={r.title + i} style={styles.tile}>
          <View style={styles.artwork}>
            {r.albumImageUrl ? (
              <Image source={{ uri: r.albumImageUrl }} style={styles.fill} />
            ) : (
              <LinearGradient colors={gradientForKey(r.title)} style={styles.fill} />
            )}
            <View style={styles.tagWrap}>
              <Text style={styles.tagText}>{r.tag}</Text>
            </View>
          </View>
          <View style={styles.meta}>
            <Text numberOfLines={1} style={styles.title}>
              {r.title}
            </Text>
            <Text numberOfLines={1} style={styles.artist}>
              {r.artist}
            </Text>
            <Text numberOfLines={1} style={styles.lastPlayed}>
              Last played {r.lastPlayed}
            </Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  fill: { height: "100%", width: "100%" },
  tile: { width: 150, borderRadius: radius["2xl"], backgroundColor: colors.surface, overflow: "hidden" },
  artwork: { aspectRatio: 1 },
  tagWrap: {
    position: "absolute",
    left: 8,
    top: 8,
    borderRadius: radius.full,
    backgroundColor: alpha.black(0.5),
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  tagText: {
    fontSize: fontSize[9],
    fontFamily: "GeistSansSemiBold",
    textTransform: "uppercase",
    letterSpacing: trackingWidest2(fontSize[9]),
    color: alpha.white(0.9),
  },
  meta: { padding: 10 },
  title: { fontSize: fontSize[13], fontFamily: "GeistSansSemiBold", color: colors.white },
  artist: { marginTop: 2, fontSize: fontSize[11], fontFamily: "GeistSans", color: alpha.white(0.45) },
  lastPlayed: { marginTop: 6, fontSize: fontSize[10], fontFamily: "GeistSans", color: alpha.white(0.3) },
});

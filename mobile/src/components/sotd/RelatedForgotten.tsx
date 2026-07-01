import { ScrollView, View, Text, Image, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Clock } from "lucide-react-native";
import { GlassCard, SectionHeading } from "@/components/ui";
import { gradientForKey } from "@/lib/theme/gradients";
import { alpha, colors, fontSize } from "@/lib/theme/tokens";
import type { SotdRelatedTrack } from "@/lib/api/hooks/types";

type RelatedForgottenProps = {
  related: SotdRelatedTrack[];
};

export function RelatedForgotten({ related }: RelatedForgottenProps) {
  return (
    <View>
      <View style={{ marginBottom: 20 }}>
        <SectionHeading label="More memories" title="Other forgotten favorites" subtitle="What we'd resurface next." />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
        {related.map((r, i) => (
          <GlassCard key={r.title + i} padding="sm" rounded="2xl" style={{ width: 160 }}>
            <View style={styles.artwork}>
              {r.albumImageUrl ? (
                <Image source={{ uri: r.albumImageUrl }} style={styles.fill} />
              ) : (
                <LinearGradient colors={gradientForKey(r.title)} style={styles.fill} />
              )}
              <View style={styles.dim} />
              <View style={styles.tagWrap}>
                <Text style={styles.tagText}>{r.tag}</Text>
              </View>
            </View>
            <Text numberOfLines={1} style={styles.title}>
              {r.title}
            </Text>
            <Text numberOfLines={1} style={styles.artist}>
              {r.artist}
            </Text>
            <View style={styles.metaRow}>
              <Clock size={10} color={alpha.white(0.35)} />
              <Text numberOfLines={1} style={styles.meta}>
                Last played {r.lastPlayed}
              </Text>
            </View>
          </GlassCard>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { height: "100%", width: "100%" },
  artwork: { aspectRatio: 1, overflow: "hidden", borderRadius: 12 },
  dim: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: alpha.black(0.12) },
  tagWrap: { position: "absolute", left: 8, top: 8, borderRadius: 999, backgroundColor: alpha.black(0.45), paddingHorizontal: 8, paddingVertical: 4 },
  tagText: { fontSize: fontSize[9], fontFamily: "GeistSansSemiBold", textTransform: "uppercase", letterSpacing: 1.5, color: alpha.white(0.9) },
  title: { marginTop: 10, fontSize: fontSize[13], fontFamily: "GeistSansSemiBold", color: colors.white },
  artist: { marginTop: 2, fontSize: fontSize[11], color: alpha.white(0.45) },
  metaRow: { marginTop: 8, flexDirection: "row", alignItems: "center", gap: 6 },
  meta: { flex: 1, fontSize: fontSize[10], color: alpha.white(0.35) },
});

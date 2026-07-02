import { useRef, useState } from "react";
import { View, Text, Image, Share, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { captureRef } from "react-native-view-shot";
import { Share2, Sparkles } from "lucide-react-native";
import { EyebrowLabel, PrimaryButton, BottomSheet } from "@/components/ui";
import { colorForKey, gradientForKey } from "@/lib/theme/gradients";
import { colors, alpha, fontSize } from "@/lib/theme/tokens";
import type { SotdSong, SotdStats } from "@/lib/api/hooks/types";

type ShareSheetProps = {
  visible: boolean;
  song: SotdSong;
  stats: SotdStats;
  affinityScore: number;
  affinityLabel: string;
  onClose: () => void;
};

// Replaces the web's manual <canvas> drawing with a real RN view tree,
// rasterized on demand — there is no RN equivalent for 2D canvas drawing.
export function ShareSheet({ visible, song, stats, affinityScore, affinityLabel, onClose }: ShareSheetProps) {
  const cardRef = useRef<View>(null);
  const [sharing, setSharing] = useState(false);

  async function handleShare() {
    if (!cardRef.current) return;
    setSharing(true);
    try {
      const uri = await captureRef(cardRef, { format: "png", quality: 1 });
      await Share.share({ url: uri, message: `${song.title} — ${song.artist}` });
    } catch {
      // user cancelled the share sheet or rasterization failed — nothing to recover
    } finally {
      setSharing(false);
    }
  }

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <View style={styles.header}>
        <Sparkles size={14} color={colors.echoGreen} />
        <EyebrowLabel>Share card</EyebrowLabel>
      </View>
      <Text style={styles.title}>Today&apos;s memory</Text>

      <View style={{ marginTop: 20, alignItems: "center" }}>
        <View ref={cardRef} collapsable={false} style={styles.card}>
          <LinearGradient colors={[alpha.hex(colorForKey(song.title), 0.33), "transparent"]} style={styles.glow} />
          <View style={styles.cardInner}>
            <View>
              <View style={styles.artwork}>
                {song.albumImageUrl ? (
                  <Image source={{ uri: song.albumImageUrl }} style={styles.fill} />
                ) : (
                  <LinearGradient colors={gradientForKey(song.title)} style={styles.fill} />
                )}
              </View>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>Song of the day</Text>
              </View>
              <Text numberOfLines={1} style={styles.songTitle}>
                {song.title}
              </Text>
              <Text numberOfLines={1} style={styles.songArtist}>
                {song.artist}
              </Text>
            </View>

            <View style={styles.statsRow}>
              <View>
                <Text style={styles.statLabel}>Past plays</Text>
                <Text style={styles.statValue}>{stats.pastPlays}</Text>
              </View>
              <View>
                <Text style={styles.statLabel}>Affinity</Text>
                <Text style={[styles.statValue, { color: colors.spotify }]}>
                  {affinityScore} · {affinityLabel}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      <View style={{ marginTop: 24 }}>
        <PrimaryButton label="Share" icon={Share2} fullWidth loading={sharing} onPress={handleShare} />
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  fill: { height: "100%", width: "100%" },
  header: { flexDirection: "row", alignItems: "center", gap: 8 },
  title: { marginTop: 8, fontSize: fontSize[20], fontFamily: "GeistSansBold", color: colors.white },
  card: {
    width: 280,
    aspectRatio: 1,
    overflow: "hidden",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: alpha.white(0.1),
    backgroundColor: colors.background,
  },
  glow: { position: "absolute", top: -60, left: -60, width: 220, height: 220, borderRadius: 110 },
  cardInner: { flex: 1, justifyContent: "space-between", padding: 20 },
  artwork: { height: 112, width: 112, overflow: "hidden", borderRadius: 18 },
  badge: { marginTop: 12, alignSelf: "flex-start", borderRadius: 999, backgroundColor: alpha.white(0.06), paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { fontSize: fontSize[9], fontFamily: "GeistSansSemiBold", textTransform: "uppercase", letterSpacing: 1.5, color: alpha.white(0.5) },
  songTitle: { marginTop: 8, fontSize: fontSize[18], fontFamily: "GeistSansBold", color: colors.white },
  songArtist: { marginTop: 2, fontSize: fontSize[12], color: alpha.white(0.6) },
  statsRow: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between" },
  statLabel: { fontSize: fontSize[9], textTransform: "uppercase", letterSpacing: 1.5, color: alpha.white(0.35) },
  statValue: { fontSize: fontSize[17], fontFamily: "PlayfairDisplayItalic", color: colors.white },
});

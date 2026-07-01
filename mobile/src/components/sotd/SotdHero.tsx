import { View, Text, Image, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Play, Heart, Share2, Disc3, Sparkles } from "lucide-react-native";
import { GlassCard, PrimaryButton, StatTile, EyebrowLabel } from "@/components/ui";
import { colors, alpha, shadows, fontSize, trackingWidest2 } from "@/lib/theme/tokens";
import type { SotdSong, SotdStats } from "@/lib/api/hooks/types";

type SotdHeroProps = {
  song: SotdSong;
  stats: SotdStats;
  onShare: () => void;
};

const WEEKDAY = new Date().toLocaleDateString("en-US", { weekday: "long" });

export function SotdHero({ song, stats, onShare }: SotdHeroProps) {
  return (
    <View>
      <View style={styles.center}>
        <View style={styles.badge}>
          <Sparkles size={11} color={colors.spotify} />
          <Text style={styles.badgeText}>Song of the day · {WEEKDAY}</Text>
        </View>
        <Text style={styles.headline}>
          A song you <Text style={styles.headlineAccent}>loved</Text> once.
        </Text>
        <Text style={styles.subhead}>A memory waiting to return. Today, we found it.</Text>
      </View>

      <View style={{ marginTop: 28 }}>
        <GlassCard padding="lg" rounded="2xl" glow>
          <View style={styles.cardInner}>
            <View style={[styles.artwork, shadows.ambient]}>
              {song.albumImageUrl ? (
                <Image source={{ uri: song.albumImageUrl }} style={styles.fill} />
              ) : (
                <LinearGradient colors={[song.gradientFrom, song.gradientTo]} style={styles.fill} />
              )}
              <View style={styles.artworkOverlay} />
              <Disc3 size={28} color={alpha.white(0.3)} style={styles.artworkIcon} />
            </View>

            <View style={{ width: "100%", alignItems: "center" }}>
              <EyebrowLabel style={{ marginBottom: 6 }}>Forgotten favorite</EyebrowLabel>
              <Text style={styles.songTitle}>{song.title}</Text>
              <Text style={styles.songMeta}>
                {song.artist} · {song.album} · {song.released}
              </Text>
            </View>

            <View style={styles.statsRow}>
              <StatTile label="Past plays" value={stats.pastPlays} variant="serif-lg" />
              <StatTile label="Last played" value={stats.lastPlayed} />
            </View>

            <View style={{ width: "100%", gap: 10 }}>
              <PrimaryButton label="Play preview" variant="spotify-solid" icon={Play} fullWidth onPress={() => {}} />
              <View style={styles.buttonsRow}>
                <View style={{ flex: 1 }}>
                  <PrimaryButton label="Save" variant="outline" icon={Heart} fullWidth onPress={() => {}} />
                </View>
                <View style={{ flex: 1 }}>
                  <PrimaryButton label="Share card" variant="outline" icon={Share2} fullWidth onPress={onShare} />
                </View>
              </View>
            </View>
          </View>
        </GlassCard>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { height: "100%", width: "100%" },
  center: { alignItems: "center", paddingHorizontal: 8 },
  badge: {
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: alpha.white(0.1),
    backgroundColor: alpha.white(0.04),
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  badgeText: {
    fontSize: fontSize[10],
    textTransform: "uppercase",
    letterSpacing: trackingWidest2(fontSize[10]),
    color: alpha.white(0.6),
  },
  headline: { textAlign: "center", fontSize: fontSize[26], fontFamily: "GeistSansBold", lineHeight: fontSize[26] * 1.1, color: colors.white },
  headlineAccent: { fontFamily: "PlayfairDisplayItalic", fontStyle: "italic", color: alpha.white(0.9) },
  subhead: { marginTop: 8, textAlign: "center", fontSize: fontSize[13], color: alpha.white(0.5) },
  cardInner: { alignItems: "center", gap: 24 },
  artwork: { height: 176, width: 176, overflow: "hidden", borderRadius: 18 },
  artworkOverlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: alpha.black(0.15) },
  artworkIcon: { position: "absolute", bottom: 12, right: 12 },
  songTitle: { textAlign: "center", fontSize: fontSize[20], fontFamily: "GeistSansBold", lineHeight: fontSize[20] * 1.15, color: colors.white },
  songMeta: { marginTop: 4, textAlign: "center", fontSize: fontSize[13], color: alpha.white(0.55) },
  statsRow: { width: "100%", flexDirection: "row", gap: 12 },
  buttonsRow: { flexDirection: "row", gap: 10 },
});

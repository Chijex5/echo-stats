import { View, Text, StyleSheet } from "react-native";
import { TrendingUp, TrendingDown, Minus, Play } from "lucide-react-native";
import { GlassCard, EyebrowLabel } from "@/components/ui";
import { Sparkline } from "@/components/charts";
import { colors, alpha, fontSize, trackingWidest2 } from "@/lib/theme/tokens";
import type { TopArtist, Trend } from "@/lib/api/hooks";
import { ArtistAvatar } from "./ArtistAvatar";

const TREND_COLOR: Record<Trend, string> = {
  up: colors.echoGreen,
  down: colors.accentRed,
  same: alpha.white(0.35),
};

function TrendIcon({ trend, size = 12 }: { trend: Trend; size?: number }) {
  const color = TREND_COLOR[trend];
  if (trend === "up") return <TrendingUp size={size} color={color} />;
  if (trend === "down") return <TrendingDown size={size} color={color} />;
  return <Minus size={size} color={color} />;
}

export function FeaturedArtistCard({ artist }: { artist: TopArtist }) {
  return (
    <GlassCard padding="lg" rounded="2xl">
      <View style={styles.center}>
        <View>
          <ArtistAvatar artist={artist} size="xl" ring />
          <View style={[styles.rankBadge, { backgroundColor: colors.echoGreen }]}>
            <Text style={styles.rankText}>#1</Text>
          </View>
        </View>

        <EyebrowLabel style={{ marginTop: 20 }}>Most played artist</EyebrowLabel>
        <Text numberOfLines={1} style={styles.name}>
          {artist.name}
        </Text>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Play size={11} color={alpha.white(0.5)} fill={alpha.white(0.5)} />
            <Text style={styles.metaText}>{artist.plays.toLocaleString()} plays</Text>
          </View>
          <View style={styles.metaItem}>
            <TrendIcon trend={artist.trend} />
            <Text style={[styles.metaText, { color: TREND_COLOR[artist.trend] }]}>{artist.deltaLabel}</Text>
          </View>
        </View>

        <View style={styles.sparklineWrap}>
          <Sparkline data={artist.sparkline.map((p) => p.v)} width={220} height={48} color={TREND_COLOR[artist.trend]} />
        </View>
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: "center" },
  rankBadge: {
    position: "absolute",
    bottom: -6,
    left: "50%",
    transform: [{ translateX: -18 }],
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  rankText: {
    fontSize: fontSize[10],
    fontFamily: "GeistSansBold",
    textTransform: "uppercase",
    letterSpacing: trackingWidest2(fontSize[10]),
    color: colors.onSpotify,
  },
  name: { marginTop: 6, textAlign: "center", fontSize: fontSize[26], fontFamily: "GeistSansBold", color: colors.white },
  metaRow: { marginTop: 12, flexDirection: "row", alignItems: "center", gap: 16 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  metaText: { fontSize: fontSize[13], color: alpha.white(0.5) },
  sparklineWrap: { marginTop: 20, width: "100%", alignItems: "center" },
});

import { View, Text, StyleSheet } from "react-native";
import { TrendingUp, TrendingDown, Minus } from "lucide-react-native";
import { GlassCard } from "@/components/ui";
import { Sparkline } from "@/components/charts";
import { colors, alpha, fontSize } from "@/lib/theme/tokens";
import type { TopArtist, Trend } from "@/lib/api/hooks";
import { ArtistAvatar } from "./ArtistAvatar";

const TREND_COLOR: Record<Trend, string> = {
  up: colors.echoGreen,
  down: colors.accentRed,
  same: alpha.white(0.3),
};

function TrendIcon({ trend }: { trend: Trend }) {
  const color = TREND_COLOR[trend];
  if (trend === "up") return <TrendingUp size={12} color={color} />;
  if (trend === "down") return <TrendingDown size={12} color={color} />;
  return <Minus size={12} color={color} />;
}

export function ArtistGridCard({ artist, rank }: { artist: TopArtist; rank: number }) {
  return (
    <GlassCard padding="sm" rounded="xl" style={{ flex: 1 }}>
      <View style={styles.row}>
        <ArtistAvatar artist={artist} size="sm" />
        <View style={{ flex: 1 }}>
          <Text numberOfLines={1} style={styles.name}>
            {artist.name}
          </Text>
          <View style={styles.metaRow}>
            <Text style={styles.rank}>#{rank}</Text>
            <Text style={styles.plays}>{artist.plays.toLocaleString()} plays</Text>
          </View>
        </View>
        <TrendIcon trend={artist.trend} />
      </View>

      <View style={{ marginTop: 10 }}>
        <Sparkline data={artist.sparkline.map((p) => p.v)} width={130} height={24} color={TREND_COLOR[artist.trend]} strokeWidth={1.5} />
      </View>

      <Text numberOfLines={1} style={styles.delta}>
        {artist.deltaLabel}
      </Text>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  name: { fontSize: fontSize[13], fontFamily: "GeistSansSemiBold", color: colors.white },
  metaRow: { marginTop: 2, flexDirection: "row", alignItems: "center", gap: 6 },
  rank: { fontFamily: "GeistMono", fontSize: fontSize[10], color: alpha.white(0.25) },
  plays: { fontSize: fontSize[10], color: alpha.white(0.4) },
  delta: { marginTop: 6, fontSize: fontSize[10], color: alpha.white(0.35) },
});

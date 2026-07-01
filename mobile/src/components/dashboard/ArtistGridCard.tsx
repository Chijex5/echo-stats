import { View, Text } from "react-native";
import { TrendingUp, TrendingDown, Minus } from "lucide-react-native";
import { GlassCard } from "@/components/ui";
import { Sparkline } from "@/components/charts";
import { colors, alpha } from "@/lib/theme/tokens";
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
      <View className="flex-row items-center gap-2.5">
        <ArtistAvatar artist={artist} size="sm" />
        <View className="flex-1">
          <Text numberOfLines={1} className="text-13 font-sans-semibold text-white">
            {artist.name}
          </Text>
          <View className="mt-0.5 flex-row items-center gap-1.5">
            <Text className="font-mono text-10 text-white/25">#{rank}</Text>
            <Text className="text-10 text-white/40">{artist.plays.toLocaleString()} plays</Text>
          </View>
        </View>
        <TrendIcon trend={artist.trend} />
      </View>

      <View className="mt-2.5">
        <Sparkline data={artist.sparkline.map((p) => p.v)} width={130} height={24} color={TREND_COLOR[artist.trend]} strokeWidth={1.5} />
      </View>

      <Text numberOfLines={1} className="mt-1.5 text-10 text-white/35">
        {artist.deltaLabel}
      </Text>
    </GlassCard>
  );
}

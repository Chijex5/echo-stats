import { View, Text } from "react-native";
import { TrendingUp, TrendingDown, Minus, Play } from "lucide-react-native";
import { GlassCard, EyebrowLabel } from "@/components/ui";
import { Sparkline } from "@/components/charts";
import { colors } from "@/lib/theme/tokens";
import type { TopArtist, Trend } from "@/lib/api/hooks";
import { ArtistAvatar } from "./ArtistAvatar";

const TREND_COLOR: Record<Trend, string> = {
  up: colors.echoGreen,
  down: "#f87171",
  same: "rgba(255,255,255,0.35)",
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
      <View className="items-center">
        <View>
          <ArtistAvatar artist={artist} size="xl" ring />
          <View
            className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 rounded-full px-2.5 py-0.5"
            style={{ backgroundColor: colors.echoGreen }}
          >
            <Text className="text-[10px] font-sans-bold uppercase tracking-widest2 text-[#05210f]">#1</Text>
          </View>
        </View>

        <EyebrowLabel className="mt-5">Most played artist</EyebrowLabel>
        <Text numberOfLines={1} className="mt-1.5 text-center text-[26px] font-sans-bold text-white">
          {artist.name}
        </Text>

        <View className="mt-3 flex-row items-center gap-4">
          <View className="flex-row items-center gap-1.5">
            <Play size={11} color="rgba(255,255,255,0.5)" fill="rgba(255,255,255,0.5)" />
            <Text className="text-[13px] text-white/50">{artist.plays.toLocaleString()} plays</Text>
          </View>
          <View className="flex-row items-center gap-1.5">
            <TrendIcon trend={artist.trend} />
            <Text className="text-[13px]" style={{ color: TREND_COLOR[artist.trend] }}>
              {artist.deltaLabel}
            </Text>
          </View>
        </View>

        <View className="mt-5 w-full items-center">
          <Sparkline
            data={artist.sparkline.map((p) => p.v)}
            width={220}
            height={48}
            color={TREND_COLOR[artist.trend]}
          />
        </View>
      </View>
    </GlassCard>
  );
}

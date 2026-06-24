import { useState } from "react";
import { View, Text, Image, Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Play, Heart, Share2, Disc3, Sparkles, type LucideIcon } from "lucide-react-native";
import { AmbientBlob, EyebrowLabel } from "@/components/ui";
import { cn } from "@/lib/cn";
import { colors, shadows } from "@/lib/theme/tokens";
import type { SotdSong } from "@/lib/api/hooks/types";

type SotdHeroProps = {
  song: SotdSong;
  onShare: () => void;
};

const WEEKDAY = new Date().toLocaleDateString("en-US", { weekday: "long" });

type IconActionProps = {
  icon: LucideIcon;
  label: string;
  variant?: "primary" | "ghost" | "active";
  size?: number;
  onPress?: () => void;
};

function IconAction({ icon: Icon, label, variant = "ghost", size = 46, onPress }: IconActionProps) {
  const isPrimary = variant === "primary";
  const isActive = variant === "active";
  return (
    <Pressable onPress={onPress} className="items-center gap-1.5">
      <View
        className={cn(
          "items-center justify-center rounded-full",
          isPrimary ? "bg-spotify" : isActive ? "border border-spotify/50 bg-spotify/15" : "border border-white/10 bg-white/[0.05]"
        )}
        style={[{ height: size, width: size }, isPrimary ? shadows.glowSpotify : undefined]}
      >
        <Icon
          size={size * 0.4}
          color={isPrimary ? "#000" : isActive ? colors.spotifyLight : "rgba(255,255,255,0.75)"}
          strokeWidth={1.8}
          fill={isActive ? colors.spotifyLight : "transparent"}
        />
      </View>
      <Text className="text-[10px] text-white/45">{label}</Text>
    </Pressable>
  );
}

export function SotdHero({ song, onShare }: SotdHeroProps) {
  const [saved, setSaved] = useState(false);

  return (
    <View>
      <AmbientBlob color={song.gradientFrom} size={300} blur={70} style={{ top: -60, left: -80 }} durationMs={8000} />
      <AmbientBlob color={song.gradientTo} size={240} blur={70} style={{ top: 140, right: -70 }} durationMs={7000} delayMs={300} />

      <View className="mb-4 flex-row items-center gap-2 self-start rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5">
        <Sparkles size={11} color={colors.spotify} />
        <Text className="text-[10px] uppercase tracking-widest2 text-white/60">Song of the day · {WEEKDAY}</Text>
      </View>

      <View
        className="overflow-hidden rounded-[28px]"
        style={{ aspectRatio: 1, shadowColor: "#000", shadowOpacity: 0.45, shadowRadius: 24 }}
      >
        {song.albumImageUrl ? (
          <Image source={{ uri: song.albumImageUrl }} className="h-full w-full" />
        ) : (
          <LinearGradient colors={[song.gradientFrom, song.gradientTo]} className="h-full w-full items-center justify-center">
            <Disc3 size={48} color="rgba(255,255,255,0.35)" />
          </LinearGradient>
        )}
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.78)"]}
          style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: "55%" }}
        />
        <View className="absolute bottom-0 left-0 right-0 p-5">
          <EyebrowLabel className="mb-1.5 text-white/70">Forgotten favorite</EyebrowLabel>
          <Text numberOfLines={2} className="text-[24px] font-sans-bold leading-tight text-white">
            {song.title}
          </Text>
          <Text numberOfLines={1} className="mt-1 text-[13px] text-white/70">
            {song.artist} · {song.album}
          </Text>
        </View>
      </View>

      <View className="mt-5 flex-row items-center justify-center gap-7">
        <IconAction icon={Heart} label="Save" variant={saved ? "active" : "ghost"} onPress={() => setSaved((s) => !s)} />
        <IconAction icon={Play} label="Preview" variant="primary" size={60} onPress={() => {}} />
        <IconAction icon={Share2} label="Share" onPress={onShare} />
      </View>
    </View>
  );
}

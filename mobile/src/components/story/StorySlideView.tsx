import { View, Text, Image, useWindowDimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MotiView } from "moti";
import type { LucideIcon } from "lucide-react-native";
import { DECORATIONS } from "./decorations";
import type { StorySlide } from "./buildSlides";
import { colors, alpha, radius } from "@/lib/theme/tokens";

function Waveform({ color }: { color: string }) {
  const bars = Array.from({ length: 24 });
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 2.5, height: 28 }}>
      {bars.map((_, i) => (
        <MotiView
          key={i}
          from={{ height: 6 }}
          animate={{ height: 6 + ((i * 53) % 22) }}
          transition={{ type: "timing", duration: 380 + i * 20, loop: true, repeatReverse: true, delay: i * 30 }}
          style={{ width: 2.5, borderRadius: 2, backgroundColor: color, opacity: 0.7 }}
        />
      ))}
    </View>
  );
}

export function StorySlideView({ slide, Icon }: { slide: StorySlide; Icon: LucideIcon }) {
  const { width, height } = useWindowDimensions();
  const Decoration = DECORATIONS[slide.decoration];

  return (
    <View style={{ width, height, backgroundColor: colors.background }}>
      {slide.imageUrl ? (
        <Image source={{ uri: slide.imageUrl }} style={{ width, height, position: "absolute" }} resizeMode="cover" blurRadius={2} />
      ) : (
        <LinearGradient
          colors={[`${slide.accent}33`, colors.background, colors.background]}
          style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
        />
      )}
      <LinearGradient
        colors={[alpha.black(0.55), alpha.black(0.35), alpha.black(0.92)]}
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
      />

      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        {slide.imageUrl ? (
          <View style={{ alignItems: "center", gap: 16 }}>
            <View
              style={{
                width: 220,
                height: 220,
                borderRadius: 24,
                overflow: "hidden",
                borderWidth: 1,
                borderColor: alpha.white(0.12),
                shadowColor: slide.accent,
                shadowOpacity: 0.45,
                shadowRadius: 30,
                shadowOffset: { width: 0, height: 0 },
              }}
            >
              <Image source={{ uri: slide.imageUrl }} style={{ width: 220, height: 220 }} resizeMode="cover" />
            </View>
            {slide.showWave ? <Waveform color={slide.accent} /> : null}
          </View>
        ) : (
          <Decoration color={slide.accent} />
        )}
      </View>

      <View style={{ position: "absolute", left: 0, right: 0, bottom: 0 }}>
        <View
          style={{
            overflow: "hidden",
            borderTopLeftRadius: radius.sheet,
            borderTopRightRadius: radius.sheet,
            backgroundColor: alpha.black(0.55),
          }}
        >
          <View className="border-t border-white/[0.08] px-6 pb-10 pt-6">
            <View className="flex-row items-center gap-2">
              <Icon size={14} color={slide.accent} />
              <Text className="text-10 uppercase tracking-widest2 text-white/45">{slide.label}</Text>
            </View>
            <Text numberOfLines={2} className="mt-2 text-26 font-sans-bold leading-tight text-white">
              {slide.title}
            </Text>
            <Text numberOfLines={2} className="mt-1.5 text-14 text-white/55">
              {slide.subtitle}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

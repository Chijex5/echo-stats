import { View, Text, Image, StyleSheet, useWindowDimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MotiView } from "moti";
import type { LucideIcon } from "lucide-react-native";
import { DECORATIONS } from "./decorations";
import type { StorySlide } from "./buildSlides";
import { colors, alpha, radius, fontSize, trackingWidest2 } from "@/lib/theme/tokens";

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
        <LinearGradient colors={[`${slide.accent}33`, colors.background, colors.background]} style={styles.fillAbsolute} />
      )}
      <LinearGradient colors={[alpha.black(0.55), alpha.black(0.35), alpha.black(0.92)]} style={styles.fillAbsolute} />

      <View style={styles.center}>
        {slide.imageUrl ? (
          <View style={{ alignItems: "center", gap: 16 }}>
            <View style={[styles.artwork, { shadowColor: slide.accent }]}>
              <Image source={{ uri: slide.imageUrl }} style={{ width: 220, height: 220 }} resizeMode="cover" />
            </View>
            {slide.showWave ? <Waveform color={slide.accent} /> : null}
          </View>
        ) : (
          <Decoration color={slide.accent} />
        )}
      </View>

      <View style={styles.bottomWrap}>
        <View style={styles.panel}>
          <View style={styles.panelContent}>
            <View style={styles.labelRow}>
              <Icon size={14} color={slide.accent} />
              <Text style={styles.label}>{slide.label}</Text>
            </View>
            <Text numberOfLines={2} style={styles.title}>
              {slide.title}
            </Text>
            <Text numberOfLines={2} style={styles.subtitle}>
              {slide.subtitle}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fillAbsolute: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  artwork: {
    width: 220,
    height: 220,
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: alpha.white(0.12),
    shadowOpacity: 0.45,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 0 },
  },
  bottomWrap: { position: "absolute", left: 0, right: 0, bottom: 0 },
  panel: {
    overflow: "hidden",
    borderTopLeftRadius: radius.sheet,
    borderTopRightRadius: radius.sheet,
    backgroundColor: alpha.black(0.55),
  },
  panelContent: { borderTopWidth: 1, borderColor: alpha.white(0.08), paddingHorizontal: 24, paddingBottom: 40, paddingTop: 24 },
  labelRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  label: {
    fontSize: fontSize[10],
    textTransform: "uppercase",
    letterSpacing: trackingWidest2(fontSize[10]),
    color: alpha.white(0.45),
  },
  title: { marginTop: 8, fontSize: fontSize[26], fontFamily: "GeistSansBold", lineHeight: fontSize[26] * 1.1, color: colors.white },
  subtitle: { marginTop: 6, fontSize: fontSize[14], color: alpha.white(0.55) },
});

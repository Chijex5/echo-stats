import { useEffect } from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { MotiView } from "moti";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Circle, Defs, RadialGradient, Stop } from "react-native-svg";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  cancelAnimation,
  Easing,
} from "react-native-reanimated";
import { colors, alpha, fontSize, trackingWidest2, radius } from "@/lib/theme/tokens";
import { colorForKey, gradientForKey } from "@/lib/theme/gradients";
import type { NowPlayingSyncTrack } from "@/lib/api/hooks";

const DISC = 92;
const LABEL = 46;
const HALO = 150;

type NowPlayingHeroProps = {
  nowPlaying: NowPlayingSyncTrack | null;
  lastPlayed: NowPlayingSyncTrack | null;
};

// Continuous rotation while `active`. On (re)activation the angle resets to 0
// so each repeat cycle spins cleanly 0→360 without a mid-loop snap-back; the
// reset is only visible on the rare play/pause transition, not while playing.
function useSpin(active: boolean, durationMs = 9000) {
  const rotation = useSharedValue(0);
  useEffect(() => {
    if (active) {
      rotation.value = 0;
      rotation.value = withRepeat(withTiming(360, { duration: durationMs, easing: Easing.linear }), -1, false);
    } else {
      cancelAnimation(rotation);
    }
    return () => cancelAnimation(rotation);
  }, [active, durationMs, rotation]);
  return useAnimatedStyle(() => ({ transform: [{ rotate: `${rotation.value}deg` }] }));
}

function EqualizerBars({ color }: { color: string }) {
  const peaks = [11, 15, 8, 14];
  return (
    <View style={styles.eqRow}>
      {peaks.map((h, i) => (
        <MotiView
          key={i}
          from={{ height: 3 }}
          animate={{ height: h }}
          transition={{ type: "timing", duration: 460 + i * 110, loop: true, repeatReverse: true, delay: i * 80 }}
          style={[styles.eqBar, { backgroundColor: color }]}
        />
      ))}
    </View>
  );
}

function Vinyl({ track, playing, accent }: { track: NowPlayingSyncTrack; playing: boolean; accent: string }) {
  const spin = useSpin(playing);
  return (
    <View style={styles.discWrap}>
      <Svg width={HALO} height={HALO} style={styles.halo} pointerEvents="none">
        <Defs>
          <RadialGradient id="npGlow" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={accent} stopOpacity={playing ? 0.45 : 0.16} />
            <Stop offset="60%" stopColor={accent} stopOpacity={playing ? 0.12 : 0.05} />
            <Stop offset="100%" stopColor={accent} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Circle cx={HALO / 2} cy={HALO / 2} r={HALO / 2} fill="url(#npGlow)" />
      </Svg>

      <Animated.View style={[spin, { width: DISC, height: DISC, alignItems: "center", justifyContent: "center" }]}>
        <Svg width={DISC} height={DISC} viewBox="0 0 92 92" style={StyleSheet.absoluteFill}>
          <Circle cx={46} cy={46} r={45.5} fill="#050505" stroke={alpha.white(0.1)} strokeWidth={1} />
          <Circle cx={46} cy={46} r={40} fill="none" stroke={alpha.white(0.05)} strokeWidth={1} />
          <Circle cx={46} cy={46} r={35} fill="none" stroke={alpha.white(0.05)} strokeWidth={1} />
          <Circle cx={46} cy={46} r={30} fill="none" stroke={alpha.white(0.05)} strokeWidth={1} />
        </Svg>

        <View style={styles.label}>
          {track.albumImageUrl ? (
            <Image source={{ uri: track.albumImageUrl }} style={styles.labelFill} />
          ) : (
            <LinearGradient colors={gradientForKey(track.trackName)} style={styles.labelFill} />
          )}
          <View style={styles.spindle} />
        </View>
      </Animated.View>
    </View>
  );
}

export function NowPlayingHero({ nowPlaying, lastPlayed }: NowPlayingHeroProps) {
  const track = nowPlaying ?? lastPlayed;
  if (!track) return null;
  const playing = Boolean(nowPlaying);
  const accent = playing ? colors.echoGreen : colorForKey(track.trackName);

  return (
    <View style={styles.card}>
      <Vinyl track={track} playing={playing} accent={accent} />

      <View style={styles.info}>
        <View style={styles.badgeRow}>
          {playing ? (
            <EqualizerBars color={colors.echoGreen} />
          ) : (
            <View style={[styles.pausedDot, { backgroundColor: alpha.white(0.4) }]} />
          )}
          <Text style={[styles.badge, { color: playing ? colors.echoGreen : alpha.white(0.4) }]}>
            {playing ? "Now playing" : "Last played"}
          </Text>
        </View>
        <Text numberOfLines={1} style={styles.track}>
          {track.trackName}
        </Text>
        <Text numberOfLines={1} style={styles.artist}>
          {track.artistName}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
    overflow: "hidden",
    borderRadius: radius["2xl"],
    borderWidth: 1,
    borderColor: alpha.white(0.07),
    backgroundColor: colors.backgroundElevated,
    paddingVertical: 16,
    paddingHorizontal: 18,
  },
  discWrap: { width: DISC, height: DISC, alignItems: "center", justifyContent: "center" },
  halo: { position: "absolute", left: (DISC - HALO) / 2, top: (DISC - HALO) / 2 },
  label: {
    width: LABEL,
    height: LABEL,
    borderRadius: LABEL / 2,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: alpha.black(0.35),
  },
  labelFill: { position: "absolute", top: 0, left: 0, width: LABEL, height: LABEL },
  spindle: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: alpha.white(0.15),
  },
  info: { flex: 1 },
  badgeRow: { flexDirection: "row", alignItems: "center", gap: 8, height: 16 },
  eqRow: { flexDirection: "row", alignItems: "flex-end", gap: 2, height: 15 },
  eqBar: { width: 3, borderRadius: 2 },
  pausedDot: { width: 7, height: 7, borderRadius: 4 },
  badge: {
    fontSize: fontSize[10],
    fontFamily: "GeistSansSemiBold",
    textTransform: "uppercase",
    letterSpacing: trackingWidest2(fontSize[10]),
  },
  track: { marginTop: 10, fontSize: fontSize[17], fontFamily: "GeistSansBold", color: colors.white },
  artist: { marginTop: 3, fontSize: fontSize[13], fontFamily: "GeistSans", color: alpha.white(0.5) },
});

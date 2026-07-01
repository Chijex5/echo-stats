import { useEffect, useMemo, useState } from "react";
import { View, Text, Pressable, Share, ActivityIndicator, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { useSharedValue, withTiming, cancelAnimation, runOnJS, Easing } from "react-native-reanimated";
import {
  X,
  Pause,
  Play,
  Share2,
  CalendarRange,
  ChevronLeft,
  ChevronRight,
  Music2,
  Mic,
  Clock,
  Layers,
  RefreshCcw,
  HeartPulse,
  Diamond,
  FingerprintPattern,
  type LucideIcon,
} from "lucide-react-native";
import { useStoryMode } from "@/lib/api/hooks";
import { StorySlideView } from "@/components/story/StorySlideView";
import { StoryProgressStrip } from "@/components/story/StoryProgressStrip";
import { DateRangeSheet } from "@/components/story/DateRangeSheet";
import { buildSlides } from "@/components/story/buildSlides";
import { colors, alpha, fontSize } from "@/lib/theme/tokens";

const SLIDE_DURATION_MS = 5500;
const SWIPE_THRESHOLD = 50;

const ICONS: LucideIcon[] = [Music2, Mic, Clock, Layers, RefreshCcw, HeartPulse, Diamond, FingerprintPattern];

function startOfYear() {
  const d = new Date();
  return new Date(d.getFullYear(), 0, 1);
}

function toISODate(date: Date) {
  return date.toISOString().slice(0, 10);
}

export default function StoryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [from, setFrom] = useState(startOfYear);
  const [to, setTo] = useState(() => new Date());
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [showDateSheet, setShowDateSheet] = useState(false);

  const story = useStoryMode(toISODate(from), toISODate(to));
  const slides = useMemo(() => (story.data ? buildSlides(story.data) : []), [story.data]);
  const activeSlide = slides[activeIndex];

  const progress = useSharedValue(0);

  function goNext() {
    setActiveIndex((i) => (slides.length ? (i + 1) % slides.length : 0));
  }
  function goPrev() {
    setActiveIndex((i) => (slides.length ? (i - 1 + slides.length) % slides.length : 0));
  }

  useEffect(() => {
    if (!slides.length) return;
    progress.value = 0;
    if (paused) return;
    progress.value = withTiming(100, { duration: SLIDE_DURATION_MS, easing: Easing.linear }, (finished) => {
      if (finished) runOnJS(goNext)();
    });
    return () => cancelAnimation(progress);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex, paused, slides.length]);

  const pan = Gesture.Pan().onEnd((e) => {
    if (e.translationX < -SWIPE_THRESHOLD) runOnJS(goNext)();
    else if (e.translationX > SWIPE_THRESHOLD) runOnJS(goPrev)();
  });

  function handleApplyRange(newFrom: Date, newTo: Date) {
    setFrom(newFrom);
    setTo(newTo);
    setActiveIndex(0);
    setShowDateSheet(false);
  }

  function handleShare() {
    if (!slides.length) return;
    const lines = slides.map((s) => `${s.label}: ${s.title}`);
    Share.share({
      message: `My Echo Stats story (${toISODate(from)} → ${toISODate(to)})\n\n${lines.join("\n")}`,
    });
  }

  if (story.isLoading) {
    return (
      <View style={styles.centerScreen}>
        <ActivityIndicator color={colors.echoGreen} />
      </View>
    );
  }

  if (!activeSlide) {
    return (
      <View style={[styles.centerScreen, { paddingHorizontal: 24 }]}>
        <Text style={styles.emptyText}>Not enough listening history yet to build your story.</Text>
        <Pressable onPress={() => router.back()} style={styles.goBackButton}>
          <Text style={styles.goBackText}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <GestureDetector gesture={pan}>
        <StorySlideView slide={activeSlide} Icon={ICONS[activeIndex % ICONS.length]} />
      </GestureDetector>

      <View style={[styles.topBar, { top: insets.top + 10 }]}>
        <StoryProgressStrip count={slides.length} activeIndex={activeIndex} progress={progress} />

        <View style={styles.controlsRow}>
          <Pressable onPress={() => router.back()} style={styles.iconButton}>
            <X size={15} color={colors.white} />
          </Pressable>

          <View style={styles.controlsGroup}>
            <Pressable onPress={() => setShowDateSheet(true)} style={styles.iconButton}>
              <CalendarRange size={14} color={colors.white} />
            </Pressable>
            <Pressable onPress={() => setPaused((p) => !p)} style={styles.iconButton}>
              {paused ? <Play size={14} color={colors.white} /> : <Pause size={14} color={colors.white} />}
            </Pressable>
            <Pressable onPress={handleShare} style={styles.iconButton}>
              <Share2 size={14} color={colors.white} />
            </Pressable>
          </View>
        </View>
      </View>

      <View style={styles.navLeft}>
        <Pressable onPress={goPrev} style={styles.navButton}>
          <ChevronLeft size={18} color={alpha.white(0.7)} />
        </Pressable>
      </View>
      <View style={styles.navRight}>
        <Pressable onPress={goNext} style={styles.navButton}>
          <ChevronRight size={18} color={alpha.white(0.7)} />
        </Pressable>
      </View>

      <View style={styles.counterWrap}>
        <Text style={styles.counterText}>
          {activeIndex + 1} / {slides.length}
        </Text>
      </View>

      <DateRangeSheet visible={showDateSheet} from={from} to={to} onClose={() => setShowDateSheet(false)} onApply={handleApplyRange} />
    </View>
  );
}

const styles = StyleSheet.create({
  centerScreen: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background },
  emptyText: { textAlign: "center", fontSize: fontSize[14], color: alpha.white(0.5) },
  goBackButton: {
    marginTop: 20,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: alpha.white(0.1),
    backgroundColor: alpha.white(0.05),
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  goBackText: { fontSize: fontSize[13], fontFamily: "GeistSansMedium", color: alpha.white(0.8) },
  topBar: { position: "absolute", left: 16, right: 16 },
  controlsRow: { marginTop: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  controlsGroup: { flexDirection: "row", gap: 10 },
  iconButton: {
    height: 36,
    width: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: alpha.white(0.1),
    backgroundColor: alpha.black(0.3),
  },
  navLeft: { position: "absolute", left: 8, top: 0, bottom: 140, justifyContent: "center" },
  navRight: { position: "absolute", right: 8, top: 0, bottom: 140, justifyContent: "center" },
  navButton: { height: 40, width: 40, alignItems: "center", justifyContent: "center", borderRadius: 999, backgroundColor: alpha.black(0.3) },
  counterWrap: { position: "absolute", bottom: 96, left: 0, right: 0, alignItems: "center" },
  counterText: { fontSize: fontSize[11], fontFamily: "GeistSansMedium", color: alpha.white(0.45) },
});

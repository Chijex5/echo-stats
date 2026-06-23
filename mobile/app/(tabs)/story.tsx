import { useEffect, useMemo, useState } from "react";
import { View, Text, Pressable, Share, ActivityIndicator } from "react-native";
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
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#07090b" }}>
        <ActivityIndicator color="#18d87e" />
      </View>
    );
  }

  if (!activeSlide) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#07090b", paddingHorizontal: 24 }}>
        <Text className="text-center text-[14px] text-white/50">Not enough listening history yet to build your story.</Text>
        <Pressable onPress={() => router.back()} className="mt-5 rounded-full border border-white/10 bg-white/5 px-5 py-2.5">
          <Text className="text-[13px] font-sans-medium text-white/80">Go back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#07090b" }}>
      <GestureDetector gesture={pan}>
        <StorySlideView slide={activeSlide} Icon={ICONS[activeIndex % ICONS.length]} />
      </GestureDetector>

      <View style={{ position: "absolute", top: insets.top + 10, left: 16, right: 16 }}>
        <StoryProgressStrip count={slides.length} activeIndex={activeIndex} progress={progress} />

        <View className="mt-3 flex-row items-center justify-between">
          <Pressable
            onPress={() => router.back()}
            className="h-9 w-9 items-center justify-center rounded-full border border-white/[0.1] bg-black/30"
          >
            <X size={15} color="#fff" />
          </Pressable>

          <View className="flex-row gap-2.5">
            <Pressable
              onPress={() => setShowDateSheet(true)}
              className="h-9 w-9 items-center justify-center rounded-full border border-white/[0.1] bg-black/30"
            >
              <CalendarRange size={14} color="#fff" />
            </Pressable>
            <Pressable
              onPress={() => setPaused((p) => !p)}
              className="h-9 w-9 items-center justify-center rounded-full border border-white/[0.1] bg-black/30"
            >
              {paused ? <Play size={14} color="#fff" /> : <Pause size={14} color="#fff" />}
            </Pressable>
            <Pressable
              onPress={handleShare}
              className="h-9 w-9 items-center justify-center rounded-full border border-white/[0.1] bg-black/30"
            >
              <Share2 size={14} color="#fff" />
            </Pressable>
          </View>
        </View>
      </View>

      <View style={{ position: "absolute", left: 8, top: 0, bottom: 140, justifyContent: "center" }}>
        <Pressable onPress={goPrev} className="h-10 w-10 items-center justify-center rounded-full bg-black/30">
          <ChevronLeft size={18} color="rgba(255,255,255,0.7)" />
        </Pressable>
      </View>
      <View style={{ position: "absolute", right: 8, top: 0, bottom: 140, justifyContent: "center" }}>
        <Pressable onPress={goNext} className="h-10 w-10 items-center justify-center rounded-full bg-black/30">
          <ChevronRight size={18} color="rgba(255,255,255,0.7)" />
        </Pressable>
      </View>

      <View style={{ position: "absolute", bottom: 96, left: 0, right: 0, alignItems: "center" }}>
        <Text className="text-[11px] font-sans-medium text-white/45">
          {activeIndex + 1} / {slides.length}
        </Text>
      </View>

      <DateRangeSheet visible={showDateSheet} from={from} to={to} onClose={() => setShowDateSheet(false)} onApply={handleApplyRange} />
    </View>
  );
}

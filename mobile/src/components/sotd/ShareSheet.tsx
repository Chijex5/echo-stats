import { useRef, useState } from "react";
import { Modal, View, Text, Pressable, Image, Share } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MotiView } from "moti";
import { captureRef } from "react-native-view-shot";
import { X, Share2, Sparkles } from "lucide-react-native";
import { EyebrowLabel, PrimaryButton } from "@/components/ui";
import { sheetSlideUp } from "@/lib/motion/presets";
import type { SotdSong, SotdStats } from "@/lib/api/hooks/types";

type ShareSheetProps = {
  visible: boolean;
  song: SotdSong;
  stats: SotdStats;
  affinityScore: number;
  affinityLabel: string;
  onClose: () => void;
};

// Replaces the web's manual <canvas> drawing with a real RN view tree,
// rasterized on demand — there is no RN equivalent for 2D canvas drawing.
export function ShareSheet({ visible, song, stats, affinityScore, affinityLabel, onClose }: ShareSheetProps) {
  const cardRef = useRef<View>(null);
  const [sharing, setSharing] = useState(false);

  async function handleShare() {
    if (!cardRef.current) return;
    setSharing(true);
    try {
      const uri = await captureRef(cardRef, { format: "png", quality: 1 });
      await Share.share({ url: uri, message: `${song.title} — ${song.artist}` });
    } catch {
      // user cancelled the share sheet or rasterization failed — nothing to recover
    } finally {
      setSharing(false);
    }
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.8)", justifyContent: "flex-end" }} onPress={onClose}>
        <Pressable onPress={(e) => e.stopPropagation()}>
          <MotiView {...sheetSlideUp}>
            <View
              className="rounded-t-[28px] border-t border-white/[0.08] px-6 pb-10 pt-6"
              style={{ backgroundColor: "rgba(9,11,15,0.98)" }}
            >
              <Pressable
                onPress={onClose}
                className="absolute right-5 top-5 h-7 w-7 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.05]"
              >
                <X size={12} color="rgba(255,255,255,0.5)" />
              </Pressable>

              <View className="flex-row items-center gap-2">
                <Sparkles size={14} color="#18d87e" />
                <EyebrowLabel>Share card</EyebrowLabel>
              </View>
              <Text className="mt-2 text-xl font-sans-bold text-white">Today&apos;s memory</Text>

              <View className="mt-5 items-center">
                <View
                  ref={cardRef}
                  collapsable={false}
                  className="overflow-hidden rounded-3xl border border-white/10"
                  style={{ width: 280, aspectRatio: 1, backgroundColor: "#0a0a0a" }}
                >
                  <LinearGradient
                    colors={[song.gradientFrom + "55", "transparent"]}
                    style={{ position: "absolute", top: -60, left: -60, width: 220, height: 220, borderRadius: 110 }}
                  />
                  <View className="flex-1 justify-between p-5">
                    <View>
                      <View className="h-28 w-28 overflow-hidden rounded-2xl">
                        {song.albumImageUrl ? (
                          <Image source={{ uri: song.albumImageUrl }} className="h-full w-full" />
                        ) : (
                          <LinearGradient colors={[song.gradientFrom, song.gradientTo]} className="h-full w-full" />
                        )}
                      </View>
                      <View className="mt-3 self-start rounded-full bg-white/[0.06] px-2.5 py-1">
                        <Text className="text-[8px] font-sans-semibold uppercase tracking-widest text-white/50">
                          Song of the day
                        </Text>
                      </View>
                      <Text numberOfLines={1} className="mt-2 text-[18px] font-sans-bold text-white">
                        {song.title}
                      </Text>
                      <Text numberOfLines={1} className="mt-0.5 text-[12px] text-white/60">
                        {song.artist}
                      </Text>
                    </View>

                    <View className="flex-row items-end justify-between">
                      <View>
                        <Text className="text-[9px] uppercase tracking-widest text-white/35">Past plays</Text>
                        <Text className="text-[16px] font-serif text-white">{stats.pastPlays}</Text>
                      </View>
                      <View>
                        <Text className="text-[9px] uppercase tracking-widest text-white/35">Affinity</Text>
                        <Text className="text-[16px] font-serif text-spotify">
                          {affinityScore} · {affinityLabel}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </View>

              <View className="mt-6">
                <PrimaryButton label="Share" icon={Share2} fullWidth loading={sharing} onPress={handleShare} />
              </View>
            </View>
          </MotiView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

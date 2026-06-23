import { useState } from "react";
import { Modal, View, Text, Pressable } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { MotiView } from "moti";
import { X, CalendarRange } from "lucide-react-native";
import { PrimaryButton, EyebrowLabel } from "@/components/ui";
import { sheetSlideUp } from "@/lib/motion/presets";

function formatLabel(date: Date) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(date);
}

export function DateRangeSheet({
  visible,
  from,
  to,
  onClose,
  onApply,
}: {
  visible: boolean;
  from: Date;
  to: Date;
  onClose: () => void;
  onApply: (from: Date, to: Date) => void;
}) {
  const [draftFrom, setDraftFrom] = useState(from);
  const [draftTo, setDraftTo] = useState(to);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.8)", justifyContent: "flex-end" }} onPress={onClose}>
        <Pressable onPress={(e) => e.stopPropagation()}>
          <MotiView {...sheetSlideUp}>
            <View className="rounded-t-[28px] border-t border-white/[0.08] px-6 pb-10 pt-6" style={{ backgroundColor: "rgba(9,11,15,0.98)" }}>
              <Pressable onPress={onClose} className="absolute right-5 top-5 h-7 w-7 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.05]">
                <X size={12} color="rgba(255,255,255,0.5)" />
              </Pressable>

              <View className="flex-row items-center gap-2">
                <CalendarRange size={14} color="#18d87e" />
                <EyebrowLabel>Date range</EyebrowLabel>
              </View>
              <Text className="mt-2 text-xl font-sans-bold text-white">Pick your story window</Text>

              <View className="mt-5 gap-5">
                <View>
                  <Text className="mb-2 text-[11px] uppercase tracking-widest2 text-white/35">From — {formatLabel(draftFrom)}</Text>
                  <DateTimePicker
                    value={draftFrom}
                    mode="date"
                    display="default"
                    maximumDate={draftTo}
                    onChange={(_, date) => date && setDraftFrom(date)}
                  />
                </View>
                <View>
                  <Text className="mb-2 text-[11px] uppercase tracking-widest2 text-white/35">To — {formatLabel(draftTo)}</Text>
                  <DateTimePicker
                    value={draftTo}
                    mode="date"
                    display="default"
                    minimumDate={draftFrom}
                    maximumDate={new Date()}
                    onChange={(_, date) => date && setDraftTo(date)}
                  />
                </View>
              </View>

              <View className="mt-6">
                <PrimaryButton label="Apply" fullWidth onPress={() => onApply(draftFrom, draftTo)} />
              </View>
            </View>
          </MotiView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

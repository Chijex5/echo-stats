import { useState } from "react";
import { View, Text } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { CalendarRange } from "lucide-react-native";
import { PrimaryButton, EyebrowLabel, BottomSheet } from "@/components/ui";
import { colors } from "@/lib/theme/tokens";

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
    <BottomSheet visible={visible} onClose={onClose}>
      <View className="flex-row items-center gap-2">
        <CalendarRange size={14} color={colors.echoGreen} />
        <EyebrowLabel>Date range</EyebrowLabel>
      </View>
      <Text className="mt-2 text-xl font-sans-bold text-white">Pick your story window</Text>

      <View className="mt-5 gap-5">
        <View>
          <Text className="mb-2 text-11 uppercase tracking-widest2 text-white/35">From — {formatLabel(draftFrom)}</Text>
          <DateTimePicker
            value={draftFrom}
            mode="date"
            display="default"
            maximumDate={draftTo}
            onChange={(_, date) => date && setDraftFrom(date)}
          />
        </View>
        <View>
          <Text className="mb-2 text-11 uppercase tracking-widest2 text-white/35">To — {formatLabel(draftTo)}</Text>
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
    </BottomSheet>
  );
}

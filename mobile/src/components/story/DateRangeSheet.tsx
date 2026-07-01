import { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { CalendarRange } from "lucide-react-native";
import { PrimaryButton, EyebrowLabel, BottomSheet } from "@/components/ui";
import { colors, alpha, fontSize, trackingWidest2 } from "@/lib/theme/tokens";

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
      <View style={styles.header}>
        <CalendarRange size={14} color={colors.echoGreen} />
        <EyebrowLabel>Date range</EyebrowLabel>
      </View>
      <Text style={styles.title}>Pick your story window</Text>

      <View style={{ marginTop: 20, gap: 20 }}>
        <View>
          <Text style={styles.fieldLabel}>From — {formatLabel(draftFrom)}</Text>
          <DateTimePicker
            value={draftFrom}
            mode="date"
            display="default"
            maximumDate={draftTo}
            onChange={(_, date) => date && setDraftFrom(date)}
          />
        </View>
        <View>
          <Text style={styles.fieldLabel}>To — {formatLabel(draftTo)}</Text>
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

      <View style={{ marginTop: 24 }}>
        <PrimaryButton label="Apply" fullWidth onPress={() => onApply(draftFrom, draftTo)} />
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", gap: 8 },
  title: { marginTop: 8, fontSize: fontSize[20], fontFamily: "GeistSansBold", color: colors.white },
  fieldLabel: {
    marginBottom: 8,
    fontSize: fontSize[11],
    textTransform: "uppercase",
    letterSpacing: trackingWidest2(fontSize[11]),
    color: alpha.white(0.35),
  },
});

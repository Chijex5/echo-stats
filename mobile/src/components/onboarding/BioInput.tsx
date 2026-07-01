import { View, TextInput, Text } from "react-native";
import { alpha } from "@/lib/theme/tokens";

type BioInputProps = {
  value: string;
  onChangeText: (text: string) => void;
};

export function BioInput({ value, onChangeText }: BioInputProps) {
  return (
    <View>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder="What does music mean to you?"
        placeholderTextColor={alpha.white(0.25)}
        maxLength={500}
        multiline
        className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-14 text-white/90"
        style={{ minHeight: 76, textAlignVertical: "top" }}
      />
      <Text className="mt-1 text-right text-11 text-white/25">{value.length}/500</Text>
    </View>
  );
}

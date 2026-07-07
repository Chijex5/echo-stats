import { View, TextInput, Text, StyleSheet } from "react-native";
import { alpha, fontSize } from "@/lib/theme/tokens";

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
        style={styles.input}
      />
      <Text style={styles.counter}>{value.length}/500</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: alpha.white(0.1),
    backgroundColor: alpha.white(0.04),
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: fontSize[14],
    color: alpha.white(0.9),
    minHeight: 76,
    textAlignVertical: "top",
  },
  counter: { marginTop: 4, textAlign: "right", fontSize: fontSize[11], color: alpha.white(0.25) },
});

import { useState } from "react";
import { Pressable, View, Text, StyleSheet } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { UploadCloud, FileJson } from "lucide-react-native";
import { MotiView } from "moti";
import { alpha, colors, fontSize } from "@/lib/theme/tokens";

type DropZoneProps = {
  onPick: (assets: DocumentPicker.DocumentPickerAsset[]) => void;
};

// RN has no drag-and-drop surface — the web dropzone's onDrop handler has no
// mobile equivalent, so this is tap-to-browse only via the system file picker.
export function DropZone({ onPick }: DropZoneProps) {
  const [pressed, setPressed] = useState(false);

  async function handlePress() {
    const result = await DocumentPicker.getDocumentAsync({
      type: ["application/json", "text/json"],
      multiple: true,
      copyToCacheDirectory: true,
    });
    if (!result.canceled) onPick(result.assets);
  }

  return (
    <Pressable onPress={handlePress} onPressIn={() => setPressed(true)} onPressOut={() => setPressed(false)}>
      <MotiView animate={{ scale: pressed ? 0.985 : 1 }} transition={{ type: "timing", duration: 120 }} style={styles.zone}>
        <View style={styles.iconWrap}>
          <UploadCloud size={28} color={alpha.white(0.85)} />
        </View>
        <Text style={styles.title}>Tap to choose your Spotify JSON files</Text>
        <Text style={styles.subtitle}>Multiple files supported</Text>
        <View style={styles.pill}>
          <FileJson size={13} color={alpha.white(0.6)} />
          <Text style={styles.pillText}>StreamingHistory_*.json</Text>
        </View>
      </MotiView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  zone: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: alpha.white(0.15),
    paddingHorizontal: 32,
    paddingVertical: 48,
  },
  iconWrap: {
    marginBottom: 20,
    height: 64,
    width: 64,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: alpha.white(0.1),
    backgroundColor: alpha.white(0.05),
  },
  title: { marginBottom: 6, textAlign: "center", fontSize: fontSize[17], fontFamily: "GeistSansSemiBold", color: colors.white },
  subtitle: { marginBottom: 20, textAlign: "center", fontSize: fontSize[13], color: alpha.white(0.45) },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: alpha.white(0.1),
    backgroundColor: alpha.white(0.05),
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  pillText: { fontSize: fontSize[11], fontFamily: "GeistSansMedium", color: alpha.white(0.6) },
});

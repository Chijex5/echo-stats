import { useState } from "react";
import { Pressable, View, Text } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { UploadCloud, FileJson } from "lucide-react-native";
import { MotiView } from "moti";

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
      <MotiView
        animate={{ scale: pressed ? 0.985 : 1 }}
        transition={{ type: "timing", duration: 120 }}
        className="w-full items-center justify-center rounded-2xl border-2 border-dashed border-white/15 px-8 py-12"
      >
        <View className="mb-5 h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/5">
          <UploadCloud size={28} color="rgba(255,255,255,0.85)" />
        </View>
        <Text className="mb-1.5 text-center text-[17px] font-sans-semibold text-white">
          Tap to choose your Spotify JSON files
        </Text>
        <Text className="mb-5 text-center text-[13px] text-white/45">Multiple files supported</Text>
        <View className="flex-row items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
          <FileJson size={13} color="rgba(255,255,255,0.6)" />
          <Text className="text-[11px] font-sans-medium text-white/60">StreamingHistory_*.json</Text>
        </View>
      </MotiView>
    </Pressable>
  );
}

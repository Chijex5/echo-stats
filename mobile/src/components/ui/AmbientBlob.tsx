import { View } from "react-native";
import { BlurView } from "expo-blur";
import { MotiView } from "moti";
import { floatAmbient } from "@/lib/motion/presets";

type AmbientBlobProps = {
  color: string;
  size?: number;
  blur?: number;
  style?: { top?: number; bottom?: number; left?: number; right?: number };
  durationMs?: number;
  delayMs?: number;
};

export function AmbientBlob({
  color,
  size = 220,
  blur = 60,
  style,
  durationMs = 7000,
  delayMs = 0,
}: AmbientBlobProps) {
  return (
    <MotiView
      {...floatAmbient(durationMs, delayMs)}
      style={[
        {
          position: "absolute",
          width: size,
          height: size,
          borderRadius: size / 2,
          overflow: "hidden",
        },
        style,
      ]}
      pointerEvents="none"
    >
      <View
        style={{
          flex: 1,
          backgroundColor: color,
          opacity: 0.5,
        }}
      />
      <BlurView
        intensity={blur}
        tint="dark"
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
      />
    </MotiView>
  );
}

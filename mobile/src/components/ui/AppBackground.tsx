import { View } from "react-native";
import { colors } from "@/lib/theme/tokens";

// Flat solid dark background — the app's base surface. Deliberately plain:
// no blur/gradient vignette. That effect existed only to mirror the web
// app's CSS radial-glow background, and a blurred native view is exactly
// the kind of thing that silently fails to render on some Android/Expo Go/
// web setups, which is what caused the washed-out light background bug.
// Mobile gets a normal, reliable solid color instead.
export function AppBackground({ children }: { children: React.ReactNode }) {
  return <View style={{ flex: 1, backgroundColor: colors.background }}>{children}</View>;
}

import {
  Geist_400Regular,
  Geist_500Medium,
  Geist_600SemiBold,
  Geist_700Bold,
} from "@expo-google-fonts/geist";
import { GeistMono_400Regular } from "@expo-google-fonts/geist-mono";
import { PlayfairDisplay_400Regular_Italic } from "@expo-google-fonts/playfair-display";

// Family names here are what every StyleSheet.create() fontFamily value
// across the app references directly (e.g. "GeistSansBold").
export const fontsToLoad = {
  GeistSans: Geist_400Regular,
  GeistSansMedium: Geist_500Medium,
  GeistSansSemiBold: Geist_600SemiBold,
  GeistSansBold: Geist_700Bold,
  GeistMono: GeistMono_400Regular,
  PlayfairDisplayItalic: PlayfairDisplay_400Regular_Italic,
};

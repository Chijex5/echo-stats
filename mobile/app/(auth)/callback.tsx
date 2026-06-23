import { useEffect } from "react";
import { router } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import { colors } from "@/lib/theme/tokens";

// Safety net for a cold app start landing directly on the OAuth redirect
// (echostats://callback) before expo-auth-session's in-memory listener
// attaches. The normal warm-app flow resolves inside login.tsx's
// useAuthRequest response handler and never reaches this screen.
export default function CallbackScreen() {
  useEffect(() => {
    router.replace("/(auth)/login");
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, alignItems: "center", justifyContent: "center" }}>
      <ActivityIndicator color={colors.echoGreen} />
    </View>
  );
}

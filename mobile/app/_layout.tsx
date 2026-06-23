import "../global.css";
import { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { Slot, useRouter, useSegments } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import { StatusBar } from "expo-status-bar";
import { AuthProvider, useAuth } from "@/lib/auth/AuthContext";
import { queryClient } from "@/lib/api/queryClient";
import { fontsToLoad } from "@/lib/fonts";
import { colors } from "@/lib/theme/tokens";

function LoadingScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: colors.background, alignItems: "center", justifyContent: "center" }}>
      <ActivityIndicator color={colors.echoGreen} />
    </View>
  );
}

function RootNavigator() {
  const { status, user } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    const group = segments[0];
    const inAuthGroup = group === "(auth)";
    const inOnboardingGroup = group === "(onboarding)";

    if (status === "unauthenticated") {
      if (!inAuthGroup) router.replace("/(auth)/login");
      return;
    }

    if (!user?.onboardingCompleted) {
      if (!inOnboardingGroup) router.replace("/(onboarding)/import");
    } else if (inAuthGroup || inOnboardingGroup) {
      router.replace("/(tabs)");
    }
  }, [status, user?.onboardingCompleted, segments, router]);

  if (status === "loading") return <LoadingScreen />;

  return <Slot />;
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts(fontsToLoad);

  if (!fontsLoaded) return <LoadingScreen />;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <StatusBar style="light" />
            <RootNavigator />
          </AuthProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

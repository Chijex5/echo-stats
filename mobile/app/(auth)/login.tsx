import { useEffect, useState } from "react";
import { View, Text, Alert } from "react-native";
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import { Music2 } from "lucide-react-native";
import { AppBackground, AmbientBlob, GlassCard, SectionHeading, PrimaryButton } from "@/components/ui";
import { MotiView } from "moti";
import { sheetSlideUp } from "@/lib/motion/presets";
import { useAuth } from "@/lib/auth/AuthContext";
import { SPOTIFY_DISCOVERY, SPOTIFY_SCOPES, getRedirectUri } from "@/lib/auth/pkce";
import { env } from "@/lib/env";

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const { login } = useAuth();
  const [signingIn, setSigningIn] = useState(false);

  const redirectUri = getRedirectUri();

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: env.spotifyClientId,
      scopes: SPOTIFY_SCOPES,
      usePKCE: true,
      redirectUri,
    },
    SPOTIFY_DISCOVERY
  );

  useEffect(() => {
    if (!response) return;

    if (response.type === "success" && request?.codeVerifier) {
      const { code } = response.params;
      setSigningIn(true);
      login({ code, codeVerifier: request.codeVerifier, redirectUri })
        .catch(() => {
          Alert.alert("Sign-in failed", "We couldn't connect to Spotify. Please try again.");
        })
        .finally(() => setSigningIn(false));
    } else if (response.type === "error") {
      Alert.alert("Sign-in failed", "Spotify sign-in was cancelled or failed.");
    }
  }, [response, request, redirectUri, login]);

  return (
    <AppBackground>
      <View className="flex-1 items-center justify-center px-6">
        <AmbientBlob color="#18d87e" size={260} style={{ top: 80, left: -100 }} delayMs={0} />
        <AmbientBlob color="#0fb7a3" size={220} style={{ bottom: 120, right: -90 }} delayMs={1200} />

        <MotiView {...sheetSlideUp} className="w-full max-w-sm">
          <GlassCard padding="lg" rounded="2xl">
            <View className="items-center mb-6">
              <View className="h-14 w-14 items-center justify-center rounded-2xl bg-white/5 border border-white/10 mb-4">
                <Music2 size={26} color="#18d87e" />
              </View>
              <SectionHeading
                align="center"
                label="Welcome to"
                title="Echo"
                accentWord="Stats"
                subtitle="Your listening history, reimagined."
              />
            </View>

            <PrimaryButton
              label={signingIn ? "Connecting…" : "Continue with Spotify"}
              variant="outline"
              loading={signingIn || !request}
              fullWidth
              onPress={() => promptAsync()}
            />

            <Text className="mt-5 text-center text-[11px] text-white/35">
              We never see your Spotify password — only what you listen to.
            </Text>
          </GlassCard>
        </MotiView>
      </View>
    </AppBackground>
  );
}

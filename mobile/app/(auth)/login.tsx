import { useEffect, useState } from "react";
import { View, Text, Alert, StyleSheet } from "react-native";
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import { Music2 } from "lucide-react-native";
import { AppBackground, GlassCard, SectionHeading, PrimaryButton } from "@/components/ui";
import { MotiView } from "moti";
import { sheetSlideUp } from "@/lib/motion/presets";
import { useAuth } from "@/lib/auth/AuthContext";
import { SPOTIFY_DISCOVERY, SPOTIFY_SCOPES, getRedirectUri } from "@/lib/auth/pkce";
import { env } from "@/lib/env";
import { colors, alpha, fontSize } from "@/lib/theme/tokens";

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
      <View style={styles.screen}>
        <MotiView {...sheetSlideUp} style={styles.card}>
          <GlassCard padding="lg" rounded="2xl">
            <View style={styles.header}>
              <View style={styles.iconWrap}>
                <Music2 size={26} color={colors.echoGreen} />
              </View>
              <SectionHeading align="center" label="Welcome to" title="Echo" accentWord="Stats" subtitle="Your listening history, reimagined." />
            </View>

            <PrimaryButton
              label={signingIn ? "Connecting…" : "Continue with Spotify"}
              variant="outline"
              loading={signingIn || !request}
              fullWidth
              onPress={() => promptAsync()}
            />

            <Text style={styles.disclaimer}>We never see your Spotify password — only what you listen to.</Text>
          </GlassCard>
        </MotiView>
      </View>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24 },
  card: { width: "100%", maxWidth: 384 },
  header: { alignItems: "center", marginBottom: 24 },
  iconWrap: {
    height: 56,
    width: 56,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
    backgroundColor: alpha.white(0.05),
    borderWidth: 1,
    borderColor: alpha.white(0.1),
    marginBottom: 16,
  },
  disclaimer: { marginTop: 20, textAlign: "center", fontSize: fontSize[11], color: alpha.white(0.35) },
});

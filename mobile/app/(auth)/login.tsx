import { useEffect, useState } from "react";
import { View, Text, Alert, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Circle, Defs, RadialGradient, Stop } from "react-native-svg";
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming, cancelAnimation, Easing } from "react-native-reanimated";
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import { Music2, ShieldCheck } from "lucide-react-native";
import { PrimaryButton } from "@/components/ui";
import { useAuth } from "@/lib/auth/AuthContext";
import { SPOTIFY_DISCOVERY, SPOTIFY_SCOPES, getRedirectUri } from "@/lib/auth/pkce";
import { env } from "@/lib/env";
import { colors, alpha, fontSize } from "@/lib/theme/tokens";

WebBrowser.maybeCompleteAuthSession();

const DISC = 176;
const LABEL = 76;
const GLOW = 460;

function BrandDisc() {
  const rotation = useSharedValue(0);
  useEffect(() => {
    rotation.value = withRepeat(withTiming(360, { duration: 16000, easing: Easing.linear }), -1, false);
    return () => cancelAnimation(rotation);
  }, [rotation]);
  const spin = useAnimatedStyle(() => ({ transform: [{ rotate: `${rotation.value}deg` }] }));

  return (
    <Animated.View style={[spin, styles.disc]}>
      <Svg width={DISC} height={DISC} viewBox="0 0 176 176" style={StyleSheet.absoluteFill}>
        <Circle cx={88} cy={88} r={87} fill="#050505" stroke={alpha.white(0.08)} strokeWidth={1} />
        <Circle cx={88} cy={88} r={74} fill="none" stroke={alpha.white(0.05)} strokeWidth={1} />
        <Circle cx={88} cy={88} r={62} fill="none" stroke={alpha.white(0.05)} strokeWidth={1} />
        <Circle cx={88} cy={88} r={50} fill="none" stroke={alpha.white(0.05)} strokeWidth={1} />
      </Svg>
      <View style={styles.label}>
        <LinearGradient colors={[colors.echoGreen, colors.echoTeal]} style={styles.labelFill} />
        <Music2 size={30} color={colors.onSpotify} />
      </View>
    </Animated.View>
  );
}

export default function LoginScreen() {
  const { login } = useAuth();
  const insets = useSafeAreaInsets();
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
    <View style={styles.root}>
      <Svg width={GLOW} height={GLOW} style={styles.glow} pointerEvents="none">
        <Defs>
          <RadialGradient id="loginGlow" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={colors.echoGreen} stopOpacity={0.2} />
            <Stop offset="55%" stopColor={colors.echoGreen} stopOpacity={0.05} />
            <Stop offset="100%" stopColor={colors.echoGreen} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Circle cx={GLOW / 2} cy={GLOW / 2} r={GLOW / 2} fill="url(#loginGlow)" />
      </Svg>

      <View style={[styles.content, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}>
        <View style={styles.hero}>
          <BrandDisc />
          <Text style={styles.brand}>
            Echo <Text style={styles.brandAccent}>Stats</Text>
          </Text>
          <Text style={styles.tagline}>Your years of listening, reimagined into a living portrait of your taste.</Text>
        </View>

        <View style={styles.footer}>
          <PrimaryButton
            label={signingIn ? "Connecting…" : "Continue with Spotify"}
            variant="spotify-solid"
            loading={signingIn || !request}
            fullWidth
            onPress={() => promptAsync()}
          />
          <View style={styles.privacyRow}>
            <ShieldCheck size={12} color={alpha.white(0.35)} />
            <Text style={styles.privacy}>We never see your password — only what you listen to.</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  glow: { position: "absolute", top: -60, alignSelf: "center" },
  content: { flex: 1, paddingHorizontal: 28, justifyContent: "space-between" },
  hero: { flex: 1, alignItems: "center", justifyContent: "center" },
  disc: { width: DISC, height: DISC, alignItems: "center", justifyContent: "center" },
  label: {
    width: LABEL,
    height: LABEL,
    borderRadius: LABEL / 2,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  labelFill: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
  brand: { marginTop: 32, fontSize: fontSize[34], fontFamily: "GeistSansBold", color: colors.white },
  brandAccent: { fontFamily: "PlayfairDisplayItalic", fontStyle: "italic", color: colors.echoGreen },
  tagline: {
    marginTop: 12,
    maxWidth: 300,
    textAlign: "center",
    fontSize: fontSize[14],
    fontFamily: "GeistSans",
    lineHeight: fontSize[14] * 1.5,
    color: alpha.white(0.5),
  },
  footer: { gap: 16 },
  privacyRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 },
  privacy: { fontSize: fontSize[11], fontFamily: "GeistSans", color: alpha.white(0.35), textAlign: "center" },
});

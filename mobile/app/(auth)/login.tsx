import { useEffect, useState } from "react";
import { View, Text, Alert, TouchableOpacity, ActivityIndicator, Dimensions } from "react-native";
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import { MotiView } from "moti";
import { useAuth } from "@/lib/auth/AuthContext";
import { SPOTIFY_DISCOVERY, SPOTIFY_SCOPES, getRedirectUri } from "@/lib/auth/pkce";
import { env } from "@/lib/env";
import { Svg, Path, Rect, Defs, RadialGradient, Stop, G } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";

WebBrowser.maybeCompleteAuthSession();

const { width, height } = Dimensions.get("window");

function SpotifyIcon({ size = 22, color = "#000" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <Path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.586 14.424a.622.622 0 01-.857.207c-2.348-1.435-5.304-1.76-8.785-.964a.622.622 0 11-.277-1.215c3.809-.87 7.076-.496 9.712 1.115a.623.623 0 01.207.857zm1.223-2.722a.78.78 0 01-1.072.257C14.1 12.2 10.539 11.7 7.2 12.657a.78.78 0 01-.448-1.492c3.775-1.133 7.754-.584 10.788 1.465a.78.78 0 01.269 1.072zm.105-2.835C14.693 9.05 9.396 8.875 6.222 9.84a.936.936 0 11-.543-1.79c3.633-1.101 9.674-.889 13.492 1.363a.936.936 0 01-.257 1.454z" />
    </Svg>
  );
}

const BAR_COUNT = 38;
const BAR_HEIGHTS = [
  60, 80, 110, 130, 70, 160, 40, 140, 60, 30, 180, 100, 50, 130, 70,
  200, 80, 120, 40, 160, 100, 60, 140, 50, 180, 70, 120, 60, 160, 90,
  130, 50, 110, 70, 190, 60, 130, 80,
];

function WaveformBackground() {
  const barWidth = 3;
  const gap = (width - BAR_COUNT * barWidth) / (BAR_COUNT + 1);
  const svgHeight = height * 0.55;

  return (
    <View style={{ position: "absolute", top: 0, left: 0, right: 0, height: svgHeight, overflow: "hidden" }}>
      <Svg width={width} height={svgHeight} viewBox={`0 0 ${width} ${svgHeight}`}>
        <Defs>
          <RadialGradient id="g1" cx="60%" cy="30%" rx="60%" ry="60%">
            <Stop offset="0%" stopColor="#1db954" stopOpacity="0.18" />
            <Stop offset="100%" stopColor="#0a0a0a" stopOpacity="0" />
          </RadialGradient>
          <RadialGradient id="g2" cx="20%" cy="70%" rx="50%" ry="50%">
            <Stop offset="0%" stopColor="#0d7a3e" stopOpacity="0.12" />
            <Stop offset="100%" stopColor="#0a0a0a" stopOpacity="0" />
          </RadialGradient>
        </Defs>

        {/* Glow blobs */}
        <Rect x="0" y="0" width={width} height={svgHeight} fill="url(#g1)" />
        <Rect x="0" y="0" width={width} height={svgHeight} fill="url(#g2)" />

        {/* Waveform bars */}
        <G opacity="0.09">
          {BAR_HEIGHTS.map((barH, i) => {
            const x = gap + i * (barWidth + gap);
            const y = svgHeight - barH;
            return (
              <Rect
                key={i}
                x={x}
                y={y}
                width={barWidth}
                height={barH}
                rx={1.5}
                fill="#1db954"
              />
            );
          })}
        </G>
      </Svg>
    </View>
  );
}

export default function LoginScreen() {
  const { login } = useAuth();
  const [signingIn, setSigningIn] = useState(false);
  const redirectUri = getRedirectUri();
  const insets = useSafeAreaInsets();

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    { clientId: env.spotifyClientId, scopes: SPOTIFY_SCOPES, usePKCE: true, redirectUri },
    SPOTIFY_DISCOVERY
  );

  useEffect(() => {
    if (!response) return;

    if (response.type === "success" && request?.codeVerifier) {
      const { code } = response.params;
      setSigningIn(true);
      login({ code, codeVerifier: request.codeVerifier, redirectUri })
        .catch((err: any) => {
          Alert.alert("Sign-in failed", err?.message || "We couldn't connect to Spotify. Please try again.");
        })
        .finally(() => setSigningIn(false));
    } else if (response.type === "error") {
      Alert.alert("Sign-in failed", response.error?.message || "Spotify sign-in was cancelled or failed.");
    }
  }, [response, request, redirectUri, login]);

  return (
    <View style={{ flex: 1, backgroundColor: "#0a0a0a" }}>
      {/* Waveform + glow background */}
      <WaveformBackground />

      {/* Hero text — sits over the waveform */}
      <MotiView
        from={{ opacity: 0, translateY: 24 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "timing", duration: 600, delay: 100 }}
        style={{
          position: "absolute",
          top: insets.top + height * 0.12,
          left: 32,
          right: 32,
        }}
      >
        <Text
          style={{
            fontSize: 11,
            letterSpacing: 3,
            color: "#1db954",
            textTransform: "uppercase",
            marginBottom: 14,
            fontWeight: "600",
          }}
        >
          EchoStats
        </Text>
        <Text
          style={{
            fontSize: 44,
            color: "#ffffff",
            lineHeight: 50,
            marginBottom: 14,
            fontWeight: "700",
          }}
        >
          Your music,{"\n"}
          <Text style={{ color: "#1db954" }}>decoded.</Text>
        </Text>
        <Text
          style={{
            fontSize: 15,
            color: "#888888",
            lineHeight: 24,
            fontWeight: "300",
          }}
        >
          Years of listening history,{"\n"}surfaced in seconds.
        </Text>
      </MotiView>

      {/* Bottom section — pinned to bottom */}
      <MotiView
        from={{ opacity: 0, translateY: 30 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "timing", duration: 600, delay: 300 }}
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          paddingHorizontal: 28,
          paddingBottom: insets.bottom + 24,
        }}
      >
        {/* Stats row */}
        <View style={{ flexDirection: "row", gap: 10, marginBottom: 24 }}>
          {[
            { num: "271K+", label: "Tracks logged" },
            { num: "48hrs", label: "Avg play time" },
            { num: "12K", label: "Artists" },
          ].map((s) => (
            <View
              key={s.label}
              style={{
                flex: 1,
                backgroundColor: "#111111",
                borderWidth: 0.5,
                borderColor: "#222222",
                borderRadius: 10,
                padding: 12,
              }}
            >
              <Text style={{ fontSize: 18, color: "#ffffff", fontWeight: "700" }}>
                {s.num}
              </Text>
              <Text
                style={{
                  fontSize: 10,
                  color: "#555555",
                  marginTop: 3,
                  letterSpacing: 0.6,
                  textTransform: "uppercase",
                  fontWeight: "400",
                }}
              >
                {s.label}
              </Text>
            </View>
          ))}
        </View>

        {/* Divider */}
        <View style={{ height: 0.5, backgroundColor: "#1f1f1f", marginBottom: 18 }} />

        {/* Legal */}
        <Text
          style={{
            fontSize: 11,
            color: "#444444",
            textAlign: "center",
            lineHeight: 18,
            marginBottom: 18,
          }}
        >
          We only read what you listen to.{"\n"}
          <Text style={{ color: "#606060" }}>Your password stays with Spotify.</Text>
        </Text>

        {/* CTA Button */}
        <TouchableOpacity
          disabled={signingIn || !request}
          onPress={() => promptAsync()}
          activeOpacity={0.85}
          style={{
            height: 56,
            borderRadius: 14,
            backgroundColor: signingIn ? "#155e3a" : "#1db954",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            opacity: !request ? 0.5 : 1,
          }}
        >
          {signingIn ? (
            <>
              <ActivityIndicator size="small" color="#1db954" />
              <Text style={{ fontSize: 15, color: "#1db954", fontWeight: "600" }}>
                Connecting…
              </Text>
            </>
          ) : (
            <>
              <SpotifyIcon size={22} color="#000000" />
              <Text style={{ fontSize: 15, color: "#000000", fontWeight: "600" }}>
                Continue with Spotify
              </Text>
            </>
          )}
        </TouchableOpacity>
      </MotiView>
    </View>
  );
}
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { exchangeSpotifyCode, fetchSpotifyProfile, upsertSpotifyUser } from "@/lib/spotify-auth";
import { signMobileAccessToken, signMobileRefreshToken, ACCESS_TOKEN_TTL_SECONDS } from "@/lib/mobile-auth";

const BodySchema = z.object({
  code: z.string().min(1),
  code_verifier: z.string().min(1),
  redirect_uri: z.string().url(),
});

// ─── POST /api/mobile-auth/token ───────────────────────────────────────────────
// Exchanges a Spotify PKCE authorization code (obtained client-side by the
// Expo app via expo-auth-session) for the app's own mobile session tokens.
// The mobile client never sees Spotify's access/refresh tokens.

export async function POST(req: NextRequest) {
  const parsed = BodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 422 }
    );
  }
  const { code, code_verifier, redirect_uri } = parsed.data;

  try {
    const tokens = await exchangeSpotifyCode({
      code,
      codeVerifier: code_verifier,
      redirectUri: redirect_uri,
    });
    const profile = await fetchSpotifyProfile(tokens.access_token);

    const user = await upsertSpotifyUser(profile, {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at_ms: Date.now() + tokens.expires_in * 1000,
    });

    const mongoId = user._id.toString();
    const [accessToken, refreshToken] = await Promise.all([
      signMobileAccessToken(mongoId, user.mobileTokenVersion),
      signMobileRefreshToken(mongoId, user.mobileTokenVersion),
    ]);

    return NextResponse.json({
      accessToken,
      refreshToken,
      expiresIn: ACCESS_TOKEN_TTL_SECONDS,
      user: {
        id: mongoId,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        onboardingCompleted: user.onboardingCompleted,
      },
    });
  } catch (err) {
    console.error("[mobile-auth/token]", err);
    return NextResponse.json({ error: "Spotify authentication failed" }, { status: 401 });
  }
}

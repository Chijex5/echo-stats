import { connectDB } from "./db";
import User, { IUser } from "./models/User";

export interface SpotifyProfileLike {
  id: string;
  email: string;
  display_name?: string;
  images?: { url: string }[];
  country?: string;
  product?: string;
}

export interface SpotifyAccountTokens {
  access_token: string;
  refresh_token: string;
  expires_at_ms: number;
}

/**
 * Single source of truth for "a user just completed Spotify OAuth — persist
 * their profile + tokens and return the Mongo user doc." Used by both
 * NextAuth's jwt() callback (web) and the mobile token-exchange endpoint.
 */
export async function upsertSpotifyUser(
  profile: SpotifyProfileLike,
  tokens: SpotifyAccountTokens
): Promise<IUser> {
  await connectDB();

  const existingUser = await User.findOne({
    $or: [{ spotifyId: profile.id }, { email: profile.email }],
  });

  if (existingUser) {
    existingUser.accessToken = tokens.access_token;
    existingUser.refreshToken = tokens.refresh_token;
    existingUser.tokenExpiresAt = tokens.expires_at_ms;
    await existingUser.save();
    return existingUser;
  }

  return User.create({
    spotifyId: profile.id,
    email: profile.email,
    displayName: profile.display_name ?? "Spotify User",
    avatarUrl: profile.images?.[0]?.url,
    country: profile.country,
    spotifyProduct: profile.product,
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    tokenExpiresAt: tokens.expires_at_ms,
    onboardingCompleted: false,
  });
}

/**
 * Server-side authorization_code exchange for the mobile PKCE flow. Spotify
 * still requires the confidential client's Basic auth header even when the
 * authorize request used PKCE — PKCE is additive, not a substitute for it.
 */
export async function exchangeSpotifyCode(params: {
  code: string;
  codeVerifier: string;
  redirectUri: string;
}): Promise<{ access_token: string; refresh_token: string; expires_in: number }> {
  const basic = Buffer.from(
    `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
  ).toString("base64");

  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code: params.code,
      redirect_uri: params.redirectUri,
      code_verifier: params.codeVerifier,
      client_id: process.env.SPOTIFY_CLIENT_ID!,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Spotify code exchange failed: ${JSON.stringify(err)}`);
  }
  return res.json();
}

/** Fetches the Spotify profile for a freshly-issued access token. */
export async function fetchSpotifyProfile(accessToken: string): Promise<SpotifyProfileLike> {
  const res = await fetch("https://api.spotify.com/v1/me", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(`Spotify /me failed: ${res.status}`);
  return res.json();
}

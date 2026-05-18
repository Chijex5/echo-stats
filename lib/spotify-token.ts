import { connectDB } from "./db";
import User from "./models/User";

/**
 * Returns a guaranteed-fresh Spotify access token for the given MongoDB user ID.
 * Reads from DB, refreshes via Spotify if within 5-min buffer, writes back to DB.
 * Never touches the NextAuth JWT cookie.
 */
export async function getValidSpotifyToken(mongoId: string): Promise<string> {
  await connectDB();

  const user = await User.findById(mongoId).select(
    "accessToken refreshToken tokenExpiresAt"
  );

  if (!user) throw new Error("User not found");

  // Token still fresh — return as-is
  if (Date.now() < user.tokenExpiresAt - 5 * 60 * 1000) {
    return user.accessToken;
  }

  // Token stale — refresh directly against Spotify
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
      grant_type:    "refresh_token",
      refresh_token: user.refreshToken,
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Spotify token refresh failed: ${JSON.stringify(err)}`);
  }

  const data = await res.json();

  // Persist fresh tokens to DB so all future calls benefit
  user.accessToken    = data.access_token;
  user.tokenExpiresAt = Date.now() + data.expires_in * 1000;
  if (data.refresh_token) {
    // Spotify rotates refresh tokens occasionally
    user.refreshToken = data.refresh_token;
  }
  await user.save();

  return user.accessToken;
}
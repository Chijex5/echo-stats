import * as AuthSession from "expo-auth-session";

// Mirrors the scope list NextAuth's SpotifyProvider requests on the web
// (app/api/auth/[...nextauth]/route.ts) so mobile and web sessions have
// identical Spotify permissions.
export const SPOTIFY_SCOPES = [
  "user-read-email",
  "user-read-private",
  "user-read-currently-playing",
  "user-top-read",
  "user-read-recently-played",
  "user-library-read",
];

export const SPOTIFY_DISCOVERY: AuthSession.DiscoveryDocument = {
  authorizationEndpoint: "https://accounts.spotify.com/authorize",
  tokenEndpoint: "https://accounts.spotify.com/api/token",
};

export function getRedirectUri() {
  return AuthSession.makeRedirectUri({ scheme: "echostats", path: "callback" });
}

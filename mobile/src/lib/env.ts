function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Missing required env var ${name}. Check mobile/.env`);
  }
  return value;
}

export const env = {
  apiBaseUrl: required("EXPO_PUBLIC_API_BASE_URL", process.env.EXPO_PUBLIC_API_BASE_URL),
  spotifyClientId: required("EXPO_PUBLIC_SPOTIFY_CLIENT_ID", process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_ID),
};

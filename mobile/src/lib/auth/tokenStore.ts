import * as SecureStore from "expo-secure-store";

const ACCESS_KEY = "echostats.accessToken";
const REFRESH_KEY = "echostats.refreshToken";
const USER_KEY = "echostats.user";

export type StoredUser = {
  id: string;
  displayName: string;
  avatarUrl: string | null;
  onboardingCompleted: boolean;
};

export async function getTokens() {
  const [accessToken, refreshToken] = await Promise.all([
    SecureStore.getItemAsync(ACCESS_KEY),
    SecureStore.getItemAsync(REFRESH_KEY),
  ]);
  return { accessToken, refreshToken };
}

export async function setTokens(accessToken: string, refreshToken: string) {
  await Promise.all([
    SecureStore.setItemAsync(ACCESS_KEY, accessToken),
    SecureStore.setItemAsync(REFRESH_KEY, refreshToken),
  ]);
}

export async function clearTokens() {
  await Promise.all([
    SecureStore.deleteItemAsync(ACCESS_KEY),
    SecureStore.deleteItemAsync(REFRESH_KEY),
    SecureStore.deleteItemAsync(USER_KEY),
  ]);
}

export async function getStoredUser(): Promise<StoredUser | null> {
  const raw = await SecureStore.getItemAsync(USER_KEY);
  return raw ? (JSON.parse(raw) as StoredUser) : null;
}

export async function setStoredUser(user: StoredUser) {
  await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
}

import { env } from "@/lib/env";
import { getTokens, setTokens, clearTokens } from "@/lib/auth/tokenStore";

let refreshPromise: Promise<string | null> | null = null;
let onUnauthenticated: (() => void) | null = null;

export function setUnauthenticatedHandler(handler: (() => void) | null) {
  onUnauthenticated = handler;
}

// De-dupes concurrent refreshes behind one in-flight promise — if three
// requests 401 at once, only one POST /refresh fires.
async function refreshAccessToken(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const { refreshToken } = await getTokens();
      if (!refreshToken) return null;
      try {
        const res = await fetch(`${env.apiBaseUrl}/api/mobile-auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        });
        if (!res.ok) return null;
        const data = (await res.json()) as { accessToken: string; refreshToken: string };
        // The backend rotates the refresh token on every call — both the new
        // access token AND the rotated refresh token must be persisted, or the
        // stale refresh token left in storage 401s ("Token revoked") next time.
        await setTokens(data.accessToken, data.refreshToken);
        return data.accessToken;
      } catch {
        return null;
      }
    })();
  }
  const result = await refreshPromise;
  refreshPromise = null;
  return result;
}

export async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const { accessToken } = await getTokens();
  const headers = new Headers(init.headers);
  if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);
  if (!headers.has("Content-Type") && !(init.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  let res = await fetch(`${env.apiBaseUrl}${path}`, { ...init, headers });

  if (res.status === 401) {
    const newAccessToken = await refreshAccessToken();
    if (!newAccessToken) {
      await clearTokens();
      onUnauthenticated?.();
      return res;
    }
    headers.set("Authorization", `Bearer ${newAccessToken}`);
    res = await fetch(`${env.apiBaseUrl}${path}`, { ...init, headers });
  }

  return res;
}

export async function apiJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await apiFetch(path, init);
  if (!res.ok) {
    throw new Error(`Request failed: ${res.status} ${path}`);
  }
  return res.json() as Promise<T>;
}

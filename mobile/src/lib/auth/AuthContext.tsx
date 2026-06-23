import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { env } from "@/lib/env";
import { apiFetch, setUnauthenticatedHandler } from "@/lib/api/client";
import {
  getTokens,
  setTokens,
  clearTokens,
  getStoredUser,
  setStoredUser,
  type StoredUser,
} from "./tokenStore";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

type TokenExchangePayload = {
  code: string;
  codeVerifier: string;
  redirectUri: string;
};

type AuthContextValue = {
  status: AuthStatus;
  user: StoredUser | null;
  login: (payload: TokenExchangePayload) => Promise<StoredUser>;
  logout: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<StoredUser | null>(null);

  useEffect(() => {
    setUnauthenticatedHandler(() => {
      setUser(null);
      setStatus("unauthenticated");
    });
    return () => setUnauthenticatedHandler(null);
  }, []);

  useEffect(() => {
    (async () => {
      const { refreshToken } = await getTokens();
      const storedUser = await getStoredUser();
      if (refreshToken && storedUser) {
        setUser(storedUser);
        setStatus("authenticated");
      } else {
        setStatus("unauthenticated");
      }
    })();
  }, []);

  const login = useCallback(async ({ code, codeVerifier, redirectUri }: TokenExchangePayload) => {
    const res = await fetch(`${env.apiBaseUrl}/api/mobile-auth/token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, code_verifier: codeVerifier, redirect_uri: redirectUri }),
    });
    if (!res.ok) {
      throw new Error("Spotify authentication failed");
    }
    const data = await res.json();
    await setTokens(data.accessToken, data.refreshToken);
    const nextUser: StoredUser = {
      id: data.user.id,
      displayName: data.user.displayName,
      avatarUrl: data.user.avatarUrl,
      onboardingCompleted: data.user.onboardingCompleted,
    };
    await setStoredUser(nextUser);
    setUser(nextUser);
    setStatus("authenticated");
    return nextUser;
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiFetch("/api/mobile-auth/logout", { method: "POST" });
    } catch {
      // best-effort — clear local state regardless of network result
    }
    await clearTokens();
    setUser(null);
    setStatus("unauthenticated");
  }, []);

  const completeOnboarding = useCallback(async () => {
    if (!user) return;
    const nextUser = { ...user, onboardingCompleted: true };
    await setStoredUser(nextUser);
    setUser(nextUser);
  }, [user]);

  const value = useMemo(
    () => ({ status, user, login, logout, completeOnboarding }),
    [status, user, login, logout, completeOnboarding]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

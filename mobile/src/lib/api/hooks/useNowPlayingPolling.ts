import { useEffect, useState } from "react";
import { AppState } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { apiJson } from "@/lib/api/client";
import type { NowPlayingSyncResponse } from "./types";

function useAppIsActive() {
  const [active, setActive] = useState(AppState.currentState === "active");

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      setActive(state === "active");
    });
    return () => subscription.remove();
  }, []);

  return active;
}

// AppState-aware now-playing poll: refetches every 45s while the app is in
// the foreground, stops entirely while backgrounded (no wasted network calls
// or battery while the user isn't looking).
export function useNowPlayingPolling(intervalMs = 45_000) {
  const active = useAppIsActive();

  return useQuery({
    queryKey: ["now-playing"],
    queryFn: () => apiJson<NowPlayingSyncResponse>("/api/dashboard/now-playing"),
    refetchInterval: active ? intervalMs : false,
    refetchIntervalInBackground: false,
  });
}

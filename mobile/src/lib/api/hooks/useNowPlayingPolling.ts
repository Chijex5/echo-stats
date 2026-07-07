import { useQuery } from "@tanstack/react-query";
import { apiJson } from "@/lib/api/client";
import type { NowPlayingSyncResponse } from "./types";

// Polls every `intervalMs` while the app is foregrounded. Pausing in the
// background and refetching immediately on resume (instead of waiting out
// the rest of the interval, which could leave a stale "now playing" track
// showing for up to `intervalMs` after reopening the app) is handled by
// React Query's focus manager — see registerQueryFocusManager in
// queryClient.ts, wired to AppState once at the app root.
export function useNowPlayingPolling(intervalMs = 45_000) {
  return useQuery({
    queryKey: ["now-playing"],
    queryFn: () => apiJson<NowPlayingSyncResponse>("/api/dashboard/now-playing"),
    refetchInterval: intervalMs,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
  });
}

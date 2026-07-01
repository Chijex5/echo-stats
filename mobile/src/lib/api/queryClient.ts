import { QueryClient, focusManager } from "@tanstack/react-query";
import { AppState, Platform, type AppStateStatus } from "react-native";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 60_000,
    },
  },
});

function onAppStateChange(status: AppStateStatus) {
  if (Platform.OS !== "web") {
    focusManager.setFocused(status === "active");
  }
}

// React Query's "focus" concept (pause background polling, refetch
// immediately on refocus) is a browser `visibilitychange` thing by default
// and does nothing on its own in React Native. Wiring it to AppState here —
// once, app-wide — makes every `refetchInterval` query (e.g.
// useNowPlayingPolling) pause the instant the app backgrounds and refetch
// right away on resume, instead of every screen reinventing its own
// AppState listener to approximate the same behavior.
export function registerQueryFocusManager() {
  const subscription = AppState.addEventListener("change", onAppStateChange);
  return () => subscription.remove();
}

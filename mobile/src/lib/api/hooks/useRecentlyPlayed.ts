import { useQuery } from "@tanstack/react-query";
import { apiJson } from "@/lib/api/client";
import type { RecentlyPlayedResponse } from "./types";

export function useRecentlyPlayed(limit = 12) {
  return useQuery({
    queryKey: ["recently-played", limit],
    queryFn: () => apiJson<RecentlyPlayedResponse>(`/api/dashboard/recently-played?limit=${limit}`),
  });
}

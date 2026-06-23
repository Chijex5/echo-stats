import { useQuery } from "@tanstack/react-query";
import { apiJson } from "@/lib/api/client";
import type { TopTracksResponse } from "./types";

export function useTopTracks(limit = 10) {
  return useQuery({
    queryKey: ["top-tracks", limit],
    queryFn: () => apiJson<TopTracksResponse>(`/api/dashboard/top-tracks?limit=${limit}`),
  });
}

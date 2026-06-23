import { useQuery } from "@tanstack/react-query";
import { apiJson } from "@/lib/api/client";
import type { TopArtistsResponse } from "./types";

export function useTopArtists(limit = 8) {
  return useQuery({
    queryKey: ["top-artists", limit],
    queryFn: () => apiJson<TopArtistsResponse>(`/api/dashboard/top-artists?limit=${limit}`),
  });
}

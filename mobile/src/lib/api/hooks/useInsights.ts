import { useQuery } from "@tanstack/react-query";
import { apiJson } from "@/lib/api/client";
import type { InsightsResponse } from "./types";

export function useInsights() {
  return useQuery({
    queryKey: ["insights"],
    queryFn: () => apiJson<InsightsResponse>("/api/dashboard/insights"),
  });
}

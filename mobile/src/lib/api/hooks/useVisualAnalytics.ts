import { useQuery } from "@tanstack/react-query";
import { apiJson } from "@/lib/api/client";
import type { VisualAnalyticsResponse } from "./types";

export function useVisualAnalytics() {
  return useQuery({
    queryKey: ["visual-analytics"],
    queryFn: () => apiJson<VisualAnalyticsResponse>("/api/dashboard/visual-analytics"),
  });
}

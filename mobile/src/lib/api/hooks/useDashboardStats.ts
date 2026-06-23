import { useQuery } from "@tanstack/react-query";
import { apiJson } from "@/lib/api/client";
import type { DashboardStatsResponse } from "./types";

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: () => apiJson<DashboardStatsResponse>("/api/dashboard/stats"),
  });
}

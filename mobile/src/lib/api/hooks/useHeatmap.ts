import { useQuery } from "@tanstack/react-query";
import { apiJson } from "@/lib/api/client";
import type { HeatmapResponse } from "./types";

export function useHeatmap() {
  return useQuery({
    queryKey: ["heatmap"],
    queryFn: () => apiJson<HeatmapResponse>("/api/dashboard/heatmap"),
  });
}

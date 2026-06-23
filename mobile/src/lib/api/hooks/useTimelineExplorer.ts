import { useQuery } from "@tanstack/react-query";
import { apiJson } from "@/lib/api/client";
import type { TimelineResponse } from "./types";

export function useTimelineExplorer() {
  return useQuery({
    queryKey: ["timeline-explorer"],
    queryFn: () => apiJson<TimelineResponse>("/api/dashboard/timeline"),
  });
}

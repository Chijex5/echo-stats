import { useQuery } from "@tanstack/react-query";
import { apiJson } from "@/lib/api/client";
import type { TimelinePageResponse } from "./types";

export function useTimelinePage() {
  return useQuery({
    queryKey: ["timeline-page"],
    queryFn: () => apiJson<TimelinePageResponse>("/api/dashboard/timeline-page"),
  });
}

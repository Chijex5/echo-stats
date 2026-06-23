import { useQuery } from "@tanstack/react-query";
import { apiJson } from "@/lib/api/client";
import type { StoryModeResponse } from "./types";

export function useStoryMode(from?: string, to?: string) {
  const qs = new URLSearchParams();
  if (from) qs.set("from", from);
  if (to) qs.set("to", to);
  const suffix = qs.toString() ? `?${qs.toString()}` : "";

  return useQuery({
    queryKey: ["story-mode", from ?? null, to ?? null],
    queryFn: () => apiJson<StoryModeResponse>(`/api/dashboard/story${suffix}`),
  });
}

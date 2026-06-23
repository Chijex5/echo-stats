import { useQuery } from "@tanstack/react-query";
import { apiJson } from "@/lib/api/client";
import type { StoryPreviewResponse } from "./types";

export function useStoryPreview() {
  return useQuery({
    queryKey: ["story-preview"],
    queryFn: () => apiJson<StoryPreviewResponse>("/api/dashboard/story-preview"),
  });
}

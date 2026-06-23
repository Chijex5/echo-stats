import { useQuery } from "@tanstack/react-query";
import { apiJson } from "@/lib/api/client";
import type { ProfileResponse } from "./types";

export function useProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: () => apiJson<ProfileResponse>("/api/dashboard/profile"),
  });
}

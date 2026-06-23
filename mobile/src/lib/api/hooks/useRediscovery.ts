import { useQuery } from "@tanstack/react-query";
import { apiJson } from "@/lib/api/client";
import type { RediscoveryResponse } from "./types";

export function useRediscovery() {
  return useQuery({
    queryKey: ["rediscovery"],
    queryFn: () => apiJson<RediscoveryResponse>("/api/dashboard/rediscovery"),
  });
}

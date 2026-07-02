import { useQuery } from "@tanstack/react-query";
import { apiJson } from "@/lib/api/client";
import type { ImportStatusResponse } from "./types";

export function useImportStatus() {
  return useQuery({
    queryKey: ["import-status"],
    queryFn: () => apiJson<ImportStatusResponse>("/api/user/import-status"),
  });
}

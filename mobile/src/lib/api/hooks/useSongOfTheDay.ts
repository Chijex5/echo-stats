import { useQuery } from "@tanstack/react-query";
import { apiJson } from "@/lib/api/client";
import type { SongOfTheDayResponse } from "./types";

export function useSongOfTheDay() {
  return useQuery({
    queryKey: ["song-of-the-day"],
    queryFn: () => apiJson<SongOfTheDayResponse>("/api/dashboard/song-of-the-day"),
  });
}

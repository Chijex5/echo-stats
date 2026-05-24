"use client";
import useSWR from "swr";

const fetcher = (u: string) => fetch(u).then(r => r.json());

type Recent = { trackName: string; artistName: string; albumImageUrl: string | null; ts: string };

export function RecentlyPlayedDesktop() {
  const { data } = useSWR<{ tracks: Recent[] }>("/api/dashboard/recently-played?limit=10", fetcher, { revalidateOnFocus: false });
  const tracks = data?.tracks ?? [];
  return (
    <section className="hidden lg:block">
      <h2 className="text-2xl font-bold tracking-tight mb-4">Recently played</h2>
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] divide-y divide-white/5">
        {tracks.map((t, i) => (
          <div key={`${t.trackName}-${t.ts}-${i}`} className="flex items-center gap-3 p-3">
            <div className="w-10 h-10 rounded overflow-hidden bg-white/10 shrink-0">{t.albumImageUrl ? <img src={t.albumImageUrl} className="w-full h-full object-cover" alt={t.trackName} /> : null}</div>
            <div className="min-w-0 flex-1"><p className="text-sm truncate">{t.trackName}</p><p className="text-xs text-white/50 truncate">{t.artistName}</p></div>
          </div>
        ))}
      </div>
    </section>
  );
}

"use client";

import type { LucideIcon } from "lucide-react";
import { Flame, TrendingDown, GitCompareArrows } from "lucide-react";
import { useTopArtists } from "@/lib/hooks/useDashboard";

function InsightItem({ title, value, sub, Icon }: { title: string; value: string; sub: string; Icon: LucideIcon }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div className="flex items-center gap-2 text-white/60 text-xs uppercase tracking-wider"><Icon size={14} /> {title}</div>
      <p className="text-xl font-bold mt-2 truncate">{value}</p>
      <p className="text-xs text-white/50 mt-1">{sub}</p>
    </div>
  );
}

export function TopArtistsInsights() {
  const { data, isLoading } = useTopArtists(30);
  const artists = data?.artists ?? [];
  const sortedByDelta = [...artists].sort((a, b) => b.delta - a.delta);
  const fastRising = sortedByDelta.find((a) => a.delta > 0) ?? null;
  const forgotten = [...artists].sort((a, b) => a.delta - b.delta).find((a) => a.delta < 0) ?? null;
  const totalDrift = artists.reduce((acc, a) => acc + Math.abs(a.delta), 0);
  const driftPct = artists.length ? Math.min(100, Math.round((totalDrift / artists.reduce((n, a) => n + a.plays, 1)) * 100)) : 0;

  if (isLoading) return <div className="text-sm text-white/60">Loading artist insights…</div>;

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold tracking-tight">Artist insights</h2>
      <div className="grid md:grid-cols-3 gap-4">
        <InsightItem title="Drift comparison" value={`${driftPct}% shift`} sub="How much your artist rotation changed vs previous month." Icon={GitCompareArrows} />
        <InsightItem title="Fast rising artist" value={fastRising?.name ?? "No major riser"} sub={fastRising ? `+${fastRising.delta} plays this month` : "Keep listening to surface a rising artist."} Icon={Flame} />
        <InsightItem title="Forgotten artist" value={forgotten?.name ?? "No drop detected"} sub={forgotten ? `${forgotten.delta} plays vs last month` : "No notable decline in your top artists."} Icon={TrendingDown} />
      </div>
    </section>
  );
}

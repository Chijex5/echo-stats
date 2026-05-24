"use client";

import { Sidebar } from "@/components/Sidebar";
import { TopNav } from "@/components/TopNav";
import { TopArtistsSection } from "@/components/TopArtistsSection";
import { TopArtistsInsights } from "@/components/TopArtistsInsights";

export default function TopArtistsPage() {
  return (
    <div className="min-h-screen bg-background text-white selection:bg-spotify/30 selection:text-white flex overflow-x-hidden">
      <Sidebar />
      <div className="flex-1 lg:ml-64 flex flex-col overflow-x-hidden">
        <TopNav />
        <main className="flex-1 px-4 py-6 md:px-8 md:py-10 w-full">
          <div className="max-w-[1400px] mx-auto relative overflow-x-hidden">
            <div className="relative z-10 flex flex-col gap-10">
              <section>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Top artists</h1>
                <p className="mt-2 text-white/60">Top 30 artists and trends from your listening history.</p>
              </section>
              <TopArtistsSection limit={30} />
              <TopArtistsInsights />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

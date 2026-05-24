"use client";

import { Sidebar } from "@/components/Sidebar";
import { TopNav } from "@/components/TopNav";
import { TopTracks } from "@/components/TopTracks";
import { VisualAnalyticsSection } from "@/components/VisualAnalyticsSection";
import { Insights } from "@/components/Insights";
import { RediscoverySection } from "@/components/RediscoverySection";

export default function TopTracksPage() {
  return (
    <div className="min-h-screen bg-background text-white selection:bg-spotify/30 selection:text-white flex overflow-x-hidden">
      <Sidebar />
      <div className="flex-1 lg:ml-64 flex flex-col overflow-x-hidden">
        <TopNav />
        <main className="flex-1 px-4 py-6 md:px-8 md:py-10 w-full">
          <div className="max-w-[1400px] mx-auto relative overflow-x-hidden">
            <div className="absolute top-0 right-0 w-[700px] h-[700px] bg-emerald-500/10 rounded-full blur-[150px] pointer-events-none mix-blend-screen -z-10" />
            <div className="absolute top-[35%] -left-40 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[150px] pointer-events-none mix-blend-screen -z-10" />

            <div className="relative z-10 flex flex-col gap-12">
              <section>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Top tracks</h1>
                <p className="mt-2 text-white/60">Live listening data from your imported history and Spotify sync.</p>
              </section>

              <TopTracks limit={50} />
              <VisualAnalyticsSection />
              <Insights />
              <RediscoverySection />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

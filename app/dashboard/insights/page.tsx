"use client";

import { Sidebar } from "@/components/Sidebar";
import { TopNav } from "@/components/TopNav";
import { Insights } from "@/components/Insights";
import { VisualAnalyticsSection } from "@/components/VisualAnalyticsSection";
import { StoryModePreviewSection } from "@/components/StoryModePreviewSection";

export default function InsightsPage() {
  return (
    <div className="min-h-screen bg-background text-white selection:bg-spotify/30 selection:text-white flex overflow-x-hidden">
      <Sidebar />
      <div className="flex-1 lg:ml-64 flex flex-col overflow-x-hidden">
        <TopNav />
        <main className="flex-1 px-4 py-6 md:px-8 md:py-10 w-full">
          <div className="max-w-[1400px] mx-auto relative overflow-x-hidden">
            <div className="absolute top-0 right-0 w-[700px] h-[700px] bg-violet-500/10 rounded-full blur-[150px] pointer-events-none mix-blend-screen -z-10" />
            <div className="absolute top-[35%] -left-40 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[150px] pointer-events-none mix-blend-screen -z-10" />

            <div className="relative z-10 flex flex-col gap-12">
              <section>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Insights</h1>
                <p className="mt-2 text-white/60">All cards below are powered by live imported and synced listening data.</p>
              </section>

              <Insights />
              <VisualAnalyticsSection />
              <StoryModePreviewSection />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

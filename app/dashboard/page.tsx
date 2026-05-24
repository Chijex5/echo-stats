"use client";
import { Sidebar } from '@/components/Sidebar';
import { TopNav } from '@/components/TopNav';
import { HeroSection } from '@/components/HeroSection';
import { WidgetStrip } from '@/components/WidgetStrip';
import { TopTracks } from '@/components/TopTracks';
import { TopArtistsSection } from '@/components/TopArtistsSection';
import { Insights } from '@/components/Insights';
import { TimelineExplorerSection } from '@/components/TimelineExplorerSection';
import { VisualAnalyticsSection } from '@/components/VisualAnalyticsSection';
import { RediscoverySection } from '@/components/RediscoverySection';
import { StoryModePreviewSection } from '@/components/StoryModePreviewSection';
import { RecentlyPlayedDesktop } from '@/components/RecentlyPlayedDesktop';
// app/dashboard/page.tsx
export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background text-white selection:bg-spotify/30 selection:text-white flex overflow-x-hidden">
      <Sidebar />

      {/* flex-1 takes remaining width; lg:ml-64 offsets the fixed sidebar */}
      <div className="flex-1 lg:ml-64 flex flex-col overflow-x-hidden">
        <TopNav />

        <main className="flex-1 px-4 py-6 md:px-8 md:py-10 w-full">
          {/* max-w constraint lives here, not on <main> */}
          <div className="max-w-[1400px] mx-auto relative overflow-x-hidden">

            {/* Ambient blobs — clipped by parent overflow-x-hidden */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[150px] pointer-events-none mix-blend-screen -z-10" />
            <div className="absolute top-[40%] -left-40 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[150px] pointer-events-none mix-blend-screen -z-10" />
            <div className="absolute bottom-0 -right-40 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[150px] pointer-events-none mix-blend-screen -z-10" />

            <div className="relative z-10 flex flex-col gap-12">
              <HeroSection />
              <WidgetStrip />
              <RecentlyPlayedDesktop />
              <TopTracks />
              <TopArtistsSection />
              <Insights />
              <TimelineExplorerSection />
              <VisualAnalyticsSection />
              <RediscoverySection />
              <StoryModePreviewSection />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
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
export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background text-white selection:bg-spotify/30 selection:text-white flex">
      <Sidebar />

      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen relative">
        <TopNav />

        <main className="flex-1 p-6 md:p-10 max-w-[1400px] mx-auto w-full relative">
          {/* Ambient Page Blobs */}
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-emerald-500/10 rounded-full blur-[150px] pointer-events-none mix-blend-screen" />
          <div className="absolute top-[40%] left-[-20%] w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-[150px] pointer-events-none mix-blend-screen" />
          <div className="absolute bottom-0 right-[-10%] w-[700px] h-[700px] bg-blue-600/10 rounded-full blur-[150px] pointer-events-none mix-blend-screen" />

          <div className="relative z-10 flex flex-col gap-12">
            <HeroSection />
            <WidgetStrip />
            <TopTracks />
            <TopArtistsSection />
            <Insights />
            <TimelineExplorerSection />
            <VisualAnalyticsSection />
            <RediscoverySection />
            <StoryModePreviewSection />
          </div>
        </main>
      </div>
    </div>);

}
import { Hero } from '@/components/Hero';
import { Features } from '@/components/Features';
import { Timeline } from '@/components/Timeline';
import { StoryMode } from '@/components/StoryMode';
import { SocialProof } from '@/components/SocialProof';
import { FinalCTA } from '@/components/FinalCTA';
export default function LandingPage() {
  return (
    <main>
      <Hero />
      <Features />
      <Timeline />
      <StoryMode />
      <SocialProof />
      <FinalCTA />
    </main>);

}
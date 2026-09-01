import { HeroLineup } from '@/components/HeroLineup';
import { BrandStory } from '@/components/BrandStory';
import { MeetLibre } from '@/components/MeetLibre';
import { ProductShowcase } from '@/components/ProductShowcase';
import { WhenSection } from '@/components/WhenSection';
import { StoryGallery } from '@/components/StoryGallery';
import { VibeSelector } from '@/components/VibeSelector';
import { OriginStory } from '@/components/OriginStory';
import { FinalCTA } from '@/components/FinalCTA';

/**
 * The journey, in order:
 * meet the range → feel → meet → taste → when → share → vibe → shop.
 *
 * The colour travels with it: Cava Cream opens, Tempranillo Rouge carries the
 * argument, Sol Yellow asks the question, Verdejo Vine holds the stories, Azul
 * takes the collage, and Cream closes it where it started.
 */
export default function Home() {
  return (
    <>
      <HeroLineup />
      <BrandStory />
      <MeetLibre />
      <ProductShowcase />
      <WhenSection />
      <StoryGallery />
      <VibeSelector />
      <OriginStory />
      <FinalCTA />
    </>
  );
}

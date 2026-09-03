import type { Metadata } from 'next';
import { StoryWall } from '@/components/StoryWall';

export const metadata: Metadata = {
  title: 'The Stories',
  description:
    'The LIBRE wall — the range, the tables, the light, and the evenings that ' +
    'did not need an occasion.',
};

/**
 * One wall, and nothing else.
 *
 * This page used to carry a hero, the homepage's horizontal story strip, a wall
 * of shot-brief placeholders, the scrapbook and the chaos button. The strip is
 * still on the homepage, so it was running twice; the placeholders and the
 * scrapbook were art direction for a shoot rather than content.
 *
 * What is left is the photography, framed and hung, with the gallery label
 * doing the work the hero used to. Removing the chaos button here retires it
 * from the site — it is not rendered anywhere now.
 */
export default function StoriesPage() {
  return <StoryWall />;
}

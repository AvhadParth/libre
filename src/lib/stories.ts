import { SHOW_SAMPLE_VALUES } from './content-config';
import type { ThemeName } from './products';

/**
 * ⚠ ALL STORY CONTENT IS PLACEHOLDER.
 * No real customer story, location, name or quote has been supplied. `brief` is
 * genuine art direction for the photographer; `caption` and `place` are sample
 * text shown only so the interaction can be reviewed, and they render with a
 * SAMPLE marker beside them.
 */
export type Story = {
  id: string;
  brief: string;
  caption: string | null;
  place: string | null;
  tone: ThemeName;
  ratio: string;
  /** Which product this moment belongs to, once the client confirms it. */
  product: string | null;
};

const s = <T,>(v: T): T | null => (SHOW_SAMPLE_VALUES ? v : null);

export const stories: Story[] = [
  {
    id: 'st-01',
    brief: 'Rooftop, blue hour. Six people, four chairs. Someone is standing on the good one.',
    caption: s('Nobody planned this one.'),
    place: s('Location TBC'),
    tone: 'mist',
    ratio: '3 / 4',
    product: null,
  },
  {
    id: 'st-02',
    brief: 'Hands only: a bottle being passed across a table mid-sentence. Motion blur welcome.',
    caption: s('The pass.'),
    place: s('Location TBC'),
    tone: 'sol',
    ratio: '4 / 3',
    product: null,
  },
  {
    id: 'st-03',
    brief: 'Kitchen floor picnic. Takeaway boxes, two glasses, a laptop paused mid-episode.',
    caption: s('Tuesday, technically.'),
    place: s('Location TBC'),
    tone: 'cream',
    ratio: '1 / 1',
    product: null,
  },
  {
    id: 'st-04',
    brief: 'Long table outdoors, late. String lights, dishes not cleared, everyone still talking.',
    caption: s('Third hour.'),
    place: s('Location TBC'),
    tone: 'rouge',
    ratio: '3 / 4',
    product: null,
  },
  {
    id: 'st-05',
    brief: 'Portrait: someone laughing hard enough to look away from the camera. Golden hour.',
    caption: s('Mid-story.'),
    place: s('Location TBC'),
    tone: 'azul',
    ratio: '4 / 5',
    product: null,
  },
  {
    id: 'st-06',
    brief: 'Detail: two glasses meeting, out of focus faces behind. Shot wide open.',
    caption: s('No toast, no reason.'),
    place: s('Location TBC'),
    tone: 'mist',
    ratio: '4 / 3',
    product: null,
  },
];

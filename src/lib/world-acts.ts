import type { ThemeName } from './products';

/**
 * The five verbs, shared by the page and the acts.
 *
 * Deliberately its own module and NOT exported from WorldActs: that file is a
 * client component, and a value imported from a `'use client'` module into a
 * server component arrives as a client reference rather than the array itself,
 * so the page cannot map over it. It fails at prerender, not at type-check.
 */
export type ActKind = 'pop' | 'pour' | 'feel' | 'share' | 'celebrate';

export const ACTS: {
  kind: ActKind;
  verb: string;
  line: string;
  theme: ThemeName;
}[] = [
  { kind: 'pop', verb: 'Pop', line: 'The sound that starts the evening.', theme: 'sol' },
  { kind: 'pour', verb: 'Pour', line: 'Generously. It is not a tasting.', theme: 'rouge' },
  { kind: 'feel', verb: 'Feel', line: 'Whatever the room is doing.', theme: 'mist' },
  { kind: 'share', verb: 'Share', line: 'The bottle, the table, the story.', theme: 'vine' },
  { kind: 'celebrate', verb: 'Celebrate', line: 'Or don’t. Tuesday counts.', theme: 'azul' },
];

/** The same five as a contents list for the page's opening. */
export const ACT_INDEX = ACTS.map((a, i) => ({
  n: String(i + 1).padStart(2, '0'),
  verb: a.verb,
}));

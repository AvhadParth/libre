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
  /**
   * Footage for this act. All five have it now — Share was the last to be
   * shot, so it no longer falls back to the Verdejo ground and the passing
   * bottles. An act with no video still degrades to that.
   */
  video?: string;
}[] = [
  { kind: 'pop', verb: 'Pop', line: 'The sound that starts the evening.', theme: 'sol', video: 'pop' },
  { kind: 'pour', verb: 'Pour', line: 'Generously. It is not a tasting.', theme: 'rouge', video: 'pour' },
  { kind: 'feel', verb: 'Feel', line: 'Whatever the room is doing.', theme: 'mist', video: 'feel' },
  { kind: 'share', verb: 'Share', line: 'The bottle, the table, the story.', theme: 'vine', video: 'share' },
  { kind: 'celebrate', verb: 'Celebrate', line: 'Or don’t. Tuesday counts.', theme: 'azul', video: 'celebrate' },
];

/** The same five as a contents list for the page's opening. */
export const ACT_INDEX = ACTS.map((a, i) => ({
  n: String(i + 1).padStart(2, '0'),
  verb: a.verb,
}));

'use client';

/**
 * Sound architecture.
 *
 * Nothing ever autoplays, and nothing plays at all until two things are true:
 * the client has supplied audio files, and the visitor has explicitly turned
 * sound on. Until then every cue below is a no-op and the control stays hidden,
 * so the site never ships a mute button for silence.
 *
 * >>> TO ENABLE:
 * 1. Drop the cue files into /public/sound/ using the names in CUES
 * 2. Set SOUND_AVAILABLE to true
 *
 * The visitor's choice persists, defaults to OFF, and sound is never required
 * to understand anything on the site.
 */
export const SOUND_AVAILABLE = false;

export const CUES = {
  pop: '/sound/pop.mp3',      // the cork leaving the neck
  pour: '/sound/pour.mp3',    // the stream, looped for the length of the pour
  glass: '/sound/glass.mp3',  // the glass being set down
  tap: '/sound/tap.mp3',      // buttons and chips
  burst: '/sound/burst.mp3',  // confetti / celebration
} as const;

export type Cue = keyof typeof CUES;

const KEY = 'libre.sound.v1';
const listeners = new Set<(on: boolean) => void>();
const pool = new Map<Cue, HTMLAudioElement>();
let enabled = false;

export const soundAvailable = () => SOUND_AVAILABLE;
export const isSoundOn = () => enabled;

export function initSound() {
  if (!SOUND_AVAILABLE || typeof window === 'undefined') return;
  try {
    enabled = localStorage.getItem(KEY) === 'on';
  } catch {
    enabled = false;
  }
  listeners.forEach((fn) => fn(enabled));
}

export function setSound(on: boolean) {
  enabled = on;
  try {
    localStorage.setItem(KEY, on ? 'on' : 'off');
  } catch {
    /* storage blocked — the choice simply stays session-only */
  }
  if (!on) pool.forEach((el) => el.pause());
  listeners.forEach((fn) => fn(on));
}

export function onSoundChange(fn: (on: boolean) => void): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

function element(cue: Cue): HTMLAudioElement | null {
  if (typeof window === 'undefined') return null;
  let el = pool.get(cue);
  if (!el) {
    el = new Audio(CUES[cue]);
    el.preload = 'none';
    pool.set(cue, el);
  }
  return el;
}

/** Fire a cue. Silent unless audio exists AND the visitor asked for it. */
export function playCue(cue: Cue, { volume = 0.5, loop = false } = {}) {
  if (!SOUND_AVAILABLE || !enabled) return;
  const el = element(cue);
  if (!el) return;
  el.loop = loop;
  el.volume = volume;
  el.currentTime = 0;
  // A rejected play() means the browser blocked it — never a reason to throw.
  void el.play().catch(() => {});
}

export function stopCue(cue: Cue) {
  const el = pool.get(cue);
  if (el) {
    el.pause();
    el.currentTime = 0;
  }
}

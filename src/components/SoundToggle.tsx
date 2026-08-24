'use client';

import { useEffect, useState } from 'react';
import { initSound, isSoundOn, onSoundChange, setSound, soundAvailable } from '@/lib/sound';
import styles from './SoundToggle.module.css';

/**
 * The mute control. Renders only when audio actually exists — a toggle for
 * silence would be worse than no toggle at all.
 */
export function SoundToggle() {
  const [on, setOn] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    initSound();
    setOn(isSoundOn());
    setMounted(true);
    return onSoundChange(setOn);
  }, []);

  if (!soundAvailable() || !mounted) return null;

  return (
    <button
      type="button"
      className={styles.toggle}
      onClick={() => setSound(!on)}
      aria-pressed={on}
      data-on={on}
      data-cursor={on ? 'QUIET' : 'SOUND ON'}
    >
      <span className="sr-only">{on ? 'Turn sound off' : 'Turn sound on'}</span>
      <span className={styles.bars} aria-hidden="true">
        <i /><i /><i /><i />
      </span>
      <span className={styles.label} aria-hidden="true">{on ? 'Sound on' : 'Sound off'}</span>
    </button>
  );
}

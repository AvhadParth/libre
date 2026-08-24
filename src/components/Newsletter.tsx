'use client';

import { useRef, useState } from 'react';
import { burstFrom } from './brand/Confetti';
import { Arrow, Scribble } from './brand/Marks';
import styles from './Newsletter.module.css';

type Status = 'idle' | 'sending' | 'done' | 'unconfigured' | 'error';

/**
 * A real signup form, not a decorative one: it validates, it posts, and it
 * reports honestly. Until a provider is wired up in /api/newsletter the route
 * answers 501 and the form says so plainly rather than faking a confirmation.
 */
export function Newsletter({ compact = false }: { compact?: boolean }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');
  const buttonRef = useRef<HTMLButtonElement>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (status === 'sending') return;

    setStatus('sending');
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = (await res.json()) as { message?: string };

      if (res.ok) {
        setStatus('done');
        setMessage(data.message ?? "You're on the list.");
        burstFrom(buttonRef.current, { count: 60 });
      } else if (res.status === 501) {
        setStatus('unconfigured');
        setMessage(data.message ?? 'Newsletter provider not connected yet.');
      } else {
        setStatus('error');
        setMessage(data.message ?? 'That did not go through. Try again?');
      }
    } catch {
      setStatus('error');
      setMessage('No connection. Try again in a moment.');
    }
  };

  return (
    <div className={compact ? styles.compact : styles.block}>
      {!compact && (
        <h2 className={`display display--m ${styles.heading}`}>
          <span className="marked">
            First pour
            <Scribble kind="underline" />
          </span>
          <br />
          gets the news.
        </h2>
      )}

      <form className={styles.form} onSubmit={submit} noValidate={false}>
        <label className={styles.field}>
          <span className="sr-only">Email address</span>
          <input
            type="email"
            name="email"
            required
            autoComplete="email"
            placeholder="you@somewhere.good"
            className={styles.input}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-describedby="newsletter-status"
            disabled={status === 'done'}
          />
        </label>

        <button
          ref={buttonRef}
          type="submit"
          className={`btn ${styles.submit}`}
          disabled={status === 'sending' || status === 'done'}
          data-cursor={status === 'done' ? 'NICE' : 'COUNT ME IN'}
        >
          {status === 'sending' ? 'Sending' : status === 'done' ? 'You’re in' : 'Count me in'}
          <Arrow className="btn__arrow" />
        </button>
      </form>

      <p
        id="newsletter-status"
        className={styles.status}
        data-status={status}
        role="status"
        aria-live="polite"
      >
        {status === 'idle'
          ? 'No spam. Just the good stuff, occasionally.'
          : message}
      </p>
    </div>
  );
}

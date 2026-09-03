'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { WALL, plate, type Piece } from '@/lib/wall';
import styles from './StoryWall.module.css';

/**
 * A wall of frames, hung.
 *
 * The page used to carry a hero, the homepage's horizontal story strip, a wall
 * of shot-brief placeholders, the scrapbook and the chaos button. It is one
 * thing now: the photography, framed, on a wall — with the only text being a
 * gallery label and the seven captions already written for these pictures.
 *
 * Hung rather than gridded: every frame declares how many of twelve columns it
 * is worth and the grid packs them densely, so the wall comes out irregular the
 * way a salon hang is, without any frame being placed by hand at a breakpoint
 * that will move later. The plain packshots are the smallest things on it.
 *
 * Enlarging uses a native <dialog>. showModal() brings the focus trap, the
 * Escape key and inertness of the page behind it for free — all the parts of a
 * lightbox that are easy to get wrong by hand.
 */
export function StoryWall() {
  const dialog = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState<Piece | null>(null);

  const show = useCallback((piece: Piece) => {
    setOpen(piece);
    dialog.current?.showModal();
  }, []);

  const hide = useCallback(() => {
    dialog.current?.close();
  }, []);

  /* Keep React's state in step however the dialog was dismissed — Escape and
     the backdrop both close it without going through our handler. */
  useEffect(() => {
    const el = dialog.current;
    if (!el) return;
    const onClose = () => setOpen(null);
    el.addEventListener('close', onClose);
    return () => el.removeEventListener('close', onClose);
  }, []);

  return (
    <section className={styles.wall} aria-labelledby="wall-title">
      <ul className={styles.hang}>
        {/* The wall text, hung in the first position like a gallery label. */}
        <li className={styles.label}>
          <h1 className={styles.labelTitle} id="wall-title">
            The Stories
          </h1>
          <p className={styles.labelLine}>
            Nothing here was scheduled. That is the entire editorial policy.
          </p>
        </li>

        {WALL.map((piece) => (
          <li
            key={piece.src}
            className={styles.piece}
            style={{ '--span': piece.span, '--ratio': piece.ratio } as React.CSSProperties}
          >
            <button type="button" className={styles.frame} onClick={() => show(piece)}>
              <span className={styles.mat}>
                <img
                  className={styles.plate}
                  src={plate(piece.src)}
                  alt={piece.alt}
                  loading="lazy"
                  decoding="async"
                />
              </span>
              {piece.caption && <span className={styles.plaque}>{piece.caption}</span>}
              <span className="sr-only">Enlarge</span>
            </button>
          </li>
        ))}
      </ul>

      <dialog ref={dialog} className={styles.lightbox} onClick={(e) => {
        /* Clicking the backdrop — the dialog element itself — closes it. */
        if (e.target === dialog.current) hide();
      }}>
        {open && (
          <figure className={styles.lightboxInner}>
            <img className={styles.lightboxPlate} src={plate(open.src)} alt={open.alt} />
            <figcaption className={styles.lightboxCaption}>
              {open.caption ?? open.alt}
            </figcaption>
          </figure>
        )}
        <button type="button" className={styles.close} onClick={hide} autoFocus>
          <span aria-hidden="true">Close</span>
          <span className="sr-only">Close the enlarged picture</span>
        </button>
      </dialog>
    </section>
  );
}

import styles from './Pending.module.css';

/**
 * Honest empty states.
 *
 * Anything the client has not supplied renders through these, so a placeholder
 * can never quietly graduate into an approved product claim. They are designed
 * to look intentional — a dashed slot reads as "reserved", not as broken.
 */

export function Pending({
  children = 'Awaiting client supply',
  inline = false,
}: {
  children?: React.ReactNode;
  inline?: boolean;
}) {
  return (
    <span className={inline ? styles.inline : styles.block}>
      <span className={styles.dot} aria-hidden="true" />
      {children}
    </span>
  );
}

/** Marks a value that is present only so the design can be reviewed. */
export function SampleTag({ label = 'Sample' }: { label?: string }) {
  return (
    <span className={styles.sample} title="Placeholder value for design review — not approved copy">
      {label}
    </span>
  );
}

/** A short banner for pages whose entire content set is pending. */
export function PendingNote({ children }: { children: React.ReactNode }) {
  return <p className={styles.note}>{children}</p>;
}

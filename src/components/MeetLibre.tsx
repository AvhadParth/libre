import { Reveal } from './Reveal';
import { Themed } from './Themed';
import { Frame } from './Frame';
import { Marquee } from './Marquee';
import { Scribble } from './brand/Marks';
import styles from './MeetLibre.module.css';

const PILLARS = [
  { title: 'Freedom', line: 'Nobody has to explain why they are not drinking.' },
  { title: 'Joy', line: 'The loud part of the evening, kept intact.' },
  { title: 'Expression', line: 'Your table, your rules, your playlist.' },
];

/**
 * The editorial introduction. Deliberately the calmest section on the site —
 * after the pour, the visitor has earned somewhere to put their eyes.
 */
export function MeetLibre() {
  return (
    <Themed theme="cream" id="meet" className={styles.section}>
      <div className={`shell ${styles.head}`}>
        <Reveal variant="mask">
          <h2 className={`display display--l ${styles.title}`}>
            Meet{' '}
            <span className="marked">
              LIBRE.
              <Scribble kind="underline" />
            </span>
          </h2>
        </Reveal>

        <Reveal delay={0.1}>
          <p className="lede">
            Non-alcoholic wine, built for the part of wine nobody argues about.
          </p>
        </Reveal>
      </div>

      <div className={`shell ${styles.body}`}>
        <Reveal className={styles.copy} variant="lines" as="div">
          <p className="body body--wide">
            The table. The noise. The second bottle. The story someone tells
            badly and everyone hears twice. That was always the good bit.
          </p>
          <p className="body body--wide">
            LIBRE keeps all of it and quietly drops the rules that came with it —
            the correct glass, the correct year, the correct face to make while
            you swirl. Freedom, joy, flavour and expression, with nothing to
            apologise for and no occasion to wait for.
          </p>
        </Reveal>

        <div className={styles.art}>
          <Frame
            brief="Four friends at a small table, late afternoon light, mid-argument about something unimportant. Nobody posing."
            tone="mist" ratio="4 / 5" rotate={-2}
          />
          <Frame
            brief="Close crop: a glass being set down on a wooden table, condensation, a hand still holding it."
            tone="vine" ratio="1 / 1" rotate={4} className={styles.artSmall}
          />
        </div>
      </div>

      <ul className={`shell ${styles.pillars}`}>
        {PILLARS.map((pillar, i) => (
          <li key={pillar.title}>
            <Reveal delay={i * 0.08}>
              <div className={styles.pillar}>
                <span className={styles.pillarNo}>0{i + 1}</span>
                <h3 className="display display--s">{pillar.title}</h3>
                <p className="body">{pillar.line}</p>
              </div>
            </Reveal>
          </li>
        ))}
      </ul>

      <Marquee
        items={['Pure joy', 'No occasion required', 'Wine without the rules', 'Just LIBRE']}
      />
    </Themed>
  );
}

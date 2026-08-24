import type { Fact, Product } from '@/lib/products';
import { Pending } from './Pending';
import { Reveal } from './Reveal';
import { Themed } from './Themed';
import { Dots } from './brand/Marks';
import styles from './WhatsInside.module.css';

function FactList({ title, facts }: { title: string; facts: Fact[] | null }) {
  return (
    <div className={styles.group}>
      <h3 className={styles.groupHead}>{title}</h3>
      {facts === null ? (
        <Pending>{title} awaiting client supply</Pending>
      ) : (
        <dl className={styles.dl}>
          {facts.map((fact) => (
            <div key={fact.label} className={styles.pair}>
              <dt>{fact.label}</dt>
              <dd>{fact.value ?? <Pending inline>TBC</Pending>}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}

/**
 * The information section, treated as typography rather than a spec sheet.
 * Nothing here is authored: every value comes from the catalogue, and anything
 * the client has not supplied stays visibly empty.
 */
export function WhatsInside({ product }: { product: Product }) {
  return (
    <Themed theme="cream" className={styles.section} id="inside">
      <Dots className={styles.dots} size={34} radius={2.6} />

      <div className={`shell ${styles.inner}`}>
        <Reveal variant="mask">
          <h2 className={`display display--l ${styles.title}`}>
            What’s
            <br />
            inside?
          </h2>
        </Reveal>

        <div className={styles.groups}>
          <div className={styles.group}>
            <h3 className={styles.groupHead}>Ingredients</h3>
            {product.ingredients === null ? (
              <Pending>Ingredient list awaiting client supply</Pending>
            ) : (
              <ul className={styles.ingredients}>
                {product.ingredients.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            )}
          </div>

          <FactList title="Product details" facts={product.details} />
          <FactList title="Nutrition" facts={product.nutrition} />
        </div>
      </div>

      <p className={`shell ${styles.legal}`}>
        Ingredients, nutrition, alcohol-content statements and any regulatory
        wording must be supplied and approved by the client before publication.
        Nothing on this page has been authored on the brand’s behalf.
      </p>
    </Themed>
  );
}

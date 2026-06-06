import { features } from './data.js';
import styles from './kaelthas.module.css';

export function Features() {
  return (
    <section id="features" className={styles.section}>
      <div className={styles.sectionHead}>
        <h2 className={styles.sectionTitle}>FEATURES</h2>
        <p className={styles.sectionSub}>Custom Content &amp; New Experiences</p>
      </div>
      <div className={styles.grid}>
        {features.map((feature) => (
          <article key={feature.title} className={styles.card}>
            <div className={styles.cardImageWrap}>
              <img
                className={styles.cardImage}
                src={feature.image}
                alt={feature.title}
                loading="lazy"
              />
            </div>
            <div className={styles.cardBody}>
              <h3 className={styles.cardTitle}>{feature.title}</h3>
              <p className={styles.cardText}>{feature.description}</p>
              <a href="#features" className={styles.readMore}>
                Read More...
              </a>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

import { Link } from 'react-router-dom';
import { communityStats } from './data.js';
import styles from './kaelthas.module.css';

export function Journey() {
  const registered = communityStats.registeredAccounts;
  const characters = communityStats.createdCharacters;
  const online = communityStats.playersOnline;

  return (
    <section id="join" className={styles.journey}>
      <div className={styles.sectionHead}>
        <h2 className={styles.sectionTitle}>STARTE DEINE REISE</h2>
        <p className={styles.sectionSub}>
          Werde noch heute Teil von Kaelthas und erlebe Nordend wie nie zuvor.
        </p>
      </div>

      <Link to="/register" className={`${styles.cta} ${styles.ctaLarge}`} data-testid="journey-join-btn">
        Jetzt beitreten
      </Link>

      <div className={styles.statsBox}>
        <div className={styles.statsTitle}>Tritt einer lebendigen Community bei</div>
        <p className={styles.statLine}>
          Registrierte Accounts: <strong>{registered.toLocaleString('de-DE')}</strong>
        </p>
        <p className={styles.statLine}>
          Erstellte Charaktere: <strong>{characters.toLocaleString('de-DE')}</strong>
        </p>
      </div>
    </section>
  );
}

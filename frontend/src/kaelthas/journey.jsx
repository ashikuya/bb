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
        <h2 className={styles.sectionTitle}>START YOUR JOURNEY</h2>
        <p className={styles.sectionSub}>
          Join us today and experience Northrend like never before.
        </p>
      </div>

      <Link to="/register" className={`${styles.cta} ${styles.ctaLarge}`}>
        Join Now
      </Link>

      <div className={styles.statsBox}>
        <div className={styles.statsTitle}>Join A Thriving Community</div>
        <p className={styles.statLine}>
          Registered Accounts: <strong>{registered.toLocaleString()}</strong>
        </p>
        <p className={styles.statLine}>
          Created Characters: <strong>{characters.toLocaleString()}</strong>
        </p>
        <div className={styles.onlinePill}>
          <span className={styles.onlineDot} />
          {online} Players Online
        </div>
      </div>
    </section>
  );
}

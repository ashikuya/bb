import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getStatus } from './api.js';
import styles from './kaelthas.module.css';

export function Journey() {
  const [stats, setStats] = useState({ registeredAccounts: 0, createdCharacters: 0 });

  useEffect(() => {
    let active = true;
    getStatus()
      .then((s) => {
        if (!active || !s) return;
        setStats({
          registeredAccounts: s.registeredAccounts ?? 0,
          createdCharacters: s.createdCharacters ?? 0,
        });
      })
      .catch(() => {});
    return () => { active = false; };
  }, []);

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
          Registrierte Accounts: <strong>{stats.registeredAccounts.toLocaleString('de-DE')}</strong>
        </p>
        <p className={styles.statLine}>
          Erstellte Charaktere: <strong>{stats.createdCharacters.toLocaleString('de-DE')}</strong>
        </p>
      </div>
    </section>
  );
}

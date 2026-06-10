import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getStatus } from './api.js';
import styles from './kaelthas.module.css';

export function Hero() {
  // Echte AzerothCore-Daten (mit Polling alle 30 Sekunden)
  const [stats, setStats] = useState({
    playersOnline: 0,
    registeredAccounts: 0,
    createdCharacters: 0,
    realmOnline: false,
  });

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const s = await getStatus();
        if (!active || !s) {
          if (active) setStats((p) => ({ ...p, realmOnline: false }));
          return;
        }
        setStats({
          playersOnline: s.playersOnline ?? 0,
          registeredAccounts: s.registeredAccounts ?? 0,
          createdCharacters: s.createdCharacters ?? 0,
          realmOnline: s.database === 'connected',
        });
      } catch {
        if (active) setStats((p) => ({ ...p, realmOnline: false }));
      }
    }
    load();
    const id = setInterval(load, 30000);
    return () => { active = false; clearInterval(id); };
  }, []);

  const { playersOnline, registeredAccounts, createdCharacters, realmOnline } = stats;

  return (
    <section id="home" className={styles.hero}>
      {/* Episches Hintergrundbild — generiert per Nano Banana */}
      <div className={styles.heroBg}
        style={{ backgroundImage: `url(${process.env.PUBLIC_URL}/hero-bg.jpg)` }} />
      {/* Atmosphärische Overlays für Tiefe */}
      <div className={styles.heroVignette} />
      <div className={styles.heroAuroraGlow} />

      {/* Statusleiste */}
      <div className={styles.statusBar} data-testid="status-bar">
        <span className={styles.statusItem}>
          <span
            className={styles.statusDot}
            style={{
              background: realmOnline ? '#4ade80' : '#ef4444',
              boxShadow: `0 0 10px ${realmOnline ? '#4ade80' : '#ef4444'}`,
            }}
          />
          Realm {realmOnline ? 'Online' : 'Offline'}
        </span>
        <span className={styles.statusDivider} />
        <span className={styles.statusItem}>
          <strong>{playersOnline.toLocaleString('de-DE')}</strong> Spieler online
        </span>
        <span className={styles.statusDivider} />
        <span className={styles.statusItem}>WotLK 3.3.5a</span>
      </div>

      <div className={styles.heroContent}>
        <div className={styles.heroKicker}>Wrath of the Lich King</div>

        <h1 className={styles.heroTitle}>
          KAELTHAS
          <span>Der Frostthron erwartet dich</span>
        </h1>

        <p className={styles.heroSub}>
          Ein angepasster AzerothCore-Realm für die wahren Nordend-Veteranen.
          Blizzlike-Gefühl, frische Inhalte und eine lebendige Community.
        </p>

        <Link to="/register" className={styles.cta} data-testid="hero-join-btn">
          Jetzt beitreten
        </Link>

        <div className={styles.heroStats}>
          <div className={styles.heroStat}>
            <span className={styles.heroStatNum} data-testid="hero-accounts">
              {registeredAccounts.toLocaleString('de-DE')}
            </span>
            <span className={styles.heroStatLabel}>Accounts</span>
          </div>
          <div className={styles.heroStat}>
            <span className={styles.heroStatNum} data-testid="hero-characters">
              {createdCharacters.toLocaleString('de-DE')}
            </span>
            <span className={styles.heroStatLabel}>Charaktere</span>
          </div>
          <div className={styles.heroStat}>
            <span className={styles.heroStatNum}>x10</span>
            <span className={styles.heroStatLabel}>XP-Rate</span>
          </div>
        </div>
      </div>
    </section>
  );
}

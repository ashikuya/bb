import { useState } from 'react';
import { Link } from 'react-router-dom';
import { customRaces, communityStats } from './data.js';
import styles from './kaelthas.module.css';

export function Hero() {
  const [stats] = useState({
    playersOnline: communityStats.playersOnline,
    registeredAccounts: communityStats.registeredAccounts,
    createdCharacters: communityStats.createdCharacters,
  });

  const online = stats.playersOnline;
  const accounts = stats.registeredAccounts;
  const characters = stats.createdCharacters;

  return (
    <section id="home" className={styles.hero}>
      {/* Episches Hintergrundbild — generiert per Nano Banana */}
      <div className={styles.heroBg}
        style={{ backgroundImage: `url(${process.env.PUBLIC_URL}/hero-bg.jpg)` }} />
      {/* Atmosphärische Overlays für Tiefe */}
      <div className={styles.heroVignette} />
      <div className={styles.heroAuroraGlow} />

      {/* Statusleiste */}
      <div className={styles.statusBar}>
        <span className={styles.statusItem}>
          <span className={styles.statusDot} /> Realm Online
        </span>
        <span className={styles.statusDivider} />
        <span className={styles.statusItem}>
          <strong>{online}</strong> Spieler online
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
            <span className={styles.heroStatNum}>{accounts.toLocaleString('de-DE')}</span>
            <span className={styles.heroStatLabel}>Accounts</span>
          </div>
          <div className={styles.heroStat}>
            <span className={styles.heroStatNum}>{characters.toLocaleString('de-DE')}</span>
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

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { heroImage, customRaces, communityStats } from './data.js';
import { KaelthasLogo } from './logo.jsx';
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
      <div className={styles.heroBg} style={{ backgroundImage: `url(${heroImage})` }} />
      <div className={styles.heroOverlay} />

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
        {/* großer Frostmourne-Logo-Block über dem Titel */}
        <div className={styles.heroLogoWrap} style={{ marginTop: '5rem' }}>
          <div className={styles.runeRing} />
          <div className={styles.runeRingInner} />
          <div className={styles.logoGlow} />
          <KaelthasLogo size={260} className={styles.heroLogo} />
        </div>

        <div className={styles.heroKicker}>Wrath of the Lich King · 3.3.5a</div>

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

        <div className={styles.racesStrip}>
          <div className={styles.racesTitle}>Eigene Völker</div>
          <div className={styles.racesList}>
            {customRaces.map((race, i) => (
              <span key={race}>
                {race}{i < customRaces.length - 1 ? ' •' : ''}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

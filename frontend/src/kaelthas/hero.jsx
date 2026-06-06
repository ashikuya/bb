import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { heroImage, customRaces, communityStats } from './data.js';
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
          <strong>{online}</strong> Players Online
        </span>
        <span className={styles.statusDivider} />
        <span className={styles.statusItem}>WotLK 3.3.5a</span>
      </div>

      <div className={styles.heroContent}>
        <div className={styles.heroKicker} style={{ marginTop: '3.5rem' }}>Wrath of the Lich King · 3.3.5a</div>

        <h1 className={styles.heroTitle}>
          KAELTHAS
          <span>The Frozen Throne Awaits</span>
        </h1>

        <p className={styles.heroSub}>
          A custom AzerothCore realm built for the true Northrend veteran.
          Blizzlike feel, fresh content, and a thriving community.
        </p>

        <Link to="/register" className={styles.cta}>
          Join Now
        </Link>

        <div className={styles.heroStats}>
          <div className={styles.heroStat}>
            <span className={styles.heroStatNum}>{accounts.toLocaleString()}</span>
            <span className={styles.heroStatLabel}>Accounts</span>
          </div>
          <div className={styles.heroStat}>
            <span className={styles.heroStatNum}>{characters.toLocaleString()}</span>
            <span className={styles.heroStatLabel}>Characters</span>
          </div>
          <div className={styles.heroStat}>
            <span className={styles.heroStatNum}>x10</span>
            <span className={styles.heroStatLabel}>XP Rates</span>
          </div>
        </div>

        <div className={styles.racesStrip}>
          <div className={styles.racesTitle}>Custom Races</div>
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

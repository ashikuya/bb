import { KaelthasLogo } from './logo.jsx';
import {
  DiscordIcon,
  YouTubeIcon,
  TikTokIcon,
  InstagramIcon,
} from './icons.jsx';
import styles from './kaelthas.module.css';

const footerLinks = [
  'Start',
  'Impressum',
  'Nutzungsbedingungen',
  'Datenschutz',
  'Rückerstattung',
  'Regeln',
];

const socials = [
  { label: 'Discord',   href: '#discord',   Icon: DiscordIcon,   className: styles.discord },
  { label: 'YouTube',   href: '#youtube',   Icon: YouTubeIcon,   className: styles.youtube },
  { label: 'TikTok',    href: '#tiktok',    Icon: TikTokIcon,    className: styles.tiktok },
  { label: 'Instagram', href: '#instagram', Icon: InstagramIcon, className: styles.instagram },
];

export function Footer() {
  return (
    <footer className={styles.footer}>
      <KaelthasLogo size={120} className={styles.footerLogo} />

      <div className={styles.socials}>
        {socials.map(({ label, href, Icon, className }) => (
          <a key={label} href={href}
            className={`${styles.social} ${className}`}
            aria-label={label}>
            <Icon className={styles.socialIcon} />
          </a>
        ))}
      </div>

      <nav className={styles.footerLinks}>
        {footerLinks.map((link) => (
          <a key={link} href="#" className={styles.footerLink}>{link}</a>
        ))}
      </nav>

      <p className={styles.footerNote}>
        „World of Warcraft" und „Blizzard Entertainment" sind Marken oder
        eingetragene Marken von Blizzard Entertainment in den USA und/oder
        anderen Ländern. Alle entsprechenden Begriffe, Materialien, Logos und
        Bilder sind Copyright © Blizzard Entertainment. Diese Seite steht
        in keiner Verbindung zu Blizzard Entertainment und wird nicht von
        Blizzard Entertainment unterstützt.
      </p>
      <p className={styles.footerVersion}>
        Alle Rechte vorbehalten. © KAELTHAS — v3.3.5a
      </p>
    </footer>
  );
}

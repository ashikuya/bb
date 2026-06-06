import { KaelthasLogo } from './logo.jsx';
import {
  DiscordIcon,
  YouTubeIcon,
  TikTokIcon,
  InstagramIcon,
} from './icons.jsx';
import styles from './kaelthas.module.css';

const footerLinks = [
  'Home',
  'Imprint',
  'Terms of Service',
  'Privacy Policy',
  'Refund Policy',
  'Rules',
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
      <KaelthasLogo size={110} className={styles.footerLogo} />

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
        "World of Warcraft" and "Blizzard Entertainment" are all trademarks or
        registered trademarks of Blizzard Entertainment in the United States
        and/or other countries. These terms and all related materials, logos,
        and images are copyright © Blizzard Entertainment. This site is in no
        way associated with or endorsed by Blizzard Entertainment.
      </p>
      <p className={styles.footerVersion}>
        All rights reserved. © KAELTHAS — v3.3.5a
      </p>
    </footer>
  );
}

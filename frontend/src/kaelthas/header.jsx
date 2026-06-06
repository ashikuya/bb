import { Link } from 'react-router-dom';
import { navItems } from './data.js';
import { LoginIcon } from './icons.jsx';
import { KaelthasLogo } from './logo.jsx';
import styles from './kaelthas.module.css';

export function Header() {
  return (
    <header className={styles.header}>
      <Link to="/" className={styles.logo}>
        <KaelthasLogo size={60} className={styles.logoMark} />
        <span className={styles.logoText}>
          KAEL<span className={styles.logoAccent}>THAS</span>
        </span>
      </Link>
      <nav className={styles.nav}>
        {navItems.map(({ label, href, Icon }) => (
          <Link key={label} to={href} className={styles.navLink}>
            <Icon className={styles.navIcon} />
            <span>{label}</span>
          </Link>
        ))}
      </nav>
      <Link to="/login" className={styles.loginBtn}>
        <LoginIcon className={styles.loginIcon} /> Log In
      </Link>
    </header>
  );
}

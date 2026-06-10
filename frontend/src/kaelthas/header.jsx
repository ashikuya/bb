import { Link } from 'react-router-dom';
import { navItems } from './data.js';
import { useAuth } from './auth-context.jsx';
import { LoginIcon, ShieldIcon } from './icons.jsx';
import { KaelthasLogo } from './logo.jsx';
import styles from './kaelthas.module.css';

export function Header() {
  const { account } = useAuth();

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
        {account?.isAdmin && (
          <Link to="/admin" className={styles.navLink} style={{ color: '#ffb86b' }}>
            <ShieldIcon className={styles.navIcon} />
            <span>Admin</span>
          </Link>
        )}
      </nav>
      {account ? (
        <Link to="/account" className={styles.loginBtn}>
          <LoginIcon className={styles.loginIcon} /> {account.username}
        </Link>
      ) : (
        <Link to="/login" className={styles.loginBtn}>
          <LoginIcon className={styles.loginIcon} /> Log In
        </Link>
      )}
    </header>
  );
}

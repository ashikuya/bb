import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from './auth-context.jsx';
import { KaelthasLogo } from './logo.jsx';
import { Header } from './header.jsx';
import { Frost } from './frost.jsx';
import styles from './auth.module.css';
import pageStyles from './kaelthas.module.css';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await login(username, password);
      navigate('/account');
    } catch (err) {
      setError(err.message || 'Anmeldung fehlgeschlagen.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={pageStyles.page}>
      <Frost count={40} />
      <Header />
      <div className={styles.wrap}>
        <form className={styles.panel} onSubmit={onSubmit} data-testid="login-form">
          <Link to="/" className={styles.backLink}>← Zurück zur Startseite</Link>
          <KaelthasLogo size={88} className={styles.panelLogo} />
          <h1 className={styles.title}>Willkommen zurück</h1>
          <p className={styles.subtitle}>Der Frostthron erwartet dich</p>

          {error && <div className={styles.error} data-testid="login-error">{error}</div>}

          <div className={styles.field}>
            <label className={styles.label} htmlFor="login-user">Account-Name</label>
            <input id="login-user" data-testid="login-username-input" className={styles.input} value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Dein Account-Name" autoComplete="username" />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="login-pass">Passwort</label>
            <input id="login-pass" data-testid="login-password-input" type="password" className={styles.input}
              value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="Dein Passwort" autoComplete="current-password" />
          </div>

          <button type="submit" data-testid="login-submit-btn" className={styles.submit} disabled={busy}>
            {busy ? 'Anmelden…' : 'Anmelden'}
          </button>

          <p className={styles.switch}>
            Neu bei Kaelthas?{' '}
            <Link to="/register" className={styles.switchLink}>Account erstellen</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from './auth-context.jsx';
import { KaelthasLogo } from './logo.jsx';
import { Header } from './header.jsx';
import { Frost } from './frost.jsx';
import styles from './auth.module.css';
import pageStyles from './kaelthas.module.css';

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    if (password !== confirm) { setError('Passwörter stimmen nicht überein.'); return; }
    setBusy(true);
    try {
      await register(username, email, password);
      navigate('/account');
    } catch (err) {
      setError(err.message || 'Registrierung fehlgeschlagen.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={pageStyles.page}>
      <Frost count={40} />
      <Header />
      <div className={styles.wrap}>
        <form className={styles.panel} onSubmit={onSubmit} data-testid="register-form">
          <Link to="/" className={styles.backLink}>← Zurück zur Startseite</Link>
          <KaelthasLogo size={88} className={styles.panelLogo} />
          <h1 className={styles.title}>Account erstellen</h1>
          <p className={styles.subtitle}>Schmiede deine Legende in Nordend</p>

          {error && <div className={styles.error} data-testid="register-error">{error}</div>}

          <div className={styles.field}>
            <label className={styles.label} htmlFor="reg-user">Account-Name</label>
            <input id="reg-user" data-testid="register-username-input" className={styles.input} value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="3–16 Buchstaben oder Zahlen" autoComplete="username" />
            <p className={styles.hint}>Dieser Name ist auch dein Login im Spiel.</p>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="reg-email">E-Mail</label>
            <input id="reg-email" data-testid="register-email-input" type="email" className={styles.input}
              value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="du@example.com" autoComplete="email" />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="reg-pass">Passwort</label>
            <input id="reg-pass" data-testid="register-password-input" type="password" className={styles.input}
              value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="4–16 Zeichen" autoComplete="new-password" />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="reg-confirm">Passwort bestätigen</label>
            <input id="reg-confirm" data-testid="register-confirm-input" type="password" className={styles.input}
              value={confirm} onChange={(e) => setConfirm(e.target.value)}
              placeholder="Passwort wiederholen" autoComplete="new-password" />
          </div>

          <button type="submit" data-testid="register-submit-btn" className={styles.submit} disabled={busy}>
            {busy ? 'Wird erstellt…' : 'Registrieren'}
          </button>

          <p className={styles.switch}>
            Du hast bereits einen Account?{' '}
            <Link to="/login" className={styles.switchLink}>Anmelden</Link>
          </p>

          <p className={styles.demoNote}>
            Realmlist: Trage <strong>logon.kaelthas.com</strong> in deine
            realmlist.wtf ein, um dich zu verbinden (WotLK 3.3.5a).
          </p>
        </form>
      </div>
    </div>
  );
}

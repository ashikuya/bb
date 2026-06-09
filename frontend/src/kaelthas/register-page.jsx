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
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    setBusy(true);
    try {
      await register(username, email, password);
      navigate('/account');
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={pageStyles.page}>
      <Frost count={40} />
      <Header />
      <div className={styles.wrap}>
        <form className={styles.panel} onSubmit={onSubmit}>
          <Link to="/" className={styles.backLink}>← Back to Homepage</Link>
          <KaelthasLogo size={88} className={styles.panelLogo} />
          <h1 className={styles.title}>Create Account</h1>
          <p className={styles.subtitle}>Forge your legend in Northrend</p>

          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.field}>
            <label className={styles.label} htmlFor="reg-user">Account Name</label>
            <input id="reg-user" className={styles.input} value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="3-16 letters or numbers" autoComplete="username" />
            <p className={styles.hint}>This is your in-game login name.</p>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="reg-email">Email</label>
            <input id="reg-email" type="email" className={styles.input}
              value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com" autoComplete="email" />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="reg-pass">Password</label>
            <input id="reg-pass" type="password" className={styles.input}
              value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="4-16 characters" autoComplete="new-password" />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="reg-confirm">Confirm Password</label>
            <input id="reg-confirm" type="password" className={styles.input}
              value={confirm} onChange={(e) => setConfirm(e.target.value)}
              placeholder="Repeat your password" autoComplete="new-password" />
          </div>

          <button type="submit" className={styles.submit} disabled={busy}>
            {busy ? 'Creating...' : 'Register'}
          </button>

          <p className={styles.switch}>
            Already have an account?{' '}
            <Link to="/login" className={styles.switchLink}>Log In</Link>
          </p>

          <p className={styles.demoNote}>
            Realmlist: set <strong>logon.kaelthas.com</strong> in your
            realmlist.wtf to connect (WotLK 3.3.5a).
          </p>
        </form>
      </div>
    </div>
  );
}

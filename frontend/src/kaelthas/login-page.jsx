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
      setError(err.message || 'Login failed.');
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
          <h1 className={styles.title}>Welcome Back</h1>
          <p className={styles.subtitle}>The Frozen Throne awaits you</p>

          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.field}>
            <label className={styles.label} htmlFor="login-user">Account Name</label>
            <input id="login-user" className={styles.input} value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Your account name" autoComplete="username" />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="login-pass">Password</label>
            <input id="login-pass" type="password" className={styles.input}
              value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password" autoComplete="current-password" />
          </div>

          <button type="submit" className={styles.submit} disabled={busy}>
            {busy ? 'Signing in...' : 'Log In'}
          </button>

          <p className={styles.switch}>
            New to Kaelthas?{' '}
            <Link to="/register" className={styles.switchLink}>Create an Account</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

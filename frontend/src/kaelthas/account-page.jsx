import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from './auth-context.jsx';
import { getCharacters, changePassword } from './api.js';
import { raceNames, classNames, classColors, formatMoney, formatPlaytime } from './wow-data.js';
import { Header } from './header.jsx';
import { Frost } from './frost.jsx';
import styles from './account.module.css';
import pageStyles from './kaelthas.module.css';

export function AccountPage() {
  const { account, loading, logout } = useAuth();
  const navigate = useNavigate();
  const [characters, setCharacters] = useState([]);
  const [charsLoading, setCharsLoading] = useState(true);
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [pwMsg, setPwMsg] = useState(null);
  const [pwBusy, setPwBusy] = useState(false);

  useEffect(() => {
    if (!loading && !account) navigate('/login');
  }, [loading, account, navigate]);

  useEffect(() => {
    if (!account) return;
    let active = true;
    getCharacters()
      .then((d) => active && setCharacters(d.characters || []))
      .catch(() => active && setCharacters([]))
      .finally(() => active && setCharsLoading(false));
    return () => { active = false; };
  }, [account]);

  async function onChangePassword(e) {
    e.preventDefault();
    setPwMsg(null);
    if (newPass !== confirmPass) {
      setPwMsg({ ok: false, text: 'Passwords do not match.' }); return;
    }
    setPwBusy(true);
    try {
      await changePassword(newPass);
      setPwMsg({ ok: true, text: 'Password updated successfully.' });
      setNewPass(''); setConfirmPass('');
    } catch (err) {
      setPwMsg({ ok: false, text: err.message || 'Failed to update password.' });
    } finally { setPwBusy(false); }
  }

  async function onLogout() { await logout(); navigate('/'); }

  if (loading || !account) {
    return (
      <div className={pageStyles.page}>
        <Frost count={30} />
        <Header />
        <div className={styles.loading}>Summoning your account...</div>
      </div>
    );
  }

  return (
    <div className={pageStyles.page}>
      <Frost count={40} />
      <Header />
      <div className={styles.wrap}>
        <Link to="/" className={styles.backLink}>← Back to Homepage</Link>
        <div className={styles.headerRow}>
          <h1 className={styles.welcome}>
            Welcome, <span>{account.username}</span>
          </h1>
          <button type="button" className={styles.logoutBtn} onClick={onLogout}>Log Out</button>
        </div>

        <div className={styles.grid}>
          <div className={styles.panel}>
            <h2 className={styles.panelTitle}>Account Details</h2>
            <div className={styles.infoRow}><span className={styles.infoLabel}>Account Name</span><span className={styles.infoValue}>{account.username}</span></div>
            <div className={styles.infoRow}><span className={styles.infoLabel}>Email</span><span className={styles.infoValue}>{account.email}</span></div>
            <div className={styles.infoRow}><span className={styles.infoLabel}>Member Since</span><span className={styles.infoValue}>{account.joinDate ? new Date(account.joinDate).toLocaleDateString() : '—'}</span></div>
            <div className={styles.infoRow}><span className={styles.infoLabel}>Status</span><span className={account.online ? styles.statusOnline : styles.statusOffline}>{account.online ? '● Online' : '○ Offline'}</span></div>
            <div className={styles.infoRow}><span className={styles.infoLabel}>Expansion</span><span className={styles.infoValue}>WotLK 3.3.5a</span></div>
          </div>

          <div className={styles.panel}>
            <h2 className={styles.panelTitle}>Change Password</h2>
            <form onSubmit={onChangePassword}>
              {pwMsg && (
                <div className={`${styles.msg} ${pwMsg.ok ? styles.msgSuccess : styles.msgError}`}>{pwMsg.text}</div>
              )}
              <div className={styles.field}>
                <label className={styles.label} htmlFor="np">New Password</label>
                <input id="np" type="password" className={styles.input} value={newPass}
                  onChange={(e) => setNewPass(e.target.value)} placeholder="4-16 characters" autoComplete="new-password" />
              </div>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="cp">Confirm Password</label>
                <input id="cp" type="password" className={styles.input} value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)} placeholder="Repeat new password" autoComplete="new-password" />
              </div>
              <button type="submit" className={styles.smallBtn} disabled={pwBusy}>
                {pwBusy ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>
        </div>

        <div className={styles.panel} style={{ marginBottom: '1.5rem' }}>
          <h2 className={styles.panelTitle}>Your Characters</h2>
          {charsLoading ? (
            <div className={styles.empty}>Loading characters...</div>
          ) : characters.length === 0 ? (
            <div className={styles.empty}>No characters yet. Log in to the game to create your first hero!</div>
          ) : (
            <div className={styles.charList}>
              {characters.map((c) => (
                <div key={c.guid} className={styles.charCard}>
                  <div className={styles.charLevel}>{c.level}</div>
                  <div className={styles.charInfo}>
                    <p className={styles.charName} style={{ color: classColors[c.class] || '#fff' }}>{c.name}</p>
                    <p className={styles.charMeta}>
                      {raceNames[c.race] || 'Unknown'} {classNames[c.class] || 'Unknown'} · {formatPlaytime(c.totalPlaytime)} played
                    </p>
                  </div>
                  <div className={styles.charMoney}>{formatMoney(c.money)}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={styles.realmBox}>
          <strong>How to connect:</strong> Open <code>WoW/Data/enUS/realmlist.wtf</code> (or your locale folder) and
          set: <code>set realmlist logon.kaelthas.com</code>. Make sure your client is version <code>3.3.5a (build 12340)</code>.
          Then log in with your account name and password above.
        </div>
      </div>
    </div>
  );
}

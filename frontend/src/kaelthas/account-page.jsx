import { useEffect, useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from './auth-context.jsx';
import {
  getCharacters, changePassword,
  uploadAvatar, removeAvatar, updateProfile, getForumRoles,
} from './api.js';
import {
  raceNames, classNames, classColors, formatMoney, formatPlaytime,
} from './wow-data.js';
import { Header } from './header.jsx';
import { Frost } from './frost.jsx';
import styles from './account.module.css';
import pageStyles from './kaelthas.module.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export function AccountPage() {
  const { account, loading, logout, refresh } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('profile');
  const [characters, setCharacters] = useState([]);
  const [charsLoading, setCharsLoading] = useState(true);
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    if (!loading && !account) navigate('/login');
  }, [loading, account, navigate]);

  useEffect(() => {
    if (!account) return;
    let active = true;
    Promise.all([getCharacters(), getForumRoles()])
      .then(([c, r]) => {
        if (!active) return;
        setCharacters(c.characters || []);
        setRoles(r);
      })
      .catch(() => {})
      .finally(() => active && setCharsLoading(false));
    return () => { active = false; };
  }, [account]);

  async function onLogout() { await logout(); navigate('/'); }

  if (loading || !account) {
    return (
      <div className={pageStyles.page}>
        <Frost count={30} />
        <Header />
        <div className={styles.loading}>Beschwöre deinen Account…</div>
      </div>
    );
  }

  const userRoles = (account.roles || []).map((s) =>
    roles.find((r) => r.slug === s) || { slug: s, name: s, color: '#cdd9e6' }
  );

  return (
    <div className={pageStyles.page}>
      <Frost count={40} />
      <Header />
      <div className={styles.wrap}>
        <Link to="/" className={styles.backLink}>← Zurück zur Startseite</Link>

        <div className={styles.profileHeader}>
          <ProfileAvatar account={account} onChange={refresh} />
          <div className={styles.profileMeta}>
            <h1 className={styles.welcome}>{account.username}</h1>
            <div className={styles.profileRoles}>
              {userRoles.map((r) => (
                <span key={r.slug} className={styles.profileRoleBadge} style={{
                  color: r.color, background: r.badge_bg || 'rgba(78,165,211,0.15)',
                  border: `1px solid ${r.badge_border || 'rgba(78,165,211,0.5)'}`,
                }}>
                  {r.icon && <span className={styles.profileRoleIcon}>{r.icon}</span>}
                  {r.name || r.slug}
                </span>
              ))}
            </div>
            <p className={styles.profileEmail}>{account.email || '—'}</p>
          </div>
          <div className={styles.profileActions}>
            {account.isAdmin && (
              <Link to="/admin" className={styles.adminBtn}>⚔ Admin-Panel</Link>
            )}
            <button type="button" data-testid="account-logout-btn" className={styles.logoutBtn} onClick={onLogout}>Abmelden</button>
          </div>
        </div>

        <div className={styles.tabs}>
          {[['profile', 'Profil'], ['characters', 'Charaktere'], ['security', 'Sicherheit']].map(
            ([k, label]) => (
              <button key={k} className={tab === k ? styles.tabActive : styles.tab}
                onClick={() => setTab(k)}>{label}</button>
            )
          )}
        </div>

        {tab === 'profile' && <ProfileTab account={account} onSaved={refresh} />}
        {tab === 'characters' && (
          <CharactersTab characters={characters} loading={charsLoading} />
        )}
        {tab === 'security' && <SecurityTab />}

        <div className={styles.realmBox}>
          <strong>So verbindest du dich:</strong> Öffne <code>WoW/Data/enUS/realmlist.wtf</code>
          {' '}und trage ein: <code>set realmlist logon.kaelthas.com</code>. Client-Version <code>3.3.5a (Build 12340)</code>.
        </div>
      </div>
    </div>
  );
}

// ─── Avatar-Widget ──────────────────────────────────────────────────────────
function ProfileAvatar({ account, onChange }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);

  async function onPick(e) {
    const file = e.target.files?.[0]; if (!file) return;
    setBusy(true);
    try {
      await uploadAvatar(file);
      if (onChange) await onChange();
    } catch (err) { alert(err.message || 'Upload fehlgeschlagen.'); }
    finally { setBusy(false); e.target.value = ''; }
  }

  async function onRemove() {
    if (!window.confirm('Avatar wirklich entfernen?')) return;
    setBusy(true);
    try {
      await removeAvatar();
      if (onChange) await onChange();
    } finally { setBusy(false); }
  }

  const avatarSrc = account.avatarUrl
    ? (account.avatarUrl.startsWith('http') ? account.avatarUrl : `${BACKEND_URL}${account.avatarUrl}`)
    : null;

  return (
    <div className={styles.avatarWrap}>
      <div className={styles.avatar}>
        {avatarSrc ? (
          <img src={avatarSrc} alt="avatar" className={styles.avatarImg} />
        ) : (
          <span className={styles.avatarFallback}>
            {account.username?.[0]?.toUpperCase()}
          </span>
        )}
      </div>
      <div className={styles.avatarActions}>
        <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/gif,image/webp"
          onChange={onPick} hidden />
        <button type="button" className={styles.avatarBtn}
          disabled={busy} onClick={() => inputRef.current?.click()}>
          {busy ? 'Lade hoch…' : 'Avatar ändern'}
        </button>
        {account.avatarUrl && (
          <button type="button" className={styles.avatarBtnGhost} onClick={onRemove} disabled={busy}>
            Entfernen
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Profil-Tab ─────────────────────────────────────────────────────────────
function ProfileTab({ account, onSaved }) {
  const [signature, setSignature] = useState(account.signature || '');
  const [location, setLocation] = useState(account.location || '');
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);

  async function save(e) {
    e.preventDefault(); setMsg(null); setBusy(true);
    try {
      await updateProfile({ signature, location });
      setMsg({ ok: true, text: 'Profil gespeichert.' });
      if (onSaved) await onSaved();
    } catch (err) { setMsg({ ok: false, text: err.message || 'Fehlgeschlagen.' }); }
    finally { setBusy(false); }
  }

  return (
    <div className={styles.panel}>
      <h2 className={styles.panelTitle}>Forum-Profil</h2>
      <form onSubmit={save}>
        {msg && (
          <div className={`${styles.msg} ${msg.ok ? styles.msgSuccess : styles.msgError}`}>
            {msg.text}
          </div>
        )}
        <div className={styles.field}>
          <label className={styles.label}>Standort</label>
          <input className={styles.input} value={location} maxLength={60}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="z. B. Sturmwind, Frostmourne-Zitadelle" />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Signatur (wird unter deinen Forum-Beiträgen angezeigt)</label>
          <textarea className={styles.input} value={signature} rows={3} maxLength={500}
            onChange={(e) => setSignature(e.target.value)}
            placeholder="Eine kurze Signatur für deine Forum-Beiträge…" />
        </div>
        <button type="submit" className={styles.smallBtn} disabled={busy}>
          {busy ? 'Speichere…' : 'Profil speichern'}
        </button>
      </form>
    </div>
  );
}

// ─── Charaktere-Tab ─────────────────────────────────────────────────────────
function CharactersTab({ characters, loading }) {
  if (loading) return <div className={styles.empty}>Lade Charaktere…</div>;
  if (characters.length === 0) {
    return <div className={styles.empty}>Noch keine Charaktere. Logge dich ins Spiel ein, um deinen ersten Helden zu erstellen!</div>;
  }
  return (
    <div className={styles.charList}>
      {characters.map((c) => (
        <div key={c.guid} className={styles.charCard}>
          <div className={styles.charLevel}>{c.level}</div>
          <div className={styles.charInfo}>
            <p className={styles.charName} style={{ color: classColors[c.class] || '#fff' }}>{c.name}</p>
            <p className={styles.charMeta}>
              {raceNames[c.race] || 'Unbekannt'} {classNames[c.class] || 'Unbekannt'} · {formatPlaytime(c.totalPlaytime)} gespielt
            </p>
          </div>
          <div className={styles.charMoney}>{formatMoney(c.money)}</div>
        </div>
      ))}
    </div>
  );
}

// ─── Sicherheit-Tab ─────────────────────────────────────────────────────────
function SecurityTab() {
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault(); setMsg(null);
    if (newPass !== confirmPass) {
      setMsg({ ok: false, text: 'Passwörter stimmen nicht überein.' }); return;
    }
    setBusy(true);
    try {
      await changePassword(newPass);
      setMsg({ ok: true, text: 'Passwort aktualisiert. Der Spiel-Login nutzt jetzt das neue Passwort.' });
      setNewPass(''); setConfirmPass('');
    } catch (err) { setMsg({ ok: false, text: err.message || 'Fehlgeschlagen.' }); }
    finally { setBusy(false); }
  }

  return (
    <div className={styles.panel}>
      <h2 className={styles.panelTitle}>Passwort ändern</h2>
      <form onSubmit={submit}>
        {msg && (
          <div className={`${styles.msg} ${msg.ok ? styles.msgSuccess : styles.msgError}`}>
            {msg.text}
          </div>
        )}
        <div className={styles.field}>
          <label className={styles.label}>Neues Passwort</label>
          <input type="password" className={styles.input} value={newPass}
            onChange={(e) => setNewPass(e.target.value)} placeholder="4–16 Zeichen" />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Passwort bestätigen</label>
          <input type="password" className={styles.input} value={confirmPass}
            onChange={(e) => setConfirmPass(e.target.value)} placeholder="Neues Passwort wiederholen" />
        </div>
        <button type="submit" className={styles.smallBtn} disabled={busy}>
          {busy ? 'Aktualisiere…' : 'Passwort aktualisieren'}
        </button>
      </form>
    </div>
  );
}

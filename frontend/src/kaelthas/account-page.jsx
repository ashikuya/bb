import { useEffect, useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from './auth-context.jsx';
import {
  getCharacters, changePassword,
  uploadAvatar, removeAvatar, updateProfile, getForumRoles,
} from './api.js';
import {
  raceNames, classNames, classColors, classIcon, raceIcon,
  formatMoney, formatPlaytime, voteSites,
} from './wow-data.js';
import { Header } from './header.jsx';
import { Frost } from './frost.jsx';
import styles from './account.module.css';
import pageStyles from './kaelthas.module.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const VOTE_STORAGE_KEY = 'kaelthas_vote_cooldowns';

export function AccountPage() {
  const { account, loading, logout, refresh } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('overview');
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

  // Stats fürs Dashboard
  const highestLevel = characters.reduce((m, c) => Math.max(m, c.level || 0), 0);
  const totalPlaytime = characters.reduce((s, c) => s + (c.totalPlaytime || 0), 0);
  const totalGold = characters.reduce((s, c) => s + (c.money || 0), 0);

  const tabs = [
    ['overview',   'Übersicht'],
    ['characters', 'Charaktere'],
    ['vote',       'Voten'],
    ['profile',    'Profil'],
    ['security',   'Sicherheit'],
  ];

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

        {/* Dashboard-Karten */}
        <div className={styles.dashGrid}>
          <DashCard icon="◆" label="Charaktere" value={characters.length} accent="#6fd3ff" />
          <DashCard icon="↑" label="Höchstes Level" value={highestLevel || '—'} accent="#e8c373" />
          <DashCard icon="◷" label="Gesamtspielzeit" value={formatPlaytime(totalPlaytime)} accent="#7fffd4" />
          <DashCard icon="◉" label="Gold gesamt" value={`${Math.floor(totalGold / 10000)}g`} accent="#ffb86b" />
          <DashCard icon="◆" label="Beigetreten" value={account.joinDate ? new Date(account.joinDate).toLocaleDateString('de-DE') : '—'} accent="#9482c9" />
          <DashCard icon="●" label="Online-Status" value={account.online ? 'Online' : 'Offline'} accent={account.online ? '#4ade80' : '#8294a8'} />
        </div>

        <div className={styles.tabs}>
          {tabs.map(([k, label]) => (
            <button key={k} className={tab === k ? styles.tabActive : styles.tab}
              onClick={() => setTab(k)} data-testid={`tab-${k}`}>{label}</button>
          ))}
        </div>

        {tab === 'overview'   && <OverviewTab account={account} characters={characters} loading={charsLoading} />}
        {tab === 'characters' && <CharactersTab characters={characters} loading={charsLoading} />}
        {tab === 'vote'       && <VoteTab username={account.username} />}
        {tab === 'profile'    && <ProfileTab account={account} onSaved={refresh} />}
        {tab === 'security'   && <SecurityTab />}

        <div className={styles.realmBox}>
          <strong>So verbindest du dich:</strong> Öffne <code>WoW/Data/enUS/realmlist.wtf</code>
          {' '}und trage ein: <code>set realmlist logon.kaelthas.com</code>. Client-Version <code>3.3.5a (Build 12340)</code>.
        </div>
      </div>
    </div>
  );
}

// ─── Dashboard-Karte ────────────────────────────────────────────────────────
function DashCard({ icon, label, value, accent }) {
  return (
    <div className={styles.dashCard} style={{ '--accent': accent }}>
      <div className={styles.dashIcon}>{icon}</div>
      <div className={styles.dashInfo}>
        <div className={styles.dashLabel}>{label}</div>
        <div className={styles.dashValue}>{value}</div>
      </div>
    </div>
  );
}

// ─── Übersicht-Tab ──────────────────────────────────────────────────────────
function OverviewTab({ account, characters, loading }) {
  const topChars = [...characters].sort((a, b) => (b.level || 0) - (a.level || 0)).slice(0, 3);
  return (
    <div className={styles.overviewGrid}>
      <div className={styles.panel}>
        <h2 className={styles.panelTitle}>Top-Charaktere</h2>
        {loading ? (
          <div className={styles.empty}>Lade Charaktere…</div>
        ) : topChars.length === 0 ? (
          <div className={styles.empty}>Noch keine Charaktere — logge dich ins Spiel ein!</div>
        ) : (
          <div className={styles.miniCharList}>
            {topChars.map((c) => <MiniCharCard key={c.guid} c={c} />)}
          </div>
        )}
      </div>

      <div className={styles.panel}>
        <h2 className={styles.panelTitle}>Schnellzugriff</h2>
        <div className={styles.quickList}>
          <Link to="/forum" className={styles.quickItem}>
            <span className={styles.quickIcon}>✦</span>
            <div>
              <div className={styles.quickTitle}>Forum</div>
              <div className={styles.quickSub}>Diskutiere & teile Strategien</div>
            </div>
          </Link>
          <a href="https://discord.gg/" target="_blank" rel="noreferrer" className={styles.quickItem}>
            <span className={styles.quickIcon}>♦</span>
            <div>
              <div className={styles.quickTitle}>Discord beitreten</div>
              <div className={styles.quickSub}>Chat mit der Community</div>
            </div>
          </a>
          <div className={styles.quickItem}>
            <span className={styles.quickIcon}>⚔</span>
            <div>
              <div className={styles.quickTitle}>Freund werben</div>
              <div className={styles.quickSub}>Lade Freunde ein, erhalte Bonus-XP</div>
            </div>
          </div>
        </div>

        <div className={styles.realmCodeBox}>
          <div className={styles.realmCodeLabel}>Dein Werbe-Code</div>
          <code className={styles.realmCodeValue}>KAEL-{(account.id || 0).toString(36).toUpperCase().padStart(6, '0')}</code>
          <button type="button" className={styles.realmCodeCopy}
            onClick={() => navigator.clipboard.writeText(`KAEL-${(account.id || 0).toString(36).toUpperCase().padStart(6, '0')}`)}>
            Kopieren
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Mini Character Card ────────────────────────────────────────────────────
function MiniCharCard({ c }) {
  const cIcon = classIcon(c.class);
  return (
    <div className={styles.miniChar}>
      <div className={styles.miniCharLevel}>{c.level}</div>
      {cIcon && <img src={cIcon} alt={classNames[c.class] || ''} className={styles.miniCharIcon} />}
      <div className={styles.miniCharInfo}>
        <div className={styles.miniCharName} style={{ color: classColors[c.class] || '#fff' }}>{c.name}</div>
        <div className={styles.miniCharMeta}>{raceNames[c.race] || '?'} {classNames[c.class] || '?'}</div>
      </div>
    </div>
  );
}

// ─── Voten Tab ──────────────────────────────────────────────────────────────
function VoteTab({ username }) {
  const [cooldowns, setCooldowns] = useState({});

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(VOTE_STORAGE_KEY) || '{}');
      setCooldowns(stored[username] || {});
    } catch { setCooldowns({}); }
  }, [username]);

  function onVote(site) {
    const next = { ...cooldowns, [site.id]: Date.now() + (site.cooldown === '24h' ? 86400000 : 43200000) };
    setCooldowns(next);
    try {
      const all = JSON.parse(localStorage.getItem(VOTE_STORAGE_KEY) || '{}');
      all[username] = next;
      localStorage.setItem(VOTE_STORAGE_KEY, JSON.stringify(all));
    } catch {}
    window.open(site.url, '_blank', 'noreferrer');
  }

  const totalVotes = Object.keys(cooldowns).filter((k) => cooldowns[k] && cooldowns[k] > Date.now() - 30 * 86400000).length;

  return (
    <div>
      <div className={styles.voteHeader}>
        <div>
          <h2 className={styles.panelTitle} style={{ marginBottom: 4 }}>Stimme für Kaelthas</h2>
          <p className={styles.voteHint}>
            Jede Stimme bringt uns mehr Spieler und dir Vote-Token, die du im Shop einlösen kannst.
          </p>
        </div>
        <div className={styles.voteTokens}>
          <span className={styles.voteTokenNum}>{totalVotes}</span>
          <span className={styles.voteTokenLabel}>Vote-Token</span>
        </div>
      </div>

      <div className={styles.voteGrid}>
        {voteSites.map((s) => {
          const remaining = (cooldowns[s.id] || 0) - Date.now();
          const ready = remaining <= 0;
          return (
            <div key={s.id} className={styles.voteCard} style={{ '--accent': s.color }}>
              <div className={styles.voteCardHead}>
                <div className={styles.voteCardIcon} style={{ background: s.color }}>★</div>
                <div>
                  <h3 className={styles.voteCardName}>{s.name}</h3>
                  <p className={styles.voteCardDesc}>{s.description}</p>
                </div>
              </div>
              <div className={styles.voteCardMeta}>
                <span>⟲ {s.cooldown} Cooldown</span>
                <span>✦ {s.reward}</span>
              </div>
              <button type="button"
                className={ready ? styles.voteBtn : styles.voteBtnDisabled}
                disabled={!ready}
                onClick={() => onVote(s)}>
                {ready ? 'Jetzt voten ↗' : `Bereit in ${formatCountdown(remaining)}`}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function formatCountdown(ms) {
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  return `${h}h ${m}m`;
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
          <span className={styles.avatarFallback}>{account.username?.[0]?.toUpperCase()}</span>
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
    <div className={styles.charGrid}>
      {characters.map((c) => {
        const cIcon = classIcon(c.class);
        const rIcon = raceIcon(c.race);
        const cColor = classColors[c.class] || '#fff';
        return (
          <div key={c.guid} className={styles.charBigCard} style={{ borderColor: cColor }}>
            <div className={styles.charBigHead}>
              {cIcon && <img src={cIcon} alt="" className={styles.charBigClassIcon} />}
              <div>
                <p className={styles.charBigName} style={{ color: cColor }}>{c.name}</p>
                <p className={styles.charBigSub}>
                  Level {c.level} {raceNames[c.race] || 'Unbekannt'} {classNames[c.class] || 'Unbekannt'}
                </p>
              </div>
              {rIcon && <img src={rIcon} alt="" className={styles.charBigRaceIcon} />}
            </div>
            <div className={styles.charBigMeta}>
              <div><span>Spielzeit</span><strong>{formatPlaytime(c.totalPlaytime)}</strong></div>
              <div><span>Gold</span><strong>{formatMoney(c.money)}</strong></div>
              <div><span>Status</span>
                <strong style={{ color: c.online ? '#4ade80' : '#8294a8' }}>
                  {c.online ? 'Online' : 'Offline'}
                </strong>
              </div>
            </div>
          </div>
        );
      })}
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

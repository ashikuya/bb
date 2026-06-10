import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Header } from './header.jsx';
import { Frost } from './frost.jsx';
import { useAuth } from './auth-context.jsx';
import {
  adminListUsers, adminGrantRole, adminRevokeRole,
  adminUpdateRole, adminCreateRole, adminDeleteRole,
  getForumRoles,
} from './api.js';
import styles from './admin.module.css';
import pageStyles from './kaelthas.module.css';

export function AdminPage() {
  const { account, loading } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('users');

  useEffect(() => {
    if (loading) return;
    if (!account) { navigate('/login'); return; }
    if (!account.isAdmin) { navigate('/account'); }
  }, [loading, account, navigate]);

  if (loading || !account || !account.isAdmin) {
    return (
      <div className={pageStyles.page}>
        <Frost count={30} />
        <Header />
        <div className={styles.loading}>Checking permissions...</div>
      </div>
    );
  }

  return (
    <div className={pageStyles.page}>
      <Frost count={40} />
      <Header />
      <div className={styles.wrap}>
        <Link to="/" className={styles.backLink}>← Back to Homepage</Link>
        <h1 className={styles.title}>Admin Panel</h1>
        <p className={styles.sub}>Realm management and forum moderation</p>

        <div className={styles.tabs}>
          <button className={tab === 'users' ? styles.tabActive : styles.tab}
            onClick={() => setTab('users')}>Users & Ranks</button>
          <button className={tab === 'ranks' ? styles.tabActive : styles.tab}
            onClick={() => setTab('ranks')}>Rank Editor</button>
        </div>

        {tab === 'users' && <UsersTab />}
        {tab === 'ranks' && <RanksTab />}
      </div>
    </div>
  );
}

// ─── Users Tab ──────────────────────────────────────────────────────────────
function UsersTab() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const [u, r] = await Promise.all([adminListUsers(q), getForumRoles()]);
      setUsers(u.users || []); setRoles(r);
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  async function grant(uid, slug) {
    await adminGrantRole(uid, slug);
    await load();
  }
  async function revoke(uid, slug) {
    if (!window.confirm(`Remove rank "${slug}" from this user?`)) return;
    await adminRevokeRole(uid, slug);
    await load();
  }

  return (
    <>
      <div className={styles.searchRow}>
        <input className={styles.input} placeholder="Search username or email..."
          value={q} onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && load()} />
        <button className={styles.btn} onClick={load}>Search</button>
      </div>

      {loading ? (
        <div className={styles.empty}>Loading users...</div>
      ) : users.length === 0 ? (
        <div className={styles.empty}>No users found.</div>
      ) : (
        <div className={styles.userList}>
          {users.map((u) => (
            <UserRow key={u.id} user={u} roles={roles}
              onGrant={(slug) => grant(u.id, slug)}
              onRevoke={(slug) => revoke(u.id, slug)} />
          ))}
        </div>
      )}
    </>
  );
}

function UserRow({ user, roles, onGrant, onRevoke }) {
  const [picker, setPicker] = useState(false);
  const userRoles = (user.roles || []).map((s) =>
    roles.find((r) => r.slug === s) || { slug: s, name: s, color: '#cdd9e6' }
  );
  const available = roles.filter((r) => !user.roles.includes(r.slug));

  return (
    <div className={styles.userCard}>
      <div className={styles.userMain}>
        <div className={styles.userId}>#{user.id}</div>
        <div className={styles.userInfo}>
          <div className={styles.userName}>{user.username}</div>
          <div className={styles.userMeta}>{user.email || '—'} · joined {user.joinDate?.split('T')[0]}</div>
        </div>
        <div className={`${styles.statusDot} ${user.online ? styles.online : styles.offline}`} />
      </div>

      <div className={styles.userRoles}>
        {userRoles.map((r) => (
          <span key={r.slug} className={styles.roleBadge} style={{
            color: r.color, background: r.badge_bg || 'rgba(78,165,211,0.15)',
            border: `1px solid ${r.badge_border || 'rgba(78,165,211,0.5)'}`,
          }}>
            {r.icon && <span className={styles.roleIcon}>{r.icon}</span>}
            {r.name || r.slug}
            <button className={styles.roleRevoke} onClick={() => onRevoke(r.slug)}
              title="Remove rank">×</button>
          </span>
        ))}
        {available.length > 0 && (
          <div className={styles.rolePicker}>
            <button className={styles.btnSmall} onClick={() => setPicker(!picker)}>
              + Add Rank
            </button>
            {picker && (
              <div className={styles.roleMenu}>
                {available.map((r) => (
                  <button key={r.slug} className={styles.roleMenuItem}
                    style={{ color: r.color }}
                    onClick={() => { setPicker(false); onGrant(r.slug); }}>
                    {r.icon} {r.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Ranks Tab ──────────────────────────────────────────────────────────────
function RanksTab() {
  const [roles, setRoles] = useState([]);
  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);
  const [busy, setBusy] = useState(false);

  async function load() {
    setRoles(await getForumRoles());
  }
  useEffect(() => { load(); }, []);

  async function save(slug, patch) {
    setBusy(true);
    try {
      await adminUpdateRole(slug, patch);
      await load();
      setEditing(null);
    } finally { setBusy(false); }
  }
  async function create(data) {
    setBusy(true);
    try {
      await adminCreateRole(data);
      await load();
      setCreating(false);
    } catch (e) { alert(e.message); } finally { setBusy(false); }
  }
  async function remove(slug) {
    if (!window.confirm(`Delete rank "${slug}"?`)) return;
    setBusy(true);
    try { await adminDeleteRole(slug); await load(); }
    catch (e) { alert(e.message); }
    finally { setBusy(false); }
  }

  return (
    <>
      <div className={styles.actionsRow}>
        <button className={styles.btn} onClick={() => setCreating(true)}>+ New Rank</button>
      </div>

      {creating && (
        <RoleEditor
          role={{ slug: '', name: 'New Rank', color: '#6fd3ff',
                  badge_bg: 'rgba(78,165,211,0.15)',
                  badge_border: 'rgba(78,165,211,0.5)',
                  icon: '*', rank_level: 10, sort_order: 50 }}
          isNew
          busy={busy}
          onSave={(data) => create(data)}
          onCancel={() => setCreating(false)} />
      )}

      <div className={styles.rolesGrid}>
        {roles.map((r) => editing === r.slug ? (
          <RoleEditor key={r.slug} role={r} busy={busy}
            onSave={(patch) => save(r.slug, patch)}
            onCancel={() => setEditing(null)} />
        ) : (
          <div key={r.slug} className={styles.roleCard}>
            <div className={styles.rolePreview} style={{
              background: r.badge_bg,
              border: `1px solid ${r.badge_border}`,
              color: r.color,
            }}>
              <span className={styles.previewIcon}>{r.icon}</span>
              {r.name}
            </div>
            <div className={styles.roleSlug}>slug: <code>{r.slug}</code></div>
            <div className={styles.roleLevel}>Level: <strong>{r.rank_level}</strong></div>
            <div className={styles.roleActions}>
              <button className={styles.btnSmall} onClick={() => setEditing(r.slug)}>Edit</button>
              <button className={styles.btnSmall} onClick={() => remove(r.slug)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function RoleEditor({ role, isNew, busy, onSave, onCancel }) {
  const [f, setF] = useState({
    slug: role.slug || '',
    name: role.name || '',
    color: role.color || '#6fd3ff',
    badge_bg: role.badge_bg || 'rgba(78,165,211,0.15)',
    badge_border: role.badge_border || 'rgba(78,165,211,0.5)',
    icon: role.icon || '',
    rank_level: role.rank_level ?? 10,
    sort_order: role.sort_order ?? 50,
  });
  const upd = (k, v) => setF({ ...f, [k]: v });

  return (
    <div className={styles.roleCardWide}>
      <div className={styles.rolePreview} style={{
        background: f.badge_bg, border: `1px solid ${f.badge_border}`, color: f.color,
      }}>
        <span className={styles.previewIcon}>{f.icon || '*'}</span>
        {f.name || 'Preview'}
      </div>

      <div className={styles.editorGrid}>
        {isNew && (
          <label className={styles.editorField}>
            <span>Slug (URL-safe, unique)</span>
            <input className={styles.input} value={f.slug}
              onChange={(e) => upd('slug', e.target.value)} placeholder="e.g. champion" />
          </label>
        )}
        <label className={styles.editorField}>
          <span>Display Name</span>
          <input className={styles.input} value={f.name}
            onChange={(e) => upd('name', e.target.value)} />
        </label>
        <label className={styles.editorField}>
          <span>Icon (1-2 chars)</span>
          <input className={styles.input} value={f.icon} maxLength={4}
            onChange={(e) => upd('icon', e.target.value)} />
        </label>
        <label className={styles.editorField}>
          <span>Text Color</span>
          <div className={styles.colorRow}>
            <input type="color" value={f.color}
              onChange={(e) => upd('color', e.target.value)} />
            <input className={styles.input} value={f.color}
              onChange={(e) => upd('color', e.target.value)} />
          </div>
        </label>
        <label className={styles.editorField}>
          <span>Badge Background (CSS)</span>
          <input className={styles.input} value={f.badge_bg}
            onChange={(e) => upd('badge_bg', e.target.value)} />
        </label>
        <label className={styles.editorField}>
          <span>Badge Border (CSS)</span>
          <input className={styles.input} value={f.badge_border}
            onChange={(e) => upd('badge_border', e.target.value)} />
        </label>
        <label className={styles.editorField}>
          <span>Rank Level (higher = top role)</span>
          <input className={styles.input} type="number" value={f.rank_level}
            onChange={(e) => upd('rank_level', parseInt(e.target.value) || 0)} />
        </label>
        <label className={styles.editorField}>
          <span>Sort Order</span>
          <input className={styles.input} type="number" value={f.sort_order}
            onChange={(e) => upd('sort_order', parseInt(e.target.value) || 0)} />
        </label>
      </div>

      <div className={styles.editorActions}>
        <button className={styles.btn} disabled={busy} onClick={() => onSave(f)}>
          {busy ? 'Saving...' : isNew ? 'Create' : 'Save'}
        </button>
        <button className={styles.btnSmall} onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}

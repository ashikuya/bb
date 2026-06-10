import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Header } from './header.jsx';
import { Frost } from './frost.jsx';
import { useAuth } from './auth-context.jsx';
import {
  getForumThread, replyToThread,
  adminPinThread, adminLockThread, adminDeleteThread, adminDeletePost,
} from './api.js';
import styles from './forum.module.css';
import pageStyles from './kaelthas.module.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

function avatarSrc(url) {
  if (!url) return null;
  return url.startsWith('http') ? url : `${BACKEND_URL}${url}`;
}

export function ForumThreadPage() {
  const { slug, threadId } = useParams();
  const { account } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  async function load() {
    setLoading(true);
    try { setData(await getForumThread(threadId)); }
    catch { setData(null); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [threadId]);

  async function onReply(e) {
    e.preventDefault(); setError(null); setBusy(true);
    try { await replyToThread(threadId, reply); setReply(''); await load(); }
    catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }
  async function togglePin()    { await adminPinThread(threadId, !data.thread.pinned); await load(); }
  async function toggleLock()   { await adminLockThread(threadId, !data.thread.locked); await load(); }
  async function deleteThread() {
    if (!window.confirm('Gesamtes Thema löschen?')) return;
    await adminDeleteThread(threadId);
    navigate(`/forum/${slug}`);
  }
  async function deletePost(pid) {
    if (!window.confirm('Diesen Beitrag löschen?')) return;
    await adminDeletePost(pid); await load();
  }

  const isMod = account?.isMod || account?.isAdmin;

  return (
    <div className={pageStyles.page}>
      <Frost count={30} />
      <Header />
      <div className={styles.wrap}>
        <Link to={`/forum/${slug}`} className={styles.backLink}>← Zurück zur Kategorie</Link>
        {loading ? (
          <div className={styles.empty}>Lade Thema…</div>
        ) : !data ? (
          <div className={styles.empty}>Thema nicht gefunden.</div>
        ) : (
          <>
            <div className={styles.threadHeaderRow}>
              <div>
                <h1 className={styles.pageTitle}>
                  {data.thread.pinned && <span className={styles.pinBig}>★</span>}
                  {data.thread.locked && <span className={styles.lockBig}>🔒</span>}
                  {data.thread.title}
                </h1>
                <p className={styles.pageSub}>
                  von <strong>{data.thread.authorName}</strong> · {new Date(data.thread.createdAt).toLocaleString('de-DE')}
                  · {data.thread.views} Aufrufe · {data.thread.replyCount} Antworten
                </p>
              </div>
              {isMod && (
                <div className={styles.modBar}>
                  <button className={styles.modBtn} onClick={togglePin}>
                    {data.thread.pinned ? 'Lösen' : 'Anpinnen'}
                  </button>
                  <button className={styles.modBtn} onClick={toggleLock}>
                    {data.thread.locked ? 'Entsperren' : 'Sperren'}
                  </button>
                  <button className={styles.modBtnDanger} onClick={deleteThread}>Löschen</button>
                </div>
              )}
            </div>

            <div className={styles.wbbPosts}>
              {data.posts.map((p, i) => (
                <article key={p._id} className={styles.wbbPost}>
                  <aside className={styles.wbbAside} style={{
                    borderRightColor: p.roleBorder || 'rgba(78,165,211,0.4)',
                  }}>
                    <div className={styles.wbbAvatar} style={{
                      borderColor: p.roleBorder || 'var(--kael-panel-border)',
                    }}>
                      {avatarSrc(p.avatarUrl) ? (
                        <img src={avatarSrc(p.avatarUrl)} alt={p.authorName} className={styles.wbbAvatarImg} />
                      ) : (
                        <span className={styles.wbbAvatarFallback}>
                          {p.authorName?.[0]?.toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className={styles.wbbAuthor} style={{ color: p.roleColor || 'var(--kael-frost-bright)' }}>
                      {p.authorName}
                    </div>
                    {p.roleName && (
                      <span className={styles.postRoleBadge} style={{
                        color: p.roleColor,
                        background: p.roleBg || 'rgba(78,165,211,0.15)',
                        border: `1px solid ${p.roleBorder || 'rgba(78,165,211,0.5)'}`,
                      }}>
                        {p.roleIcon && <span className={styles.postRoleIcon}>{p.roleIcon}</span>}
                        {p.roleName}
                      </span>
                    )}
                    <dl className={styles.wbbMeta}>
                      <div><dt>Beiträge</dt><dd>{p.authorPostCount}</dd></div>
                      {p.authorJoinDate && (
                        <div><dt>Beigetreten</dt><dd>{new Date(p.authorJoinDate).toLocaleDateString('de-DE')}</dd></div>
                      )}
                      {p.location && (
                        <div><dt>Standort</dt><dd>{p.location}</dd></div>
                      )}
                    </dl>
                  </aside>

                  <div className={styles.wbbMain}>
                    <header className={styles.wbbHeader}>
                      <span className={styles.wbbNum}>#{i + 1}</span>
                      <span className={styles.wbbDate}>
                        {new Date(p.createdAt).toLocaleString('de-DE')}
                      </span>
                      {isMod && (
                        <button className={styles.postDelete} onClick={() => deletePost(p._id)}
                          title="Beitrag löschen">×</button>
                      )}
                    </header>
                    <div className={styles.wbbBody}>{p.content}</div>
                    {p.signature && (
                      <footer className={styles.wbbSig}>{p.signature}</footer>
                    )}
                  </div>
                </article>
              ))}
            </div>

            {account ? (
              data.thread.locked ? (
                <p className={styles.empty}>🔒 Dieses Thema ist gesperrt.</p>
              ) : (
                <form className={styles.newForm} onSubmit={onReply}>
                  {error && <div className={styles.errorBox}>{error}</div>}
                  <textarea className={styles.textarea} rows={5} placeholder="Antwort schreiben…"
                    value={reply} onChange={(e) => setReply(e.target.value)} required />
                  <button type="submit" className={styles.actionBtn} disabled={busy}>
                    {busy ? 'Wird gesendet…' : 'Antworten'}
                  </button>
                </form>
              )
            ) : (
              <p className={styles.empty}>
                <Link to="/login" className={styles.backLink}>Melde dich an</Link>, um zu antworten.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

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
    try {
      const d = await getForumThread(threadId);
      setData(d);
    } catch { setData(null); } finally { setLoading(false); }
  }

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [threadId]);

  async function onReply(e) {
    e.preventDefault(); setError(null); setBusy(true);
    try { await replyToThread(threadId, reply); setReply(''); await load(); }
    catch (err) { setError(err.message); } finally { setBusy(false); }
  }

  async function togglePin() {
    await adminPinThread(threadId, !data.thread.pinned); await load();
  }
  async function toggleLock() {
    await adminLockThread(threadId, !data.thread.locked); await load();
  }
  async function deleteThread() {
    if (!window.confirm('Delete entire thread?')) return;
    await adminDeleteThread(threadId);
    navigate(`/forum/${slug}`);
  }
  async function deletePost(pid) {
    if (!window.confirm('Delete this post?')) return;
    await adminDeletePost(pid); await load();
  }

  const isMod = account?.isMod || account?.isAdmin;

  return (
    <div className={pageStyles.page}>
      <Frost count={30} />
      <Header />
      <div className={styles.wrap}>
        <Link to={`/forum/${slug}`} className={styles.backLink}>← Back to Category</Link>
        {loading ? (
          <div className={styles.empty}>Loading thread...</div>
        ) : !data ? (
          <div className={styles.empty}>Thread not found.</div>
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
                  by <strong>{data.thread.authorName}</strong> · {new Date(data.thread.createdAt).toLocaleString()}
                </p>
              </div>
              {isMod && (
                <div className={styles.modBar}>
                  <button className={styles.modBtn} onClick={togglePin}>
                    {data.thread.pinned ? 'Unpin' : 'Pin'}
                  </button>
                  <button className={styles.modBtn} onClick={toggleLock}>
                    {data.thread.locked ? 'Unlock' : 'Lock'}
                  </button>
                  <button className={styles.modBtnDanger} onClick={deleteThread}>Delete</button>
                </div>
              )}
            </div>

            <div className={styles.postList}>
              {data.posts.map((p) => (
                <div key={p._id} className={styles.post}>
                  <div className={styles.postAuthor}>
                    <strong style={{ color: p.roleColor || 'var(--kael-frost-bright)' }}>
                      {p.authorName}
                    </strong>
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
                    <span className={styles.postMeta}>{new Date(p.createdAt).toLocaleString()}</span>
                    {isMod && (
                      <button className={styles.postDelete} onClick={() => deletePost(p._id)}
                        title="Delete post">×</button>
                    )}
                  </div>
                  <div className={styles.postBody}>{p.content}</div>
                </div>
              ))}
            </div>

            {account ? (
              data.thread.locked ? (
                <p className={styles.empty}>🔒 This thread is locked.</p>
              ) : (
                <form className={styles.newForm} onSubmit={onReply}>
                  {error && <div className={styles.errorBox}>{error}</div>}
                  <textarea className={styles.textarea} rows={5} placeholder="Write a reply..."
                    value={reply} onChange={(e) => setReply(e.target.value)} required />
                  <button type="submit" className={styles.actionBtn} disabled={busy}>
                    {busy ? 'Posting...' : 'Reply'}
                  </button>
                </form>
              )
            ) : (
              <p className={styles.empty}>
                <Link to="/login" className={styles.backLink}>Log in</Link> to reply.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

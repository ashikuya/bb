import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Header } from './header.jsx';
import { Frost } from './frost.jsx';
import { useAuth } from './auth-context.jsx';
import { getForumThread, replyToThread } from './api.js';
import styles from './forum.module.css';
import pageStyles from './kaelthas.module.css';

export function ForumThreadPage() {
  const { slug, threadId } = useParams();
  const { account } = useAuth();
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
    try {
      await replyToThread(threadId, reply);
      setReply('');
      await load();
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  }

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
            <h1 className={styles.pageTitle}>{data.thread.title}</h1>
            <p className={styles.pageSub}>by <strong>{data.thread.authorName}</strong> · {new Date(data.thread.createdAt).toLocaleString()}</p>

            <div className={styles.postList}>
              {data.posts.map((p) => (
                <div key={p._id} className={styles.post}>
                  <div className={styles.postAuthor}>
                    <strong>{p.authorName}</strong>
                    <span className={styles.postRole}>{p.authorRole}</span>
                    <span className={styles.postMeta}>{new Date(p.createdAt).toLocaleString()}</span>
                  </div>
                  <div className={styles.postBody}>{p.content}</div>
                </div>
              ))}
            </div>

            {account ? (
              <form className={styles.newForm} onSubmit={onReply}>
                {error && <div className={styles.errorBox}>{error}</div>}
                <textarea className={styles.textarea} rows={5} placeholder="Write a reply..."
                  value={reply} onChange={(e) => setReply(e.target.value)} required />
                <button type="submit" className={styles.actionBtn} disabled={busy}>
                  {busy ? 'Posting...' : 'Reply'}
                </button>
              </form>
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

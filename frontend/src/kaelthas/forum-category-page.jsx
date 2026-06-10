import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Header } from './header.jsx';
import { Frost } from './frost.jsx';
import { useAuth } from './auth-context.jsx';
import { getForumThreads, createThread } from './api.js';
import styles from './forum.module.css';
import pageStyles from './kaelthas.module.css';

export function ForumCategoryPage() {
  const { slug } = useParams();
  const { account } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    getForumThreads(slug)
      .then((d) => active && setData(d))
      .catch(() => active && setData({ threads: [], category: null }))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [slug]);

  async function onCreate(e) {
    e.preventDefault(); setError(null); setBusy(true);
    try {
      const { thread } = await createThread(slug, title, content);
      navigate(`/forum/${slug}/${thread._id}`);
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  }

  return (
    <div className={pageStyles.page}>
      <Frost count={30} />
      <Header />
      <div className={styles.wrap}>
        <Link to="/forum" className={styles.backLink}>← Zurück zum Forum</Link>
        <div className={styles.headerRow}>
          <h1 className={styles.pageTitle}>{data?.category?.name || slug}</h1>
          {account && (
            <button type="button" className={styles.actionBtn} onClick={() => setShowNew((v) => !v)}>
              {showNew ? 'Abbrechen' : 'Neues Thema'}
            </button>
          )}
        </div>

        {showNew && (
          <form className={styles.newForm} onSubmit={onCreate}>
            {error && <div className={styles.errorBox}>{error}</div>}
            <input className={styles.input} placeholder="Titel des Themas" value={title}
              onChange={(e) => setTitle(e.target.value)} required />
            <textarea className={styles.textarea} placeholder="Schreibe deinen Beitrag…" rows={6}
              value={content} onChange={(e) => setContent(e.target.value)} required />
            <button type="submit" className={styles.actionBtn} disabled={busy}>
              {busy ? 'Wird erstellt…' : 'Thema erstellen'}
            </button>
          </form>
        )}

        {loading ? (
          <div className={styles.empty}>Lade Themen…</div>
        ) : !data || data.threads.length === 0 ? (
          <div className={styles.empty}>Noch keine Themen. Sei der Erste!</div>
        ) : (
          <div className={styles.threadList}>
            {data.threads.map((t) => (
              <Link key={t._id} to={`/forum/${slug}/${t._id}`} className={styles.threadRow}>
                <div className={styles.threadMain}>
                  <h3 className={styles.threadTitle}>
                    {t.pinned && <span className={styles.pin}>★</span>} {t.title}
                  </h3>
                  <p className={styles.threadMeta}>von <strong>{t.authorName}</strong> · {new Date(t.createdAt).toLocaleString('de-DE')}</p>
                </div>
                <div className={styles.threadStats}>
                  <span><strong>{t.replyCount}</strong> Antworten</span>
                  <span><strong>{t.views}</strong> Aufrufe</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Header } from './header.jsx';
import { Frost } from './frost.jsx';
import { getForumCategories } from './api.js';
import styles from './forum.module.css';
import pageStyles from './kaelthas.module.css';

export function ForumPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getForumCategories()
      .then((c) => active && setCategories(c))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  return (
    <div className={pageStyles.page}>
      <Frost count={30} />
      <Header />
      <div className={styles.wrap}>
        <Link to="/" className={styles.backLink}>← Back to Homepage</Link>
        <h1 className={styles.pageTitle}>Forum</h1>
        <p className={styles.pageSub}>Discuss strategy, share screenshots, recruit guildmates.</p>

        {loading ? (
          <div className={styles.empty}>Loading...</div>
        ) : categories.length === 0 ? (
          <div className={styles.empty}>No categories yet.</div>
        ) : (
          <div className={styles.catList}>
            {categories.map((c) => (
              <Link key={c._id} to={`/forum/${c.slug}`} className={styles.catCard}>
                <div className={styles.catIcon}>{c.icon || '⁂'}</div>
                <div className={styles.catBody}>
                  <h3 className={styles.catName}>{c.name}</h3>
                  <p className={styles.catDesc}>{c.description}</p>
                </div>
                <div className={styles.catStats}>
                  <span><strong>{c.threadCount}</strong> threads</span>
                  <span><strong>{c.postCount}</strong> posts</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

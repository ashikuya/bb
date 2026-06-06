import { useState } from 'react';
import styles from './cookies.module.css';

export function Cookies() {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.panel}>
        <h3 className={styles.title}>Cookies</h3>
        <p className={styles.text}>
          This website uses cookies to store data. We do not use tracking or
          advertising cookies and all of our cookies are necessary for the site
          to work correctly.
          <br />
          See also: <a href="#privacy" className={styles.link}>Privacy Policy</a>
        </p>
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.okay}
            onClick={() => setVisible(false)}
          >
            Okay
          </button>
        </div>
      </div>
    </div>
  );
}

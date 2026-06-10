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
          Diese Website verwendet Cookies, um Daten zu speichern. Wir nutzen
          weder Tracking- noch Werbe-Cookies – alle unsere Cookies sind
          technisch notwendig, damit die Seite korrekt funktioniert.
          <br />
          Siehe auch: <a href="#privacy" className={styles.link}>Datenschutzerklärung</a>
        </p>
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.okay}
            data-testid="cookies-okay-btn"
            onClick={() => setVisible(false)}
          >
            Verstanden
          </button>
        </div>
      </div>
    </div>
  );
}

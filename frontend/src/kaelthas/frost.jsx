import { useMemo } from 'react';
import styles from './frost.module.css';

export function Frost({ count = 60 }) {
  const flakes = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        left: Math.random() * 100,
        size: 1 + Math.random() * 3.5,
        duration: 8 + Math.random() * 14,
        delay: -Math.random() * 20,
        drift: (Math.random() - 0.5) * 120,
        opacity: 0.25 + Math.random() * 0.6,
      })),
    [count]
  );

  return (
    <div className={styles.field} aria-hidden="true">
      {flakes.map((f, i) => (
        <span
          key={i}
          className={styles.flake}
          style={{
            left: `${f.left}%`,
            width: `${f.size}px`,
            height: `${f.size}px`,
            opacity: f.opacity,
            animationDuration: `${f.duration}s`,
            animationDelay: `${f.delay}s`,
            '--drift': `${f.drift}px`,
          }}
        />
      ))}
    </div>
  );
}

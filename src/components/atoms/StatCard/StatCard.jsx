import styles from './StatCard.module.css';

export default function StatCard({ number, label, color, barWidth }) {
  return (
    <div className={styles.stat}>
      <p className={styles.number} style={{ color }}>{number}</p>
      <p className={styles.label}>{label}</p>
      <div className={styles.barTrack}>
        <div
          className={styles.barFill}
          style={{ background: color, '--w': barWidth }}
        />
      </div>
    </div>
  );
}

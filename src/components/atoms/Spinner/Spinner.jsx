import styles from "./Spinner.module.css";

export default function Spinner({ pct = 0 }) {
  return (
    <div className={styles.wrapper}>
      <div className={`${styles.ring} ${styles.ring1}`} />
      <div className={`${styles.ring} ${styles.ring2}`} />
      <div className={`${styles.ring} ${styles.ring3}`} />
      <div className={styles.center}>{pct}%</div>
    </div>
  );
}

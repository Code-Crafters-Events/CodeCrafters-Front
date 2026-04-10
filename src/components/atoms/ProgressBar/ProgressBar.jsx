import styles from "./ProgressBar.module.css";

export default function ProgressBar({ pct = 0 }) {
  return (
    <>
      <div className={styles.track}>
        <div className={styles.fill} style={{ width: `${pct}%` }} />
      </div>
      <div className={styles.labels}>
        <span className={styles.label}>{pct}%</span>
        <span className={styles.label}>loading</span>
        <span className={styles.label}>100%</span>
      </div>
    </>
  );
}

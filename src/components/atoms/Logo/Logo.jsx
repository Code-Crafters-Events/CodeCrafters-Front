import styles from "./Logo.module.css";

export default function Logo() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.main}>
        CODE<em className={styles.accent}>_</em>CRAFTERS
      </div>
      <div className={styles.sub}>// system boot sequence</div>
    </div>
  );
}

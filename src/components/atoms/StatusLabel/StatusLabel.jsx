import styles from "./StatusLabel.module.css";

export default function StatusLabel({ text = "" }) {
  return <div className={styles.label}>{text}</div>;
}

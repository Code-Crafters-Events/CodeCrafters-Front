import styles from './EventTag.module.css';

export default function EventTag({ label, color, borderColor }) {
  return (
    <span
      className={styles.tag}
      style={{ color, borderColor }}
    >
      {label}
    </span>
  );
}

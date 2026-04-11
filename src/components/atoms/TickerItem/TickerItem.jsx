import styles from './TickerItem.module.css';

export default function TickerItem({ separator, text }) {
  return (
    <span className={styles.item}>
      <span className={styles.separator}>{separator}</span>
      {text}
    </span>
  );
}

import styles from "./Tab.module.css";

const Tab = ({ text, count, isActive, onClick }) => {
  return (
    <button
      className={`${styles.tab} ${isActive ? styles.active : ""}`}
      onClick={onClick}
      type="button"
    >
      <span className={styles.text}>{text}</span>
      {count !== undefined && <span className={styles.count}>{count}</span>}
    </button>
  );
};

export default Tab;

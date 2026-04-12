import styles from "./SectionLabel.module.css";

export default function SectionLabel({ title }) {
  return (
    <h4 className={styles.wrapperSection}>
      <p className={styles.title}>{title}</p>
    </h4>
  );
}

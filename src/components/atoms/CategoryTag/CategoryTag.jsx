import styles from "./CategoryTag.module.css";

const CategoryTag = ({ category }) => {
  return (
    <span className={styles.tag}>
      <span className={styles.slash}>//</span> {category}
    </span>
  );
};

export default CategoryTag;

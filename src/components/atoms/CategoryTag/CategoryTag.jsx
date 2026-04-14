import styles from "./CategoryTag.module.css";

const CATEGORY_COLORS = {
  HACKATHON: "#FF2D78",
  MASTERCLASS: "#00F5FF",
  NETWORKING: "#FFB800",
  TALLER: "#00FF9D",
};

const CategoryTag = ({ category }) => {
  const tagColor = CATEGORY_COLORS[category?.toUpperCase()] || "#FFFFFF";

  return (
    <span className={styles.tag} style={{ "--category-color": tagColor }}>
      <span className={styles.slash} style={{ color: tagColor }}>
        //
      </span>
      {category}
    </span>
  );
};

export default CategoryTag;

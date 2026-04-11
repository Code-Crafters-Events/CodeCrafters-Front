import styles from "./FeatureCard.module.css";

export default function FeatureCard({
  title,
  description,
}) {
  return (
    <article className={styles.card}>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.description}>{description}</p>
    </article>
  );
}

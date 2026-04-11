import HeroContent from "../../molecules/HeroContent/HeroContent";
import styles from "./HeroSection.module.css";

export default function HeroSection({ onRegister, onCommunity }) {
  return (
    <section aria-label="Presentación" className={styles.hero}>
      <div className={styles.hexGrid} aria-hidden="true" />
      <div className={styles.glow} aria-hidden="true" />
      <HeroContent onRegister={onRegister} onCommunity={onCommunity} />
    </section>
  );
}

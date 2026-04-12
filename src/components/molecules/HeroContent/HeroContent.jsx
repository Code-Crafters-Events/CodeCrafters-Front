import CyberButton from "../../atoms/CyberButton/CyberButton";
import styles from "./HeroContent.module.css";

export default function HeroContent({ onRegister, onCommunity }) {
  return (
    <div className={styles.wrapper}>
      <p className={styles.pre}>THE TECH COMMUNITY HUB</p>
      <h1 className={styles.title}>
        <p className={styles.cx}>CODE</p>
        <p>
          <span className={styles.cg}>CRAFT</span>
          <span className={styles.cv}>ERS</span>
        </p>
      </h1>
      <h2 className={styles.subtitle}>
        Aprende.Conecta.<span className={styles.cx}>Innova</span>
      </h2>
      <h3 className={styles.subh3}>
        El punto de encuentro para la comunidad tecnológica
      </h3>
      <p className={styles.tagline}>
        eventos · comunidad · tecnología · innovación
      </p>
      <div className={styles.buttons}>
        <CyberButton variant="primary" onClick={onRegister}>
          REGISTRARSE
        </CyberButton>
        <CyberButton variant="secondary" onClick={onCommunity}>
          EXPLORAR
        </CyberButton>
      </div>
    </div>
  );
}

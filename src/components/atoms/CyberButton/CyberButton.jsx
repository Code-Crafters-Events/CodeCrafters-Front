import styles from "./CyberButton.module.css";

export default function CyberButton({
  children,
  variant = "primary",
  onClick,
}) {
  return (
    <button className={`${styles.btn} ${styles[variant]}`} onClick={onClick}>
      {children}
    </button>
  );
}

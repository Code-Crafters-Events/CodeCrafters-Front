import { useEffect } from "react";
import styles from "./Toast.module.css";

const ICONS = {
  success: "✓",
  error: "✕",
  warning: "⚠",
  info: "i",
};

const Toast = ({ message, type = "success", duration = 3000, onClose }) => {
  useEffect(() => {
    if (duration === 0 || !onClose) return;
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div
      className={`${styles.toast} ${styles[type]}`}
      role="alert"
      aria-live="polite"
    >
      <span className={styles.icon} aria-hidden="true">
        {ICONS[type]}
      </span>
      <p className={styles.message}>{message}</p>
      {onClose && (
        <button
          type="button"
          className={styles.close}
          onClick={onClose}
          aria-label="Cerrar notificación"
        >
          ✕
        </button>
      )}
    </div>
  );
};

export default Toast;

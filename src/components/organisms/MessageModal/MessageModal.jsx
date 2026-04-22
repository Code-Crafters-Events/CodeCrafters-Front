import styles from "./MessageModal.module.css";
import Button from "../../atoms/Button/Button";

const MessageModal = ({
  image,
  message,
  btnText,
  btnClass,
  onConfirm,
  onClose,
  secondaryBtnText = "Cancelar",
  isLoading = false,
}) => {
  return (
    <div className={styles.overlay}>
      <div className={styles.modalContainer}>
        <div className={styles.content}>
          {isLoading ? (
            <div className={styles.spinnerContainer}>
              <div className={styles.spinner}></div>
            </div>
          ) : (
            image && (
              <img src={image} alt="Modal Icon" className={styles.icon} />
            )
          )}

          <p className={styles.message}>
            {isLoading
              ? "Procesando eliminación y notificando asistentes..."
              : message}
          </p>
        </div>

        <div className={styles.actions}>
          {!isLoading && (
            <Button
              text={secondaryBtnText}
              BtnClass="ghost"
              onClick={onClose}
            />
          )}

          <Button
            text={isLoading ? "Eliminando..." : btnText}
            BtnClass={btnClass || "neon"}
            onClick={onConfirm}
            disabled={isLoading}
          />
        </div>
      </div>
    </div>
  );
};
export default MessageModal;

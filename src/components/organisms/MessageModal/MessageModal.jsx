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
}) => {
  return (
    <div className={styles.overlay}>
      <div className={styles.modalContainer}>
        <div className={styles.content}>
          {image && (
            <img src={image} alt="Modal Icon" className={styles.icon} />
          )}
          <p className={styles.message}>{message}</p>
        </div>

        <div className={styles.actions}>
          <Button text={secondaryBtnText} BtnClass="ghost" onClick={onClose} />

          <Button text={btnText} BtnClass="neon" onClick={onConfirm} />
        </div>
      </div>
    </div>
  );
};

export default MessageModal;

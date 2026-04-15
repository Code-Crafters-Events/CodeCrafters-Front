import styles from "./AttendeesModal.module.css";
import AttendeesAvatar from "../../atoms/AttendeesAvatar/AttendeesAvatar";

const AttendeesModal = ({ isOpen, onClose, attendees = [] }) => {
  if (!isOpen) return null;

  return (
    <div
      className={styles.overlay}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Lista de asistentes"
    >
      <div className={styles.modal}>
        <div className={styles.header}>
          <h3 className={styles.title}>Asistentes ({attendees.length})</h3>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        <ul className={styles.list}>
          {attendees.map((ticket) => (
            <li key={ticket.id} className={styles.item}>
              <AttendeesAvatar
                name={ticket.userName}
                imageUrl={ticket.userProfileImage}
                size="md"
              />
              <span className={styles.name}>@{ticket.userName}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AttendeesModal;

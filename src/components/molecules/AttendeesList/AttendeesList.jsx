import { useState } from "react";
import styles from "./AttendeesList.module.css";
import AttendeesAvatar from "../../atoms/AttendeesAvatar/AttendeesAvatar";
import AttendeesModal from "../AttendeesModal/AttendeesModal";

const MAX_VISIBLE = 5;

const AttendeesList = ({ tickets = [], totalCount = 0 }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const visible = tickets.slice(0, MAX_VISIBLE);
  const hasMore = totalCount > MAX_VISIBLE;

  return (
    <div className={styles.wrapper}>
      <p className={styles.count}>
        Nº de asistentes: <span>{totalCount}</span>
      </p>

      <div className={styles.avatars}>
        {visible.map((ticket) => (
          <AttendeesAvatar
            key={ticket.id}
            name={ticket.userName}
            imageUrl={ticket.userProfileImage}
            size="sm"
          />
        ))}

        {hasMore && (
          <button
            type="button"
            className={styles.moreBtn}
            onClick={() => setModalOpen(true)}
            aria-label={`Ver todos los asistentes (${totalCount})`}
          >
            <span className={styles.morePlus}>⊕</span>
            <span className={styles.moreText}>Ver asistentes</span>
          </button>
        )}
      </div>

      <AttendeesModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        attendees={tickets}
      />
    </div>
  );
};

export default AttendeesList;

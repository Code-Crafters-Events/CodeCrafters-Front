import styles from "./EventRow.module.css";
import CategoryTag from "../../atoms/CategoryTag/CategoryTag";
import Button from "../../atoms/Button/Button";

const EventRow = ({ event, onEdit, onDelete }) => {
  return (
    <div className={styles.row}>
      <div className={styles.info}>
        <CategoryTag category={event.category} />
        <p className={styles.title}>{event.title}</p>
      </div>
      <div className={styles.actions}>
        <Button
          text="Editar"
          BtnClass="edit"
          type="button"
          onClick={() => onEdit(event)}
        />
        <Button
          text="Borrar"
          BtnClass="danger"
          type="button"
          onClick={() => onDelete(event.id)}
        />
      </div>
    </div>
  );
};

export default EventRow;

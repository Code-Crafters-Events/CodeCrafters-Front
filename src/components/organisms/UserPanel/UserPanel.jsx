import { useEffect, useState, useContext } from "react";
import styles from "./UserPanel.module.css";
import EventRow from "../../molecules/EventRow/EventRow";
import Button from "../../atoms/Button/Button";
import Toast from "../../atoms/Toast/Toast";
import EventFormModal from "../../molecules/EventFormModal/EventFormModal";
import { eventsApi } from "../../../services/eventsApi";
import { AuthContext } from "../../../context/auth/AuthContext";

const UserPanel = () => {
  const { user } = useContext(AuthContext);
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [modalEvent, setModalEvent] = useState(undefined);
  const isModalOpen = modalEvent !== undefined;

  useEffect(() => {
    if (!user?.id) return;
    eventsApi
      .getByUser(user.id)
      .then((res) => setEvents(res.data.content ?? res.data))
      .catch(() =>
        setToast({
          message: "No se pudieron cargar tus eventos.",
          type: "error",
        }),
      )
      .finally(() => setIsLoading(false));
  }, [user]);

  const handleSaved = (savedEvent, wasEditing) => {
    if (wasEditing) {
      setEvents((prev) =>
        prev.map((e) => (e.id === savedEvent.id ? savedEvent : e)),
      );
      setToast({
        message: "Evento actualizado correctamente.",
        type: "success",
      });
    } else {
      setEvents((prev) => [...prev, savedEvent]);
      setToast({ message: "Evento creado correctamente.", type: "success" });
    }
  };

  const handleDelete = async (eventId) => {
    if (!window.confirm("¿Segura que quieres borrar este evento?")) return;
    try {
      await eventsApi.delete(eventId, user.id);
      setEvents((prev) => prev.filter((e) => e.id !== eventId));
      setToast({ message: "Evento eliminado.", type: "success" });
    } catch {
      setToast({ message: "No se pudo eliminar el evento.", type: "error" });
    }
  };

  return (
    <section className={styles.container}>
      <h1 className={styles.title}>Panel de control de mis eventos</h1>

      <div className={styles.panel}>
        {isLoading && <p className={styles.empty}>Cargando eventos...</p>}

        {!isLoading && events.length === 0 && (
          <p className={styles.empty}>Todavía no has creado ningún evento.</p>
        )}

        {!isLoading && events.length > 0 && (
          <div className={styles.list}>
            {events.map((event) => (
              <EventRow
                key={event.id}
                event={event}
                onEdit={(e) => setModalEvent(e)}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

        <div className={styles.footer}>
          <Button
            text="Crear evento"
            BtnClass="neon"
            type="button"
            onClick={() => setModalEvent(null)}
          />
        </div>
      </div>

      <EventFormModal
        isOpen={isModalOpen}
        event={modalEvent}
        onClose={() => setModalEvent(undefined)}
        onSaved={handleSaved}
      />

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          duration={3000}
          onClose={() => setToast(null)}
        />
      )}
    </section>
  );
};

export default UserPanel;

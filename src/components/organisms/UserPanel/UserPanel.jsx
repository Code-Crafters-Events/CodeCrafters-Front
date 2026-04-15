import { useEffect, useState, useContext } from "react";
import styles from "./UserPanel.module.css";
import EventRow from "../../molecules/EventRow/EventRow";
import Button from "../../atoms/Button/Button";
import Toast from "../../atoms/Toast/Toast";
import EventFormModal from "../../molecules/EventFormModal/EventFormModal";
import MessageModal from "../../organisms/MessageModal/MessageModal";
import { eventsApi } from "../../../services/eventsApi";
import { AuthContext } from "../../../context/auth/AuthContext";

import WarningIcon from "../../../assets/warning.png";

const UserPanel = () => {
  const { user } = useContext(AuthContext);
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const [modalEvent, setModalEvent] = useState(undefined);
  const isFormModalOpen = modalEvent !== undefined;

  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    if (!user?.id) return;
    loadEvents();
  }, [user]);

  const loadEvents = () => {
    setIsLoading(true);
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
  };

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
    setModalEvent(undefined);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;

    try {
      await eventsApi.delete(deleteId, user.id);
      setEvents((prev) => prev.filter((e) => e.id !== deleteId));
      setToast({ message: "Evento eliminado con éxito.", type: "success" });
    } catch (error) {
      setToast({ message: "Error al eliminar el evento.", type: "error" });
    } finally {
      setDeleteId(null);
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
                onDelete={(id) => setDeleteId(id)}
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
        isOpen={isFormModalOpen}
        event={modalEvent}
        onClose={() => setModalEvent(undefined)}
        onSaved={handleSaved}
      />

      {deleteId && (
        <MessageModal
          image={WarningIcon}
          message="¿Estás seguro de que quieres eliminar este evento? Esta acción no se puede deshacer."
          btnText="Eliminar"
          btnClass="liquid"
          onConfirm={confirmDelete}
          onClose={() => setDeleteId(null)}
        />
      )}

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

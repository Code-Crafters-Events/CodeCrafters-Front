import { useEffect, useState, useContext, useMemo } from "react";
import styles from "./UserPanel.module.css";
import EventRow from "../../molecules/EventRow/EventRow";
import Button from "../../atoms/Button/Button";
import Toast from "../../atoms/Toast/Toast";
import EventFormModal from "../../molecules/EventFormModal/EventFormModal";
import MessageModal from "../../organisms/MessageModal/MessageModal";
import { eventsApi } from "../../../services/eventsApi";
import { AuthContext } from "../../../context/auth/AuthContext";
import Tab from "../../atoms/Tab/Tab";
import WarningIcon from "../../../assets/warning.png";

const UserPanel = () => {
  const { user } = useContext(AuthContext);
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [modalEvent, setModalEvent] = useState(undefined);
  const isFormModalOpen = modalEvent !== undefined;

  const [deleteId, setDeleteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState("active");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  useEffect(() => {
    if (user?.id) {
      loadEvents();
    }
  }, [user?.id]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  const loadEvents = () => {
    setIsLoading(true);
    eventsApi
      .getByUser(user.id, 0, 999)
      .then((res) => {
        const data = res.data?.content ?? res.data;
        setEvents(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error(err);
        setEvents([]);
      })
      .finally(() => setIsLoading(false));
  };

  const handleSaved = (savedEvent, wasEditing) => {
    setEvents((prev) => {
      if (wasEditing) {
        return prev.map((e) => (e.id === savedEvent.id ? savedEvent : e));
      }
      return [savedEvent, ...prev];
    });

    setToast({
      message: wasEditing
        ? "Actualizado correctamente."
        : "Creado correctamente.",
      type: "success",
    });

    if (!wasEditing) {
      setCurrentPage(1);
      setActiveTab("active");
    }
    setModalEvent(undefined);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await eventsApi.delete(deleteId, user.id);
      setEvents((prev) => prev.filter((e) => e.id !== deleteId));
      setToast({ message: "Evento eliminado.", type: "success" });
      setDeleteId(null);
    } catch (error) {
      setToast({ message: "Error al eliminar.", type: "error" });
    } finally {
      setIsDeleting(false);
    }
  };

  const now = new Date();

  const activeEvents = events.filter((event) => {
    const eventDate = new Date(`${event.date}T${event.time || "00:00:00"}`);
    return eventDate >= now;
  });

  const pastEvents = events.filter((event) => {
    const eventDate = new Date(`${event.date}T${event.time || "00:00:00"}`);
    return eventDate < now;
  });

  const currentList = activeTab === "active" ? activeEvents : pastEvents;
  const totalPages = Math.ceil(currentList.length / itemsPerPage);
  const currentItems = currentList.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <section className={styles.container}>
      <h1 className={styles.title}>Panel de control de mis eventos</h1>

      <div className={styles.panel}>
        <div className={styles.tabsContainer}>
          <Tab
            text="Eventos Activos"
            count={activeEvents.length}
            isActive={activeTab === "active"}
            onClick={() => setActiveTab("active")}
          />
          <Tab
            text="Historial"
            count={pastEvents.length}
            isActive={activeTab === "past"}
            onClick={() => setActiveTab("past")}
          />
        </div>

        <div className={styles.content}>
          {isLoading ? (
            <p className={styles.empty}>Cargando eventos...</p>
          ) : (
            <>
              <div className={styles.list}>
                {currentItems.length > 0 ? (
                  currentItems.map((event) => (
                    <EventRow
                      key={event.id}
                      event={event}
                      isPast={activeTab === "past"}
                      onEdit={(e) => setModalEvent(e)}
                      onDelete={(id) => setDeleteId(id)}
                    />
                  ))
                ) : (
                  <p className={styles.empty}>
                    {activeTab === "active"
                      ? "No tienes eventos activos próximamente."
                      : "Tu historial está vacío."}
                  </p>
                )}
              </div>

              {totalPages > 1 && (
                <div className={styles.pagination}>
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((prev) => prev - 1)}
                    className={styles.pageBtn}
                  >
                    Anterior
                  </button>
                  <span className={styles.pageInfo}>
                    Página {currentPage} de {totalPages}
                  </span>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((prev) => prev + 1)}
                    className={styles.pageBtn}
                  >
                    Siguiente
                  </button>
                </div>
              )}
            </>
          )}
        </div>

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
          message="¿Estás segur@ de eliminar este evento?"
          btnText="Eliminar"
          btnClass="neon"
          onConfirm={confirmDelete}
          onClose={() => setDeleteId(null)}
          isLoading={isDeleting}
        />
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </section>
  );
};

export default UserPanel;

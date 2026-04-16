import { useState, useEffect, useContext, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styles from "./EventDetail.module.css";
import PriceTag from "../../atoms/PriceTag/PriceTag";
import Button from "../../atoms/Button/Button";
import Toast from "../../atoms/Toast/Toast";
import AttendeesList from "../../molecules/AttendeesList/AttendeesList";
import MessageModal from "../../organisms/MessageModal/MessageModal";
import TicketModal from "../../molecules/TicketModal/TicketModal";
import { eventsApi } from "../../../services/eventsApi";
import { ticketsApi } from "../../../services/ticketsApi";
import { AuthContext } from "../../../context/auth/AuthContext";
import EventTag from "../../atoms/EventTag/EventTag";
import { paymentsApi } from "../../../services/paymentsApi";
import WarningIcon from "../../../assets/warning.png";

const formatDate = (dateStr, timeStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const day = date.getDate().toString().padStart(2, "0");
  const month = date.toLocaleString("es-ES", { month: "short" }).toUpperCase();
  const year = date.getFullYear();
  const time = timeStr ? ` · ${timeStr.slice(0, 5)}h GMT+2` : "";
  return `${day} ${month} ${year}${time}`;
};

const EventDetail = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [totalTickets, setTotalTickets] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isWorking, setIsWorking] = useState(false);
  const [toast, setToast] = useState(null);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [registeredTicket, setRegisteredTicket] = useState(null);

  const isOwner = user?.id && event?.authorId === user.id;
  const currentCount = tickets.length > 0 ? tickets.length : totalTickets;
  const isFull = event?.maxAttendees > 0 && currentCount >= event?.maxAttendees;

  const loadTickets = useCallback(async () => {
    const storageUser = JSON.parse(localStorage.getItem("user") || "null");
    const currentUserId = user?.id || storageUser?.id;
    const currentToken = localStorage.getItem("token");

    if (!id || !currentToken || !currentUserId) return;
    try {
      const res = await ticketsApi.getByEvent(id, 0, 100);
      const data = res.data;
      const list = data.content ?? data;

      setTickets(list);
      setTotalTickets(data.totalElements ?? list.length);

      const myTicket = list.find((t) => t.userId === currentUserId);
      setIsRegistered(Boolean(myTicket));
    } catch (error) {
      console.error("Error al cargar asistentes:", error);
    }
  }, [id, user?.id]);

  useEffect(() => {
    if (!id) return;

    eventsApi
      .getById(id)
      .then((res) => setEvent(res.data))
      .catch(() =>
        setToast({ message: "No se pudo cargar el evento.", type: "error" }),
      )
      .finally(() => setIsLoading(false));

    loadTickets();
  }, [id, loadTickets]);

  const handleRegister = async () => {
    if (!user) {
      setToast({ message: "Debes iniciar sesión.", type: "info" });
      return;
    }
    if (isOwner) {
      setToast({ message: "Eres el organizador del evento.", type: "info" });
      return;
    }
    if (isFull) {
      setToast({ message: "El evento ya está completo.", type: "error" });
      return;
    }

    setIsWorking(true);

    try {
      const res = await paymentsApi.createIntent({
        userId: user.id,
        eventId: id,
      });

      const paymentData = res.data;

      if (!paymentData.clientSecret) {
        setRegisteredTicket({
          qrUrl: paymentData.qrUrl,
          verificationCode: paymentData.verificationCode,
          eventTitle: event.title,
          date: formatDate(event.date, event.time),
        });
        setShowTicketModal(true);
        setIsRegistered(true);
        await loadTickets();
      } else {
        navigate(`/home/checkout/${id}`, {
          state: { paymentData, eventTitle: event.title },
        });
      }
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || "Error al procesar la solicitud.";
      setToast({ message: errorMsg, type: "error" });
    } finally {
      setIsWorking(false);
    }
  };

  const confirmUnregister = async () => {
    setShowConfirmModal(false);
    setIsWorking(true);
    try {
      await ticketsApi.unregister(user.id, id);
      setToast({ message: "Asistencia cancelada.", type: "success" });
      await loadTickets();
    } catch {
      setToast({ message: "Error al cancelar.", type: "error" });
    } finally {
      setIsWorking(false);
    }
  };

  if (isLoading) return <p className={styles.loading}>Cargando evento...</p>;
  if (!event) return <p className={styles.loading}>Evento no encontrado.</p>;

  const locationStr = event.location?.address ?? event.location?.venue ?? null;

  return (
    <section className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>{event.title}</h1>

        <div className={styles.main}>
          <div className={styles.info}>
            <p className={styles.meta}>{formatDate(event.date, event.time)}</p>
            <p className={styles.meta}>
              @{event.authorAlias ?? event.authorName ?? "usuario"}
              {event.maxAttendees &&
                ` · ${currentCount}/${event.maxAttendees} plazas ocupadas`}
            </p>

            {event.description && (
              <p className={styles.description}>{event.description}</p>
            )}
            {locationStr && <p className={styles.location}>{locationStr}</p>}

            {user && (
              <AttendeesList tickets={tickets} totalCount={currentCount} />
            )}
          </div>

          {event.imageUrl && (
            <div className={styles.imageWrapper}>
              <img
                src={event.imageUrl.replace("localhost:5173", "localhost:8080")}
                alt={event.title}
                className={styles.image}
              />
            </div>
          )}
        </div>

        <div className={styles.actions}>
          {!user && (
            <p className={styles.loginHint}>
              <a href="/home/login" className={styles.loginLink}>
                Inicia sesión
              </a>{" "}
              para apuntarte.
            </p>
          )}

          {user && isOwner && (
            <span className={styles.ownerBadge}>
              Eres el organizador de este evento
            </span>
          )}

          {user && !isOwner && !isRegistered && (
            <Button
              text={
                isWorking
                  ? "Procesando..."
                  : isFull
                    ? "Evento Completo"
                    : "Asistir al evento"
              }
              BtnClass={isFull ? "disabled" : "neon"}
              type="button"
              onClick={handleRegister}
              disabled={isWorking || isFull}
            />
          )}

          {user && !isOwner && isRegistered && (
            <div className={styles.registeredRow}>
              <span className={styles.registeredBadge}>✓ Estás apuntado</span>
              <button
                type="button"
                className={styles.unregisterBtn}
                onClick={() => setShowConfirmModal(true)}
                disabled={isWorking}
              >
                {isWorking ? "Procesando..." : "Cancelar asistencia"}
              </button>
            </div>
          )}

          <Button
            text="Volver"
            BtnClass="cancel"
            type="button"
            onClick={() => navigate("/home/community")}
          />
        </div>

        <div className={styles.footer}>
          <EventTag
            label={event.category === "ONLINE" ? "ONLINE" : "PRESENCIAL"}
            color={event.category === "ONLINE" ? "#00FF9D" : "#FFB800"}
            borderColor={event.category === "ONLINE" ? "#00FF9D" : "#FFB800"}
          />
          <PriceTag price={event.price} />
        </div>
      </div>

      {showConfirmModal && (
        <MessageModal
          image={WarningIcon}
          message="¿Segura que quieres cancelar tu asistencia a este evento?"
          btnText="Confirmar"
          btnClass="neon"
          onConfirm={confirmUnregister}
          onClose={() => setShowConfirmModal(false)}
        />
      )}

      {showTicketModal && (
        <TicketModal
          ticket={registeredTicket}
          onClose={() => setShowTicketModal(false)}
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

export default EventDetail;

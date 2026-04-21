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
import ConfirmIcon from "../../../assets/check.gif";

const formatDate = (dateStr, timeStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const day = date.getDate().toString().padStart(2, "0");
  const month = date.toLocaleString("es-ES", { month: "short" }).toUpperCase();
  const year = date.getFullYear();
  const time = timeStr ? ` · ${timeStr.slice(0, 5)}h` : "";
  return `${day} ${month} ${year}${time}`;
};

const VALID_PAYMENT_STATUSES = ["COMPLETED", "FREE"];
const isValidPayment = (ticket) =>
  VALID_PAYMENT_STATUSES.includes(ticket.paymentStatus);

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

  const [showConfirmCancelModal, setShowConfirmCancelModal] = useState(false);
  const [showConfirmRegisterModal, setShowConfirmRegisterModal] =
    useState(false);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [registeredTicket, setRegisteredTicket] = useState(null);

  const isOwner = user?.id && event?.authorId === user.id;

  const currentCount = Array.isArray(tickets)
    ? tickets.filter(isValidPayment).length
    : 0;
  const isFull = event?.maxAttendees > 0 && currentCount >= event?.maxAttendees;

  const isFreeEvent = event?.price === 0 || event?.price === null;

  const loadTickets = useCallback(async () => {
    if (!id) return;

    try {
      const res = await ticketsApi.getByEvent(id, 0, 100);
      const data = res.data;
      const list = Array.isArray(data.content)
        ? data.content
        : Array.isArray(data)
          ? data
          : [];

      setTickets(list);
      setTotalTickets(data.totalElements ?? list.length);

      if (user?.id) {
        const myTicket = list.find((t) => t.userId === user.id);
        setIsRegistered(Boolean(myTicket && isValidPayment(myTicket)));
      }
    } catch (error) {
      console.error("Error al cargar asistentes:", error);
      setTickets([]);
    }
  }, [id, user?.id]);

  useEffect(() => {
    let isMounted = true;

    const fetchEventData = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const res = await eventsApi.getById(id);
        if (isMounted) {
          setEvent(res.data);
          await loadTickets();
        }
      } catch (err) {
        console.error("Error al cargar evento:", err);
        setToast({ message: "No se pudo cargar el evento.", type: "error" });
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchEventData();
    return () => {
      isMounted = false;
    };
  }, [id, loadTickets]);

  useEffect(() => {
    let pollInterval;
    let pollCount = 0;
    const maxPolls = 120;

    const startPolling = async () => {
      pollCount = 0;
      pollInterval = setInterval(async () => {
        pollCount++;
        await loadTickets();

        if (pollCount >= maxPolls) {
          clearInterval(pollInterval);
        }
      }, 500);
    };
    const handleFocus = () => {
      startPolling();
    };

    window.addEventListener("focus", handleFocus);

    startPolling();

    return () => {
      window.removeEventListener("focus", handleFocus);
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [loadTickets]);

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

    if (isFreeEvent) {
      setShowConfirmRegisterModal(true);
    } else {
      await proceedWithRegistration();
    }
  };

  const proceedWithRegistration = async () => {
    setShowConfirmRegisterModal(false);
    setIsWorking(true);

    try {
      const res = await paymentsApi.createIntent({
        userId: user.id,
        eventId: id,
      });

      const paymentData = res.data;

      if (!paymentData.clientSecret) {
        setRegisteredTicket({
          id: paymentData.ticketId,
          qrUrl: paymentData.qrUrl,
          verificationCode: paymentData.verificationCode,
          eventTitle: event.title,
          eventId: event.id,
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
    setShowConfirmCancelModal(false);
    setIsWorking(true);
    try {
      await ticketsApi.unregister(id);
      setToast({ message: "Asistencia cancelada.", type: "success" });
      await loadTickets();
    } catch (error) {
      const msg = error.response?.data?.message || "Error al cancelar.";
      setToast({ message: msg, type: "error" });
    } finally {
      setIsWorking(false);
    }
  };

  if (isLoading) return <p className={styles.loading}>Cargando evento...</p>;
  if (!event) return <p className={styles.loading}>Evento no encontrado.</p>;

  const isOnline = event.category === "ONLINE";

  const locationStr =
    !isOnline && event.location
      ? [
          event.location.address || event.location.venue,
          event.location.city,
          event.location.country,
        ]
          .filter((val) => val && val.trim() !== "")
          .join(", ")
      : null;

  const confirmedAttendees = Array.isArray(tickets)
    ? tickets.filter(isValidPayment)
    : [];

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
            {locationStr && (
              <p className={styles.location}>
                <strong>Ubicación: </strong> {locationStr}
              </p>
            )}
            {user && (
              <AttendeesList
                tickets={confirmedAttendees}
                totalCount={confirmedAttendees.length}
              />
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
                onClick={() => setShowConfirmCancelModal(true)}
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

      {showConfirmRegisterModal && (
        <MessageModal
          image={ConfirmIcon}
          message={`¿Segur@ que quieres asistir a "${event.title}"?`}
          btnText="Confirmar Asistencia"
          btnClass="neon"
          onConfirm={proceedWithRegistration}
          onClose={() => setShowConfirmRegisterModal(false)}
        />
      )}

      {showConfirmCancelModal && (
        <MessageModal
          image={WarningIcon}
          message="¿Segur@ que quieres cancelar tu asistencia a este evento?"
          btnText="Confirmar Cancelación"
          btnClass="neon"
          onConfirm={confirmUnregister}
          onClose={() => setShowConfirmCancelModal(false)}
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

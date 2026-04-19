import { useEffect, useState, useRef, useContext, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useStripe } from "@stripe/react-stripe-js";
import { AuthContext } from "../../../context/auth/AuthContext";
import { ticketsApi } from "../../../services/ticketsApi";
import { eventsApi } from "../../../services/eventsApi";
import { formatDate } from "../../../utils/dateFormatter";
import styles from "./PaymentSuccess.module.css";
import Button from "../../atoms/Button/Button";
import TicketModal from "../../molecules/TicketModal/TicketModal";

const PaymentSuccess = () => {
  const stripe = useStripe();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("Verificando tu pago...");
  const [ticket, setTicket] = useState(null);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const hasAttemptedRef = useRef(false);

  const loadUserTicket = useCallback(async (userId) => {
    let attempts = 0;
    const maxAttempts = 30;

    const tryLoadTicket = async () => {
      try {
        const res = await ticketsApi.getByUser(userId, 0, 10);
        const tickets = res.data.content ?? res.data;
        const myTicket = [...tickets]
          .sort((a, b) => b.id - a.id)
          .find((t) => t.paymentStatus === "COMPLETED");

        if (myTicket) {
          const eventRes = await eventsApi.getById(myTicket.eventId);
          const eventData = eventRes.data;
          const formattedDate = formatDate(eventData.date, eventData.time);

          setTicket({
            id: myTicket.id,
            qrUrl: myTicket.qrUrl,
            eventId: myTicket.eventId,
            verificationCode: myTicket.verificationCode || myTicket.id,
            eventTitle: eventData.title,
            date: formattedDate,
          });

          setStatus("success");
          setMessage("¡Pago Completado con Éxito!");
          setShowTicketModal(true);
          return;
        }

        if (attempts < maxAttempts) {
          attempts++;
          console.log(`Ticket no encontrado, reintentando...`);
          setTimeout(tryLoadTicket, 500);
        } else {
          console.warn("Ticket no encontrado después de 15 segundos");
          setStatus("success");
          setMessage(
            "Pago confirmado. Si no ves tu entrada, revisa 'Mis Tickets'.",
          );
        }
      } catch (error) {
        console.error("Error recuperando ticket:", error);
        if (attempts < maxAttempts) {
          attempts++;
          setTimeout(tryLoadTicket, 1000);
        }
      }
    };
    tryLoadTicket();
  }, []);

  useEffect(() => {
    const clientSecret = searchParams.get("payment_intent_client_secret");
    if (!stripe || !clientSecret || !user?.id || hasAttemptedRef.current)
      return;

    hasAttemptedRef.current = true;

    stripe
      .retrievePaymentIntent(clientSecret)
      .then(({ paymentIntent }) => {
        console.log("PaymentIntent status:", paymentIntent.status);

        if (paymentIntent.status === "succeeded") {
          console.log("Pago exitoso - Cargando ticket del usuario");
          loadUserTicket(user.id);
        } else {
          setStatus("error");
          setMessage("No se pudo verificar el pago.");
        }
      })
      .catch((err) => {
        console.error("Error con Stripe:", err);
        setStatus("error");
        setMessage("Error de conexión con Stripe.");
      });
  }, [stripe, searchParams, user?.id, loadUserTicket]);

  if (status === "loading") {
    return (
      <div className={styles.loadingOverlay}>
        <div className={styles.spinner}></div>
        <p className={styles.loadingText}>Generando tu entrada...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={`${styles.card} ${styles[status]}`}>
        <div className={styles.icon}>{status === "success" ? "✓" : "✕"}</div>
        <h1>{message}</h1>
        <div className={styles.actions}>
          <Button
            text="Ir a Mis Entradas"
            BtnClass="neon"
            onClick={() => navigate("/home/my-tickets")}
          />
          <Button
            text="Volver a Eventos"
            BtnClass="cancel"
            onClick={() => navigate("/home/community")}
          />
        </div>
      </div>

      {showTicketModal && ticket && (
        <TicketModal
          ticket={ticket}
          onClose={() => setShowTicketModal(false)}
        />
      )}
    </div>
  );
};

export default PaymentSuccess;

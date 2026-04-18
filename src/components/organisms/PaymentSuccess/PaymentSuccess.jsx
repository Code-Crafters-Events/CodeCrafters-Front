import { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useStripe } from "@stripe/react-stripe-js";
import styles from "./PaymentSuccess.module.css";
import Button from "../../atoms/Button/Button";

const PaymentSuccess = () => {
  const stripe = useStripe();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("Verificando tu pago...");
  const hasAttemptedRef = useRef(false);

  useEffect(() => {

    const clientSecret = searchParams.get("payment_intent_client_secret");

    if (hasAttemptedRef.current) {
      console.log("Ya se intentó verificar el pago antes");
      return;
    }

    if (!clientSecret) {
      setStatus("error");
      setMessage("No se encontró información del pago.");
      hasAttemptedRef.current = true;
      return;
    }

    if (!stripe) {
      console.log("Esperando a que Stripe cargue...");
      return;
    }

    hasAttemptedRef.current = true;
    stripe
      .retrievePaymentIntent(clientSecret)
      .then(({ paymentIntent }) => {

        switch (paymentIntent.status) {
          case "succeeded":
            console.log("Pago exitoso - Cambiando estado a success");
            setStatus("success");
            setMessage("Pago Completado con Éxito");
            break;

          case "processing":
            console.log("Pago en proceso");
            setStatus("processing");
            setMessage(
              "Tu pago se está procesando. Te avisaremos cuando se complete.",
            );
            break;

          case "requires_payment_method":
            setStatus("error");
            setMessage(
              "El pago no se pudo realizar. Por favor, inténtalo de nuevo.",
            );
            break;

          default:
            console.log("Estado desconocido:", paymentIntent.status);
            setStatus("error");
            setMessage("Algo salió mal.");
            break;
        }
      })
      .catch((err) => {
        console.error("Error en retrievePaymentIntent:", err);
        setStatus("error");
        setMessage("Error al verificar tu pago. Por favor intenta de nuevo.");
      });
  }, [stripe, searchParams]);

  if (status === "loading")
    return (
      <div className={styles.loadingOverlay}>
        <div className={styles.spinner}></div>
        <p className={styles.loadingText}>Verificando tu pago...</p>
      </div>
    );

  return (
    <div className={styles.container}>
      <div className={`${styles.card} ${styles[status]}`}>
        <div className={styles.icon}>{status === "success" ? "✓" : "✕"}</div>

        <h1>{message}</h1>

        {status === "success" ? (
          <p className={styles.pNotified}>
            Tu entrada ya se está generando. Podrás verla en tu perfil en unos
            instantes.
          </p>
        ) : (
          <p className={styles.pNotified}>Si el problema persiste, contacta con soporte.</p>
        )}

        <div className={styles.actions}>
          <Button
            text="Ir a Mis Entradas"
            BtnClass="neon"
            disabled={status !== "success"}
            onClick={() => navigate("/home/my-tickets")}
          />
          <Button
            text="Volver a Eventos"
            BtnClass="cancel"
            onClick={() => navigate("/home/community")}
          />
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;

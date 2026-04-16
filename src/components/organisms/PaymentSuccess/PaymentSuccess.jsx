import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import styles from "./PaymentSuccess.module.css";
import Button from "../../atoms/Button/Button";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("Procesando...");

  useEffect(() => {
    const clientSecret = searchParams.get("payment_intent_client_secret");

    if (clientSecret) {
      setStatus("¡Pago Completado con Éxito!");
    }
  }, [searchParams]);

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.icon}>✓</div>
        <h1>{status}</h1>
        <p>Tu entrada ya está disponible en tu perfil.</p>

        <div className={styles.actions}>
          <Button
            text="Ir a Mis Entradas"
            BtnClass="neon"
            onClick={() => navigate("/home/my-tickets")}
          />
          <Button
            text="Volver al Inicio"
            BtnClass="cancel"
            onClick={() => navigate("/home/community")}
          />
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;

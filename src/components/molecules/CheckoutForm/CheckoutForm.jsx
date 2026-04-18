import {
  useStripe,
  useElements,
  PaymentElement,
} from "@stripe/react-stripe-js";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./CheckoutForm.module.css";

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      console.error("Error: Stripe o Elements no cargados");
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/home/success`,
        },
      });

      if (error) {
        console.error("Error de Stripe:", error);
        if (error.type === "card_error" || error.type === "validation_error") {
          setMessage(error.message);
        } else {
          setMessage("Error inesperado: " + error.message);
        }
      }
    } catch (err) {
      console.error("Error en el catch:", err);
      setMessage("Error de conexión con el servidor.");
    } finally {
      console.log("Finalizando estado de carga");
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(-1); 
  };
  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.paymentElementContainer}>
        <PaymentElement id="payment-element" />
      </div>

      <div className={styles.actions}>
        <button
          type="submit"
          disabled={isLoading || !stripe || !elements}
          className={styles.botonNeon}
        >
          {isLoading ? "Procesando..." : "Finalizar Pago"}
        </button>
        <button
          type="button"
          onClick={handleCancel}
          className={styles.cancel}
          disabled={isLoading}
        >
        Cancelar
        </button>
      </div>
    </form>
  );
};

export default CheckoutForm;

import {
  useStripe,
  useElements,
  PaymentElement,
} from "@stripe/react-stripe-js";
import { useState } from "react";
import styles from "./CheckoutForm.module.css";

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("1. Botón clickeado");

    if (!stripe || !elements) {
      console.error("2. Error: Stripe o Elements no cargados");
      return;
    }

    setIsLoading(true);
    setMessage(null);

    console.log("3. Intentando confirmar pago...");

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/home/success`,
        },
      });

      if (error) {
        console.error("4. Error de Stripe:", error);
        if (error.type === "card_error" || error.type === "validation_error") {
          setMessage(error.message);
        } else {
          setMessage("Error inesperado: " + error.message);
        }
      }
    } catch (err) {
      console.error("5. Error catastrófico en el catch:", err);
      setMessage("Error de conexión con el servidor.");
    } finally {
      console.log("6. Finalizando estado de carga");
      setIsLoading(false);
    }
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
      </div>
    </form>
  );
};

export default CheckoutForm;

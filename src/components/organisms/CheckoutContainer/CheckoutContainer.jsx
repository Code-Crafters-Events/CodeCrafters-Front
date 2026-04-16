import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from "../../molecules/CheckoutForm/CheckoutForm";
import styles from "./CheckoutContainer.module.css";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const CheckoutContainer = ({ clientSecret, eventTitle, amount }) => {
  const options = {
    clientSecret,
    appearance: {
      theme: 'night',
      variables: {
        colorPrimary: '#00ff9d',
        colorBackground: '#111111',
        colorText: '#ffffff',
        fontFamily: 'Orbitron, sans-serif',
      },
      rules: {
        '.Input': { border: '1px solid #333' },
        '.Input:focus': { boxShadow: '0 0 10px rgba(0, 255, 157, 0.2)' }
      }
    },
  };

  return (
    <div className={styles.checkoutWrapper}>
      <h3 className={styles.title}>Confirmar Reserva</h3>
      <p className={styles.priceInfo}>
        Evento: <strong>{eventTitle}</strong> <br />
        Total: <span style={{color: '#00ff9d'}}>{amount}€</span>
      </p>
      
      <Elements stripe={stripePromise} options={options}>
        <CheckoutForm />
      </Elements>
    </div>
  );
};
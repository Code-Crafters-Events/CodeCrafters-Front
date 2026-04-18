import { useLocation } from "react-router-dom";
import CheckoutContainer from "../../components/organisms/CheckoutContainer/CheckoutContainer";
import styles from "./Checkout.module.css";

function Checkout() {
  const location = useLocation();
  const paymentData = location.state?.paymentData;
  const eventTitle = location.state?.eventTitle;

  if (!paymentData?.clientSecret) {
    return (
      <main role="main" className={styles.wrapperMain}>
        <h2>Sesión de pago no válida</h2>
        <p>Por favor, vuelve al evento e intenta apuntarte de nuevo.</p>
      </main>
    );
  }

  return (
    <main>
      <CheckoutContainer
        clientSecret={paymentData.clientSecret}
        eventTitle={eventTitle}
        amount={paymentData.amount}
      />
    </main>
  );
}

export default Checkout;

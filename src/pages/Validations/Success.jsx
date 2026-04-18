import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import PaymentSuccess from "../../components/organisms/PaymentSuccess/PaymentSuccess";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

function Success() {
  return (
    <main role="main">
      <Elements stripe={stripePromise}>
        <PaymentSuccess />
      </Elements>
    </main>
  );
}

export default Success;

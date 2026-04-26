import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import CheckoutContainer from "../components/organisms/CheckoutContainer/CheckoutContainer";


vi.mock("@stripe/react-stripe-js", () => ({
  Elements: ({ children }) => <div data-testid="stripe-elements">{children}</div>,
  PaymentElement: () => <div data-testid="payment-element-mock" />, // <--- Añade esto
  useStripe: () => ({
    confirmPayment: vi.fn(),
  }),
  useElements: () => ({
    getElement: vi.fn(),
  }),
  loadStripe: vi.fn(),
}));

describe("CheckoutContainer", () => {
  it("renderiza el título 'Confirmar Reserva'", () => {
    render(
      <MemoryRouter>
        <CheckoutContainer
          clientSecret="secret_123"
          eventTitle="HackMadrid"
          amount={25}
        />
      </MemoryRouter>
    );
    expect(screen.getByText("Confirmar Reserva")).toBeInTheDocument();
  });

  it("muestra el nombre del evento", () => {
    render(
      <MemoryRouter>
        <CheckoutContainer
          clientSecret="secret_123"
          eventTitle="HackMadrid"
          amount={25}
        />
      </MemoryRouter>
    );
    expect(screen.getByText("HackMadrid")).toBeInTheDocument();
  });

  it("muestra el importe con el símbolo €", () => {
    render(
      <MemoryRouter>
        <CheckoutContainer
          clientSecret="secret_123"
          eventTitle="HackMadrid"
          amount={25}
        />
      </MemoryRouter>
    );
    expect(screen.getByText("25€")).toBeInTheDocument();
  });

  it("envuelve el contenido con el componente stripe-elements", () => {
    render(
      <MemoryRouter>
        <CheckoutContainer
          clientSecret="secret_123"
          eventTitle="Test"
          amount={0}
        />
      </MemoryRouter>
    );
    expect(screen.getByTestId("stripe-elements")).toBeInTheDocument();
  });
});


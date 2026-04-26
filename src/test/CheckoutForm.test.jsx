import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";

const { mockConfirmPayment, mockUseStripe, mockUseElements } = vi.hoisted(
  () => ({
    mockConfirmPayment: vi.fn(),
    mockUseStripe: vi.fn(),
    mockUseElements: vi.fn(),
  }),
);

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, useNavigate: () => mockNavigate };
});
vi.mock("react-router", async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock("@stripe/react-stripe-js", () => ({
  useStripe: mockUseStripe,
  useElements: mockUseElements,
  PaymentElement: () => <div data-testid="payment-element" />,
  Elements: ({ children }) => <>{children}</>,
}));

import CheckoutForm from "../components/molecules/CheckoutForm/CheckoutForm";

const mockStripe = () => ({ confirmPayment: mockConfirmPayment });
const mockElements = () => ({});
const wrap = () =>
  render(
    <MemoryRouter>
      <CheckoutForm />
    </MemoryRouter>,
  );

describe("CheckoutForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseStripe.mockReturnValue(mockStripe());
    mockUseElements.mockReturnValue(mockElements());
  });

  it("renderiza el PaymentElement", () => {
    wrap();
    expect(screen.getByTestId("payment-element")).toBeInTheDocument();
  });

  it("renderiza el botón 'Finalizar Pago' y 'Cancelar'", () => {
    wrap();
    expect(screen.getByText("Finalizar Pago")).toBeInTheDocument();
    expect(screen.getByText("Cancelar")).toBeInTheDocument();
  });

  it("el botón de submit tiene type='submit'", () => {
    wrap();
    expect(screen.getByText("Finalizar Pago")).toHaveAttribute(
      "type",
      "submit",
    );
  });

  it("el botón 'Cancelar' tiene type='button'", () => {
    wrap();
    expect(screen.getByText("Cancelar")).toHaveAttribute("type", "button");
  });

  it("el botón 'Finalizar Pago' está habilitado cuando stripe y elements existen", () => {
    wrap();
    expect(screen.getByText("Finalizar Pago")).not.toBeDisabled();
  });

  it("el botón 'Finalizar Pago' está deshabilitado cuando stripe es null", () => {
    mockUseStripe.mockReturnValue(null);
    wrap();
    expect(screen.getByText("Finalizar Pago")).toBeDisabled();
  });

  it("el botón 'Finalizar Pago' está deshabilitado cuando elements es null", () => {
    mockUseElements.mockReturnValue(null);
    wrap();
    expect(screen.getByText("Finalizar Pago")).toBeDisabled();
  });

  it("navega -1 al hacer click en 'Cancelar'", () => {
    wrap();
    fireEvent.click(screen.getByText("Cancelar"));
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  it("el botón 'Cancelar' no está deshabilitado en estado inicial", () => {
    wrap();
    expect(screen.getByText("Cancelar")).not.toBeDisabled();
  });

  it("no llama a confirmPayment si stripe es null al hacer submit", async () => {
    mockUseStripe.mockReturnValue(null);
    wrap();
    fireEvent.submit(screen.getByText("Finalizar Pago").closest("form"));
    await waitFor(() => {
      expect(mockConfirmPayment).not.toHaveBeenCalled();
    });
  });

  it("no llama a confirmPayment si elements es null al hacer submit", async () => {
    mockUseElements.mockReturnValue(null);
    wrap();
    fireEvent.submit(screen.getByText("Finalizar Pago").closest("form"));
    await waitFor(() => {
      expect(mockConfirmPayment).not.toHaveBeenCalled();
    });
  });

  it("llama a confirmPayment con la return_url correcta al hacer submit", async () => {
    mockConfirmPayment.mockResolvedValue({});
    wrap();
    fireEvent.submit(screen.getByText("Finalizar Pago").closest("form"));
    await waitFor(() => {
      expect(mockConfirmPayment).toHaveBeenCalledWith(
        expect.objectContaining({
          confirmParams: expect.objectContaining({
            return_url: expect.stringContaining("/home/success"),
          }),
        }),
      );
    });
  });

  it("muestra 'Procesando...' y deshabilita botones durante el submit", async () => {
    let resolve;
    mockConfirmPayment.mockReturnValue(
      new Promise((res) => {
        resolve = res;
      }),
    );
    wrap();
    fireEvent.submit(screen.getByText("Finalizar Pago").closest("form"));
    await waitFor(() => {
      expect(screen.getByText("Procesando...")).toBeDisabled();
      expect(screen.getByText("Cancelar")).toBeDisabled();
    });
    resolve({});
  });

  it("vuelve a mostrar 'Finalizar Pago' tras completar el submit", async () => {
    let resolve;
    mockConfirmPayment.mockReturnValue(
      new Promise((res) => {
        resolve = res;
      }),
    );
    wrap();
    fireEvent.submit(screen.getByText("Finalizar Pago").closest("form"));
    await waitFor(() =>
      expect(screen.getByText("Procesando...")).toBeInTheDocument(),
    );
    resolve({});
    await waitFor(() => {
      expect(screen.getByText("Finalizar Pago")).toBeInTheDocument();
    });
  });

  it("muestra el mensaje de error para card_error", async () => {
    mockConfirmPayment.mockResolvedValue({
      error: { type: "card_error", message: "Tu tarjeta fue rechazada." },
    });
    wrap();
    const submitBtn = screen.getByText("Finalizar Pago");
    fireEvent.click(submitBtn);
    const errorMessage = await screen.findByText("Tu tarjeta fue rechazada.");
    expect(errorMessage).toBeInTheDocument();
  });

  it("muestra el mensaje de error para validation_error", async () => {
    mockConfirmPayment.mockResolvedValue({
      error: {
        type: "validation_error",
        message: "Número de tarjeta inválido.",
      },
    });
    wrap();
    fireEvent.submit(screen.getByText("Finalizar Pago").closest("form"));
    await waitFor(() => {
      expect(
        screen.getByText("Número de tarjeta inválido."),
      ).toBeInTheDocument();
    });
  });

  it("muestra error genérico para tipos de error distintos a card/validation", async () => {
    mockConfirmPayment.mockResolvedValue({
      error: { type: "api_error", message: "Algo salió mal." },
    });
    wrap();
    fireEvent.submit(screen.getByText("Finalizar Pago").closest("form"));
    await waitFor(() => {
      expect(screen.getByText(/Error inesperado/)).toBeInTheDocument();
    });
  });

  it("muestra 'Error de conexión con el servidor.' cuando confirmPayment lanza excepción", async () => {
    mockConfirmPayment.mockRejectedValue(new Error("Network error"));
    wrap();
    fireEvent.submit(screen.getByText("Finalizar Pago").closest("form"));
    await waitFor(() => {
      expect(
        screen.getByText("Error de conexión con el servidor."),
      ).toBeInTheDocument();
    });
  });

  it("vuelve a habilitar 'Cancelar' después de un error", async () => {
    mockConfirmPayment.mockResolvedValue({
      error: { type: "card_error", message: "Rechazada." },
    });
    wrap();
    fireEvent.submit(screen.getByText("Finalizar Pago").closest("form"));
    await waitFor(() => {
      expect(screen.getByText("Cancelar")).not.toBeDisabled();
    });
  });

  it("vuelve a habilitar 'Finalizar Pago' después de un error", async () => {
    mockConfirmPayment.mockResolvedValue({
      error: { type: "card_error", message: "Rechazada." },
    });
    wrap();
    fireEvent.submit(screen.getByText("Finalizar Pago").closest("form"));
    await waitFor(() => {
      expect(screen.getByText("Finalizar Pago")).not.toBeDisabled();
    });
  });
});

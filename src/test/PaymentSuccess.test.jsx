import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import PaymentSuccess from "../components/organisms/PaymentSuccess/PaymentSuccess";
import { AuthContext } from "../context/auth/AuthContext";

const { mockUseStripe, mockTicketsGetByUser, mockEventsGetById } = vi.hoisted(() => ({
  mockUseStripe: vi.fn(),
  mockTicketsGetByUser: vi.fn(),
  mockEventsGetById: vi.fn(),
}));

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("../components/atoms/Button/Button", () => ({
  default: ({ text, onClick }) => <button onClick={onClick}>{text}</button>,
}));

vi.mock("@stripe/react-stripe-js", () => ({
  useStripe: mockUseStripe,
  Elements: ({ children }) => <>{children}</>,
}));

vi.mock("../services/ticketsApi", () => ({
  ticketsApi: { getByUser: mockTicketsGetByUser },
}));

vi.mock("../services/eventsApi", () => ({
  eventsApi: { getById: mockEventsGetById },
}));

const flushPromises = (depth = 10) =>
  depth === 0
    ? Promise.resolve()
    : new Promise((resolve) =>
        queueMicrotask(() => resolve(flushPromises(depth - 1)))
      );

const mockUser = { id: 1, name: "Jennifer" };
const WITH_SECRET = "?payment_intent_client_secret=secret_123";
const mockEventData = { id: 10, title: "HackMadrid 2026", date: "2030-06-15", time: "10:00" };
const completedTicket = { id: 42, eventId: 10, paymentStatus: "COMPLETED" };

const succeededStripe = (retrieveFn) => ({
  retrievePaymentIntent:
    retrieveFn ??
    vi.fn().mockResolvedValue({ paymentIntent: { status: "succeeded" } }),
});

describe("PaymentSuccess — Cobertura completa", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const wrap = (search = "") =>
    render(
      <MemoryRouter initialEntries={[`/home/success${search}`]}>
        <AuthContext.Provider value={{ user: mockUser }}>
          <Routes>
            <Route path="/home/success" element={<PaymentSuccess />} />
          </Routes>
        </AuthContext.Provider>
      </MemoryRouter>
    );

  it("muestra spinner cuando stripe es null", () => {
    mockUseStripe.mockReturnValue(null);
    wrap();
    expect(screen.getByText("Generando tu entrada...")).toBeInTheDocument();
  });

  it("muestra spinner cuando hay clientSecret pero stripe aún no está listo", () => {
    mockUseStripe.mockReturnValue(null);
    wrap(WITH_SECRET);
    expect(screen.getByText("Generando tu entrada...")).toBeInTheDocument();
  });

  it("muestra spinner cuando stripe está listo pero no hay user", () => {
    render(
      <MemoryRouter initialEntries={[`/home/success${WITH_SECRET}`]}>
        <AuthContext.Provider value={{ user: null }}>
          <Routes>
            <Route path="/home/success" element={<PaymentSuccess />} />
          </Routes>
        </AuthContext.Provider>
      </MemoryRouter>
    );
    expect(screen.getByText("Generando tu entrada...")).toBeInTheDocument();
  });

  it("NO llama a retrievePaymentIntent cuando no hay clientSecret en la URL", () => {
    const mockRetrieve = vi.fn();
    mockUseStripe.mockReturnValue({ retrievePaymentIntent: mockRetrieve });
    wrap();
    expect(mockRetrieve).not.toHaveBeenCalled();
  });

  it("muestra error cuando el pago falla (canceled)", async () => {
    mockUseStripe.mockReturnValue({
      retrievePaymentIntent: vi.fn().mockResolvedValue({
        paymentIntent: { status: "canceled" },
      }),
    });
    wrap(WITH_SECRET);
    await act(async () => {
      await flushPromises();
    });
    expect(screen.getByText("No se pudo verificar el pago.")).toBeInTheDocument();
  });

  it("muestra error cuando el pago está en 'requires_payment_method'", async () => {
    mockUseStripe.mockReturnValue({
      retrievePaymentIntent: vi.fn().mockResolvedValue({
        paymentIntent: { status: "requires_payment_method" },
      }),
    });
    wrap(WITH_SECRET);
    await act(async () => {
      await flushPromises();
    });
    expect(screen.getByText("No se pudo verificar el pago.")).toBeInTheDocument();
  });

  it("muestra 'Error de conexión con Stripe.' cuando retrievePaymentIntent lanza excepción", async () => {
    mockUseStripe.mockReturnValue({
      retrievePaymentIntent: vi.fn().mockRejectedValue(new Error("stripe error")),
    });
    wrap(WITH_SECRET);
    await act(async () => {
      await flushPromises();
    });
    expect(screen.getByText("Error de conexión con Stripe.")).toBeInTheDocument();
  });

  it("muestra los botones 'Ir a Mis Entradas' y 'Volver a Eventos' tras error", async () => {
    mockUseStripe.mockReturnValue({
      retrievePaymentIntent: vi.fn().mockRejectedValue(new Error("err")),
    });
    wrap(WITH_SECRET);
    await act(async () => {
      await flushPromises();
    });
    expect(screen.getByText("Ir a Mis Entradas")).toBeInTheDocument();
    expect(screen.getByText("Volver a Eventos")).toBeInTheDocument();
  });

  it("navega a /home/my-tickets al hacer click en 'Ir a Mis Entradas'", async () => {
    mockUseStripe.mockReturnValue({
      retrievePaymentIntent: vi.fn().mockRejectedValue(new Error("err")),
    });
    wrap(WITH_SECRET);
    await act(async () => {
      await flushPromises();
    });
    fireEvent.click(screen.getByText("Ir a Mis Entradas"));
    expect(mockNavigate).toHaveBeenCalledWith("/home/my-tickets");
  });

  it("navega a /home/community al hacer click en 'Volver a Eventos'", async () => {
    mockUseStripe.mockReturnValue({
      retrievePaymentIntent: vi.fn().mockRejectedValue(new Error("err")),
    });
    wrap(WITH_SECRET);
    await act(async () => {
      await flushPromises();
    });
    fireEvent.click(screen.getByText("Volver a Eventos"));
    expect(mockNavigate).toHaveBeenCalledWith("/home/community");
  });

  it("muestra el TicketModal tras pago succeeded y ticket encontrado", async () => {
    mockUseStripe.mockReturnValue(succeededStripe());
    mockTicketsGetByUser.mockResolvedValue({ data: { content: [completedTicket] } });
    mockEventsGetById.mockResolvedValue({ data: mockEventData });
    wrap(WITH_SECRET);
    await act(async () => {
      await flushPromises();
    });
    expect(screen.getByText("¡Pago Completado con Éxito!")).toBeInTheDocument();
    expect(screen.getByText("¡Entrada Confirmada!")).toBeInTheDocument();
  });

  it("llama a eventsApi.getById con el eventId del ticket encontrado", async () => {
    mockUseStripe.mockReturnValue(succeededStripe());
    mockTicketsGetByUser.mockResolvedValue({ data: { content: [completedTicket] } });
    mockEventsGetById.mockResolvedValue({ data: mockEventData });
    wrap(WITH_SECRET);
    await act(async () => {
      await flushPromises();
    });
    expect(mockEventsGetById).toHaveBeenCalledWith(completedTicket.eventId);
  });

  it("usa ticket.id como verificationCode cuando el campo viene vacío", async () => {
    const ticketSinCodigo = { ...completedTicket, verificationCode: null };
    mockUseStripe.mockReturnValue(succeededStripe());
    mockTicketsGetByUser.mockResolvedValue({ data: { content: [ticketSinCodigo] } });
    mockEventsGetById.mockResolvedValue({ data: mockEventData });
    wrap(WITH_SECRET);
    await act(async () => {
      await flushPromises();
    });
    expect(screen.getByText("¡Entrada Confirmada!")).toBeInTheDocument();
    expect(screen.getByText("42")).toBeInTheDocument();
  });

  it("acepta respuesta como array plano (sin .content) y encuentra el ticket", async () => {
    mockUseStripe.mockReturnValue(succeededStripe());
    mockTicketsGetByUser.mockResolvedValue({ data: [completedTicket] });
    mockEventsGetById.mockResolvedValue({ data: mockEventData });
    wrap(WITH_SECRET);
    await act(async () => {
      await flushPromises();
    });
    expect(screen.getByText("¡Pago Completado con Éxito!")).toBeInTheDocument();
  });

  it("ignora tickets cuyo paymentStatus no es COMPLETED", async () => {
    const pendingTicket = { ...completedTicket, paymentStatus: "PENDING" };
    mockUseStripe.mockReturnValue(succeededStripe());
    mockTicketsGetByUser
      .mockResolvedValueOnce({ data: { content: [pendingTicket] } })
      .mockResolvedValueOnce({ data: { content: [completedTicket] } });
    mockEventsGetById.mockResolvedValue({ data: mockEventData });
    wrap(WITH_SECRET);
    await act(async () => {
      await flushPromises();
      vi.advanceTimersByTime(500);
      await flushPromises();
    });
    expect(screen.getByText("¡Entrada Confirmada!")).toBeInTheDocument();
  });

  it("ordena los tickets por id descendente y coge el más reciente COMPLETED", async () => {
    const olderTicket = { id: 10, eventId: 10, paymentStatus: "COMPLETED" };
    const newerTicket = { id: 42, eventId: 10, paymentStatus: "COMPLETED" };
    mockUseStripe.mockReturnValue(succeededStripe());
    mockTicketsGetByUser.mockResolvedValue({ data: { content: [olderTicket, newerTicket] } });
    mockEventsGetById.mockResolvedValue({ data: mockEventData });
    wrap(WITH_SECRET);
    await act(async () => {
      await flushPromises();
    });
    expect(screen.getByText("¡Entrada Confirmada!")).toBeInTheDocument();
  });

  it("cierra el TicketModal al hacer click en 'Cerrar'", async () => {
    mockUseStripe.mockReturnValue(succeededStripe());
    mockTicketsGetByUser.mockResolvedValue({ data: { content: [completedTicket] } });
    mockEventsGetById.mockResolvedValue({ data: mockEventData });
    wrap(WITH_SECRET);
    await act(async () => {
      await flushPromises();
    });
    expect(screen.getByText("¡Entrada Confirmada!")).toBeInTheDocument();
    act(() => {
      fireEvent.click(screen.getByText("Cerrar"));
    });
    expect(screen.queryByText("¡Entrada Confirmada!")).not.toBeInTheDocument();
  });

  it("reintenta con setTimeout(500) cuando el ticket COMPLETED aún no existe", async () => {
    mockUseStripe.mockReturnValue(succeededStripe());
    mockTicketsGetByUser
      .mockResolvedValueOnce({ data: { content: [] } })
      .mockResolvedValueOnce({ data: { content: [completedTicket] } });
    mockEventsGetById.mockResolvedValue({ data: mockEventData });
    wrap(WITH_SECRET);
    await act(async () => {
      await flushPromises();
    });
    await act(async () => {
      vi.advanceTimersByTime(500);
      await flushPromises();
    });
    expect(screen.getByText("¡Entrada Confirmada!")).toBeInTheDocument();
    expect(mockTicketsGetByUser).toHaveBeenCalledTimes(2);
  });

  it("también reintenta cuando la respuesta es array plano sin ticket COMPLETED", async () => {
    mockUseStripe.mockReturnValue(succeededStripe());
    mockTicketsGetByUser
      .mockResolvedValueOnce({ data: [{ ...completedTicket, paymentStatus: "FREE" }] })
      .mockResolvedValueOnce({ data: { content: [completedTicket] } });
    mockEventsGetById.mockResolvedValue({ data: mockEventData });
    wrap(WITH_SECRET);
    await act(async () => {
      await flushPromises();
    });
    await act(async () => {
      vi.advanceTimersByTime(500);
      await flushPromises();
    });
    expect(screen.getByText("¡Entrada Confirmada!")).toBeInTheDocument();
  });

  it("muestra error de ticket tardando cuando se superan los 20 intentos", async () => {
    mockUseStripe.mockReturnValue(succeededStripe());
    mockTicketsGetByUser.mockResolvedValue({ data: { content: [] } });
    wrap(WITH_SECRET);
    for (let i = 0; i <= 20; i++) {
      await act(async () => {
        await flushPromises();
        vi.advanceTimersByTime(500);
      });
    }
    await act(async () => {
      await flushPromises();
    });
    expect(
      screen.getByText(/tu entrada está tardando en generarse/i)
    ).toBeInTheDocument();
  });

  it("reintenta tras error de red si attempts < 5", async () => {
    mockUseStripe.mockReturnValue(succeededStripe());
    mockTicketsGetByUser
      .mockRejectedValueOnce(new Error("Network error"))
      .mockResolvedValueOnce({ data: { content: [completedTicket] } });
    mockEventsGetById.mockResolvedValue({ data: mockEventData });
    wrap(WITH_SECRET);
    await act(async () => {
      await flushPromises();
    });
    await act(async () => {
      vi.advanceTimersByTime(2000);
      await flushPromises();
    });
    expect(screen.getByText("¡Entrada Confirmada!")).toBeInTheDocument();
    expect(mockTicketsGetByUser).toHaveBeenCalledTimes(2);
  });

  it("muestra 'Error de conexión al obtener tu ticket.' tras 5 fallos consecutivos", async () => {
    mockUseStripe.mockReturnValue(succeededStripe());
    mockTicketsGetByUser.mockRejectedValue(new Error("persistent error"));
    wrap(WITH_SECRET);
    for (let i = 0; i <= 5; i++) {
      await act(async () => {
        await flushPromises();
        vi.advanceTimersByTime(2000);
      });
    }
    await act(async () => {
      await flushPromises();
    });
    expect(
      screen.getByText("Error de conexión al obtener tu ticket.")
    ).toBeInTheDocument();
  });

  it("solo llama a retrievePaymentIntent una vez aunque el effect se re-ejecute", async () => {
    const mockRetrieve = vi.fn().mockResolvedValue({
      paymentIntent: { status: "canceled" },
    });
    mockUseStripe.mockReturnValue({ retrievePaymentIntent: mockRetrieve });
    wrap(WITH_SECRET);
    await act(async () => {
      await flushPromises();
    });
    expect(mockRetrieve).toHaveBeenCalledTimes(1);
  });

  it("muestra el icono ✓ en estado éxito", async () => {
    mockUseStripe.mockReturnValue(succeededStripe());
    mockTicketsGetByUser.mockResolvedValue({ data: { content: [completedTicket] } });
    mockEventsGetById.mockResolvedValue({ data: mockEventData });
    wrap(WITH_SECRET);
    await act(async () => {
      await flushPromises();
    });
    expect(screen.getByText("✓")).toBeInTheDocument();
  });

  it("muestra el icono ✕ en estado error", async () => {
    mockUseStripe.mockReturnValue({
      retrievePaymentIntent: vi.fn().mockRejectedValue(new Error("err")),
    });
    wrap(WITH_SECRET);
    await act(async () => {
      await flushPromises();
    });
    expect(screen.getByText("✕")).toBeInTheDocument();
  });
});

import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { AuthContext } from "../context/auth/AuthContext";
import EventDetail from "../components/organisms/EventDetail/EventDetail";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ id: "1" }),
  };
});

vi.mock("react-router", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ id: "1" }),
  };
});

const {
  mockEventsGetById,
  mockTicketsGetByEvent,
  mockUnregister,
  mockCreateIntent,
} = vi.hoisted(() => ({
  mockEventsGetById: vi.fn(),
  mockTicketsGetByEvent: vi.fn(),
  mockUnregister: vi.fn(),
  mockCreateIntent: vi.fn(),
}));

vi.mock("../services/eventsApi", () => ({
  eventsApi: { getById: mockEventsGetById },
}));

vi.mock("../services/ticketsApi", () => ({
  ticketsApi: {
    getByEvent: mockTicketsGetByEvent,
    unregister: mockUnregister,
  },
}));

vi.mock("../services/paymentsApi", () => ({
  paymentsApi: { createIntent: mockCreateIntent },
}));

const mockUser = { id: "user-123", name: "Jennifer" };
const mockEvent = {
  id: "1",
  title: "Hackathon Madrid",
  description: "Descripción larga del hackathon",
  authorId: "99",
  date: "2030-12-01",
  time: "10:00",
  maxAttendees: 100,
  price: 0,
  category: "PRESENCIAL",
  location: { address: "Calle Principal 1", city: "Madrid", country: "España" },
};

const renderComponent = (user = null) =>
  render(
    <MemoryRouter>
      <AuthContext.Provider value={{ user, login: vi.fn(), logout: vi.fn() }}>
        <EventDetail />
      </AuthContext.Provider>
    </MemoryRouter>
  );

describe("EventDetail - Cobertura Máxima", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(global, "setInterval").mockImplementation(() => 999);
    vi.spyOn(global, "clearInterval").mockImplementation(() => {});
    mockTicketsGetByEvent.mockResolvedValue({
      data: { content: [], totalElements: 0 },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("carga y muestra el título del evento", async () => {
    mockEventsGetById.mockResolvedValue({ data: mockEvent });
    renderComponent();
    expect(await screen.findByText("Hackathon Madrid")).toBeInTheDocument();
  });

  it("muestra la descripción del evento", async () => {
    mockEventsGetById.mockResolvedValue({ data: mockEvent });
    renderComponent();
    expect(
      await screen.findByText("Descripción larga del hackathon")
    ).toBeInTheDocument();
  });

  it("muestra spinner de carga inicial", () => {
    mockEventsGetById.mockReturnValue(new Promise(() => {}));
    renderComponent();
    expect(screen.getByText("Cargando evento...")).toBeInTheDocument();
  });

  it("muestra 'Evento no encontrado' cuando getById falla", async () => {
    mockEventsGetById.mockRejectedValue(new Error("not found"));
    renderComponent();
    expect(await screen.findByText("Evento no encontrado.")).toBeInTheDocument();
  });

  it("formatea y muestra correctamente la ubicación presencial", async () => {
    mockEventsGetById.mockResolvedValue({ data: mockEvent });
    renderComponent();
    await screen.findByText("Hackathon Madrid");
    expect(
      screen.getByText(/Calle Principal 1, Madrid, España/)
    ).toBeInTheDocument();
  });

  it("no muestra la ubicación si el evento es ONLINE", async () => {
    mockEventsGetById.mockResolvedValue({
      data: { ...mockEvent, category: "ONLINE", location: null },
    });
    renderComponent();
    await screen.findByText("Hackathon Madrid");
    expect(screen.queryByText(/Ubicación:/i)).not.toBeInTheDocument();
  });

  it("muestra 'Inicia sesión' cuando no hay usuario autenticado", async () => {
    mockEventsGetById.mockResolvedValue({ data: mockEvent });
    renderComponent(null);
    await screen.findByText("Hackathon Madrid");
    expect(screen.getByText("Inicia sesión")).toBeInTheDocument();
  });

  it("muestra 'Eres el organizador' cuando el usuario es el autor", async () => {
    mockEventsGetById.mockResolvedValue({
      data: { ...mockEvent, authorId: "user-123" },
    });
    renderComponent(mockUser);
    expect(
      await screen.findByText("Eres el organizador de este evento")
    ).toBeInTheDocument();
  });

  it("muestra el botón 'Asistir al evento' cuando el usuario no es el autor ni está apuntado", async () => {
    mockEventsGetById.mockResolvedValue({ data: mockEvent });
    renderComponent(mockUser);
    expect(
      await screen.findByRole("button", { name: /Asistir al evento/i })
    ).toBeInTheDocument();
  });

  it("muestra '✓ Estás apuntado' cuando el usuario tiene ticket válido", async () => {
    mockEventsGetById.mockResolvedValue({ data: mockEvent });
    mockTicketsGetByEvent.mockResolvedValue({
      data: {
        content: [{ id: 1, userId: "user-123", paymentStatus: "FREE" }],
        totalElements: 1,
      },
    });
    renderComponent(mockUser);
    expect(await screen.findByText("✓ Estás apuntado")).toBeInTheDocument();
  });

  it("muestra 'Evento Completo' cuando todas las plazas están ocupadas", async () => {
    mockEventsGetById.mockResolvedValue({
      data: { ...mockEvent, maxAttendees: 1 },
    });
    mockTicketsGetByEvent.mockResolvedValue({
      data: {
        content: [{ id: 5, userId: "otro", paymentStatus: "COMPLETED" }],
        totalElements: 1,
      },
    });
    renderComponent(mockUser);
    expect(await screen.findByText("Evento Completo")).toBeInTheDocument();
  });

  it("muestra badge 'Este evento ya ha finalizado' para eventos pasados", async () => {
    mockEventsGetById.mockResolvedValue({
      data: { ...mockEvent, date: "2020-01-01", time: "10:00:00" },
    });
    renderComponent(mockUser);
    expect(
      await screen.findByText("Este evento ya ha finalizado")
    ).toBeInTheDocument();
  });

  it("navega a /home/community al hacer click en 'Volver'", async () => {
    mockEventsGetById.mockResolvedValue({ data: mockEvent });
    renderComponent();
    await screen.findByText("Hackathon Madrid");
    fireEvent.click(screen.getByText("Volver"));
    expect(mockNavigate).toHaveBeenCalledWith("/home/community");
  });

  it("muestra el modal de confirmación al hacer click en 'Asistir' (evento gratuito)", async () => {
    mockEventsGetById.mockResolvedValue({ data: { ...mockEvent, price: 0 } });
    renderComponent(mockUser);
    const btn = await screen.findByRole("button", { name: /Asistir al evento/i });
    fireEvent.click(btn);
    expect(
      await screen.findByRole("button", { name: /Confirmar Asistencia/i })
    ).toBeInTheDocument();
  });

  it("llama a createIntent al confirmar asistencia a evento gratuito", async () => {
    mockEventsGetById.mockResolvedValue({ data: { ...mockEvent, price: 0 } });
    mockCreateIntent.mockResolvedValue({
      data: { ticketId: "tk-1", qrUrl: "https://qr.png", verificationCode: "V-123" },
    });
    renderComponent(mockUser);
    const asistirBtn = await screen.findByRole("button", {
      name: /Asistir al evento/i,
    });
    fireEvent.click(asistirBtn);
    const confirmBtn = await screen.findByRole("button", {
      name: /Confirmar Asistencia/i,
    });
    fireEvent.click(confirmBtn);
    await waitFor(() => {
      expect(mockCreateIntent).toHaveBeenCalledWith({
        userId: "user-123",
        eventId: "1",
      });
    });
  });

  it("muestra el ticket modal tras registrarse en evento gratuito", async () => {
    mockEventsGetById.mockResolvedValue({ data: { ...mockEvent, price: 0 } });
    mockCreateIntent.mockResolvedValue({
      data: {
        ticketId: "tk-1",
        qrUrl: "https://qr.png",
        verificationCode: "V-123",
      },
    });
    renderComponent(mockUser);
    fireEvent.click(
      await screen.findByRole("button", { name: /Asistir al evento/i })
    );
    fireEvent.click(
      await screen.findByRole("button", { name: /Confirmar Asistencia/i })
    );
    await waitFor(() => {
      expect(screen.getByText("¡Entrada Confirmada!")).toBeInTheDocument();
    });
  });

  it("navega a checkout si el evento es de pago", async () => {
    mockEventsGetById.mockResolvedValue({
      data: { ...mockEvent, price: 50 },
    });
    mockCreateIntent.mockResolvedValue({
      data: { clientSecret: "secret_abc", amount: 50 },
    });
    renderComponent(mockUser);
    fireEvent.click(
      await screen.findByRole("button", { name: /Asistir al evento/i })
    );
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(
        expect.stringContaining("/checkout/1"),
        expect.any(Object)
      );
    });
  });

  it("muestra el modal y cancela la asistencia correctamente", async () => {
    mockEventsGetById.mockResolvedValue({ data: mockEvent });
    mockTicketsGetByEvent.mockResolvedValue({
      data: {
        content: [{ id: 1, userId: "user-123", paymentStatus: "FREE" }],
        totalElements: 1,
      },
    });
    mockUnregister.mockResolvedValue({});
    renderComponent(mockUser);
    const cancelBtn = await screen.findByRole("button", {
      name: /Cancelar asistencia/i,
    });
    fireEvent.click(cancelBtn);
    const confirmBtn = await screen.findByRole("button", {
      name: /Confirmar Cancelación/i,
    });
    fireEvent.click(confirmBtn);
    await waitFor(() => {
      expect(mockUnregister).toHaveBeenCalledWith("1");
    });
  });

  it("muestra toast de éxito tras cancelar asistencia", async () => {
    mockEventsGetById.mockResolvedValue({ data: mockEvent });
    mockTicketsGetByEvent.mockResolvedValue({
      data: {
        content: [{ id: 1, userId: "user-123", paymentStatus: "FREE" }],
        totalElements: 1,
      },
    });
    mockUnregister.mockResolvedValue({});
    renderComponent(mockUser);
    fireEvent.click(
      await screen.findByRole("button", { name: /Cancelar asistencia/i })
    );
    fireEvent.click(
      await screen.findByRole("button", { name: /Confirmar Cancelación/i })
    );
    await waitFor(() => {
      expect(screen.getByText("Asistencia cancelada.")).toBeInTheDocument();
    });
  });

  it("arranca el polling al montar el componente", async () => {
    mockEventsGetById.mockResolvedValue({ data: mockEvent });
    renderComponent();
    await screen.findByText("Hackathon Madrid");
    expect(global.setInterval).toHaveBeenCalled();
  });

  it("registra el listener de 'focus' para reiniciar el polling", async () => {
    const addEventListenerSpy = vi.spyOn(window, "addEventListener");
    mockEventsGetById.mockResolvedValue({ data: mockEvent });
    renderComponent();
    await screen.findByText("Hackathon Madrid");
    expect(addEventListenerSpy).toHaveBeenCalledWith(
      "focus",
      expect.any(Function)
    );
  });

  it("elimina el listener de 'focus' al desmontar", async () => {
    const removeEventListenerSpy = vi.spyOn(window, "removeEventListener");
    mockEventsGetById.mockResolvedValue({ data: mockEvent });
    const { unmount } = renderComponent();
    await screen.findByText("Hackathon Madrid");
    unmount();
    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      "focus",
      expect.any(Function)
    );
  });
});

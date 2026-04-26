import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { AuthContext } from "../context/auth/AuthContext";
import MyTickets from "../components/organisms/Mytickets/MyTickets";

window.scrollTo = vi.fn();

const { mockTicketsGetByUser, mockEventsGetById } = vi.hoisted(() => ({
  mockTicketsGetByUser: vi.fn(),
  mockEventsGetById: vi.fn(),
}));

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, useNavigate: () => mockNavigate };
});
vi.mock("react-router", async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock("../services/ticketsApi", () => ({
  ticketsApi: { getByUser: mockTicketsGetByUser },
}));

vi.mock("../services/eventsApi", () => ({
  eventsApi: { getById: mockEventsGetById },
}));

const mockUser = { id: 1, name: "Jennifer" };

const makeTicket = (overrides = {}) => ({
  id: 1,
  eventId: 10,
  eventTitle: "HackMadrid",
  verificationCode: "CC-001",
  qrUrl: "https://qr.png",
  paymentStatus: "FREE",
  ...overrides,
});

const wrapWithAuth = (user = mockUser) =>
  render(
    <MemoryRouter>
      <AuthContext.Provider
        value={{ user, login: vi.fn(), logout: vi.fn(), updateUser: vi.fn() }}
      >
        <MyTickets />
      </AuthContext.Provider>
    </MemoryRouter>,
  );

describe("MyTickets — cobertura 100%", () => {
  beforeEach(() => vi.clearAllMocks());

  it("muestra el spinner de carga inicial", () => {
    mockTicketsGetByUser.mockReturnValue(new Promise(() => {}));
    wrapWithAuth();
    expect(screen.getByText("Cargando tus entradas...")).toBeInTheDocument();
  });

  it("NO llama a la API cuando user es null (user?.id undefined)", () => {
    wrapWithAuth(null);
    expect(mockTicketsGetByUser).not.toHaveBeenCalled();
  });

  it("renderiza las tarjetas de tickets cuando la respuesta tiene .content", async () => {
    mockTicketsGetByUser.mockResolvedValue({
      data: {
        content: [
          makeTicket(),
          makeTicket({
            id: 2,
            eventTitle: "React Summit",
            paymentStatus: "COMPLETED",
          }),
        ],
        totalElements: 2,
      },
    });
    wrapWithAuth();
    await waitFor(() => {
      expect(screen.getByText("HackMadrid")).toBeInTheDocument();
      expect(screen.getByText("React Summit")).toBeInTheDocument();
    });
  });

  it("funciona cuando la respuesta es un array directo (sin .content)", async () => {
    mockTicketsGetByUser.mockResolvedValue({
      data: [makeTicket()],
    });
    wrapWithAuth();
    await waitFor(() => {
      expect(screen.getByText("HackMadrid")).toBeInTheDocument();
    });
  });

  it("muestra 'Invitación' para FREE y 'Entrada' para COMPLETED", async () => {
    mockTicketsGetByUser.mockResolvedValue({
      data: {
        content: [
          makeTicket({ paymentStatus: "FREE" }),
          makeTicket({
            id: 2,
            eventTitle: "React Summit",
            paymentStatus: "COMPLETED",
          }),
        ],
        totalElements: 2,
      },
    });
    wrapWithAuth();
    await waitFor(() => {
      expect(screen.getByText("Invitación")).toBeInTheDocument();
      expect(screen.getByText("Entrada")).toBeInTheDocument();
    });
  });

  it("filtra y no muestra tickets con status PENDING", async () => {
    mockTicketsGetByUser.mockResolvedValue({
      data: {
        content: [
          makeTicket({
            id: 3,
            eventTitle: "Pendiente",
            paymentStatus: "PENDING",
          }),
        ],
        totalElements: 1,
      },
    });
    wrapWithAuth();
    await waitFor(() => {
      expect(screen.queryByText("Pendiente")).not.toBeInTheDocument();
      expect(screen.getByText("Aún no tienes entradas.")).toBeInTheDocument();
    });
  });

  it("muestra estado vacío y botón 'Explorar Eventos' cuando no hay tickets", async () => {
    mockTicketsGetByUser.mockResolvedValue({
      data: { content: [], totalElements: 0 },
    });
    wrapWithAuth();
    await waitFor(() => {
      expect(screen.getByText("Aún no tienes entradas.")).toBeInTheDocument();
      expect(screen.getByText("Explorar Eventos")).toBeInTheDocument();
    });
  });

  it("navega a /home/community al click en 'Explorar Eventos'", async () => {
    mockTicketsGetByUser.mockResolvedValue({
      data: { content: [], totalElements: 0 },
    });
    wrapWithAuth();
    await waitFor(() => fireEvent.click(screen.getByText("Explorar Eventos")));
    expect(mockNavigate).toHaveBeenCalledWith("/home/community");
  });

  it("muestra mensaje de error cuando la API falla", async () => {
    mockTicketsGetByUser.mockRejectedValue(new Error("fail"));
    wrapWithAuth();
    await waitFor(() => {
      expect(
        screen.getByText("No se pudieron cargar tus entradas."),
      ).toBeInTheDocument();
    });
  });

  it("muestra el título 'Mis Entradas' y el subtítulo", async () => {
    mockTicketsGetByUser.mockResolvedValue({
      data: { content: [], totalElements: 0 },
    });

    wrapWithAuth();
    expect(await screen.findByText("Mis Entradas")).toBeInTheDocument();
    expect(
      screen.getByText("Gestiona tus accesos de forma rápida"),
    ).toBeInTheDocument();
  });

  it("muestra los dots de paginación cuando hay más de 1 página", async () => {
    const tickets = Array.from({ length: 16 }, (_, i) =>
      makeTicket({
        id: i + 1,
        eventTitle: `Evento ${i + 1}`,
        paymentStatus: "FREE",
      }),
    );
    mockTicketsGetByUser.mockResolvedValue({
      data: { content: tickets, totalElements: 16 },
    });
    wrapWithAuth();
    await waitFor(() => {
      expect(screen.getByLabelText("Página 1")).toBeInTheDocument();
      expect(screen.getByLabelText("Página 2")).toBeInTheDocument();
    });
  });

  it("NO muestra paginación cuando totalPages es 1", async () => {
    mockTicketsGetByUser.mockResolvedValue({
      data: { content: [makeTicket()], totalElements: 1 },
    });
    wrapWithAuth();
    await waitFor(() => screen.getByText("HackMadrid"));
    expect(screen.queryByLabelText("Página 1")).not.toBeInTheDocument();
  });

  it("llama a la API con la página correcta al hacer click en un dot de paginación", async () => {
    const tickets = Array.from({ length: 16 }, (_, i) =>
      makeTicket({
        id: i + 1,
        eventTitle: `Evento ${i + 1}`,
        paymentStatus: "FREE",
      }),
    );
    mockTicketsGetByUser
      .mockResolvedValueOnce({ data: { content: tickets, totalElements: 16 } })
      .mockResolvedValueOnce({ data: { content: [], totalElements: 16 } });

    wrapWithAuth();
    await waitFor(() => screen.getByLabelText("Página 2"));
    fireEvent.click(screen.getByLabelText("Página 2"));
    await waitFor(() => {
      expect(mockTicketsGetByUser).toHaveBeenCalledWith(mockUser.id, 1, 15);
    });
  });

  it("llama a window.scrollTo al cargar tickets", async () => {
    mockTicketsGetByUser.mockResolvedValue({
      data: { content: [makeTicket()], totalElements: 1 },
    });
    wrapWithAuth();
    await waitFor(() => screen.getByText("HackMadrid"));
    expect(window.scrollTo).toHaveBeenCalledWith({
      top: 0,
      behavior: "smooth",
    });
  });

  it("usa data.length como totalElements cuando no viene en la respuesta", async () => {
    const tickets = Array.from({ length: 16 }, (_, i) =>
      makeTicket({
        id: i + 1,
        eventTitle: `Ev ${i + 1}`,
        paymentStatus: "FREE",
      }),
    );
    mockTicketsGetByUser.mockResolvedValue({
      data: tickets,
    });
    wrapWithAuth();
    await waitFor(() => {
      expect(screen.getByLabelText("Página 1")).toBeInTheDocument();
    });
  });

  it("abre el TicketModal con la fecha del evento al hacer click en 'Ver Ticket'", async () => {
    mockTicketsGetByUser.mockResolvedValue({
      data: { content: [makeTicket()], totalElements: 1 },
    });
    mockEventsGetById.mockResolvedValue({
      data: { id: 10, title: "HackMadrid", date: "2030-06-15", time: "10:00" },
    });

    wrapWithAuth();
    await waitFor(() => screen.getByText("Ver Ticket"));

    fireEvent.click(screen.getByText("Ver Ticket"));

    await waitFor(() => {
      expect(screen.getByText("¡Entrada Confirmada!")).toBeInTheDocument();
    });
  });

  it("también abre el modal al hacer click en el QR (área de preview)", async () => {
    mockTicketsGetByUser.mockResolvedValue({
      data: { content: [makeTicket()], totalElements: 1 },
    });
    mockEventsGetById.mockResolvedValue({
      data: { id: 10, title: "HackMadrid", date: "2030-06-15", time: "10:00" },
    });

    wrapWithAuth();
    await waitFor(() => screen.getByAltText("QR"));

    fireEvent.click(screen.getByText("Ampliar QR"));

    await waitFor(() => {
      expect(screen.getByText("¡Entrada Confirmada!")).toBeInTheDocument();
    });
  });

  it("abre el modal con 'Consultar en el evento' cuando getById falla", async () => {
    mockTicketsGetByUser.mockResolvedValue({
      data: { content: [makeTicket()], totalElements: 1 },
    });
    mockEventsGetById.mockRejectedValue(new Error("Network error"));

    wrapWithAuth();
    await waitFor(() => screen.getByText("Ver Ticket"));
    fireEvent.click(screen.getByText("Ver Ticket"));
    await waitFor(() => {
      expect(screen.getByText("Consultar en el evento")).toBeInTheDocument();
    });
  });

  it("cierra el TicketModal al hacer click en 'Cerrar'", async () => {
    mockTicketsGetByUser.mockResolvedValue({
      data: { content: [makeTicket()], totalElements: 1 },
    });
    mockEventsGetById.mockResolvedValue({
      data: { id: 10, title: "HackMadrid", date: "2030-06-15", time: "10:00" },
    });

    wrapWithAuth();
    await waitFor(() => screen.getByText("Ver Ticket"));
    fireEvent.click(screen.getByText("Ver Ticket"));
    await waitFor(() => screen.getByText("¡Entrada Confirmada!"));
    fireEvent.click(screen.getByText("Cerrar"));
    await waitFor(() => {
      expect(
        screen.queryByText("¡Entrada Confirmada!"),
      ).not.toBeInTheDocument();
    });
  });

  it("navega a la página del evento al hacer click en 'Info Evento'", async () => {
    mockTicketsGetByUser.mockResolvedValue({
      data: { content: [makeTicket({ eventId: 10 })], totalElements: 1 },
    });
    wrapWithAuth();
    await waitFor(() => screen.getByText("Info Evento"));
    fireEvent.click(screen.getByText("Info Evento"));
    expect(mockNavigate).toHaveBeenCalledWith("/home/info/10");
  });

  it("muestra el código de verificación del ticket", async () => {
    mockTicketsGetByUser.mockResolvedValue({
      data: {
        content: [makeTicket({ verificationCode: "CC-XYZ-999" })],
        totalElements: 1,
      },
    });
    wrapWithAuth();
    await waitFor(() => {
      expect(screen.getByText("Ref: CC-XYZ-999")).toBeInTheDocument();
    });
  });

  it("muestra 'Cargando...' cuando verificationCode es null", async () => {
    mockTicketsGetByUser.mockResolvedValue({
      data: {
        content: [makeTicket({ verificationCode: null })],
        totalElements: 1,
      },
    });
    wrapWithAuth();
    await waitFor(() => {
      expect(screen.getByText("Ref: Cargando...")).toBeInTheDocument();
    });
  });
});

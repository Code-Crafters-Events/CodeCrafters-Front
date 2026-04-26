import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { AuthContext } from "../context/auth/AuthContext";
import CommunityPanel from "../components/organisms/CommunityPanel/CommunityPanel";

window.scrollTo = vi.fn();
const {
  mockEventsSearch,
} = vi.hoisted(() => ({
  mockEventsSearch: vi.fn(),
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

vi.mock("../services/eventsApi", () => ({
  eventsApi: {
    search: mockEventsSearch,
  },
}));

vi.mock("../services/authApi", () => ({
  authApi: { register: mockAuthRegister, login: mockAuthLogin },
}));
vi.mock("../services/imagesApi", () => ({
  imagesApi: { uploadProfileImage: mockImagesUploadProfile },
}));
vi.mock("../services/locationsApi", () => ({
  locationsApi: { create: vi.fn() },
}));

const mockUser = { id: 1, name: "Jennifer" };

const wrapWithAuth = (ui, user = mockUser) =>
  render(
    <MemoryRouter>
      <AuthContext.Provider
        value={{ user, login: vi.fn(), logout: vi.fn(), updateUser: vi.fn() }}
      >
        {ui}
      </AuthContext.Provider>
    </MemoryRouter>,
  );

describe("CommunityPanel", () => {
  beforeEach(() => vi.clearAllMocks());

  const mockEvents = [
    {
      id: 1,
      title: "Hackathon BCN",
      type: "HACKATHON",
      category: "PRESENCIAL",
      date: "2030-01-01",
      time: "10:00",
      price: 0,
      maxAttendees: 50,
    },
    {
      id: 2,
      title: "React Summit",
      type: "MASTERCLASS",
      category: "ONLINE",
      date: "2030-02-01",
      time: "11:00",
      price: 20,
      maxAttendees: 100,
    },
  ];

  it("muestra estado de carga inicial", () => {
    mockEventsSearch.mockReturnValue(new Promise(() => {}));
    wrapWithAuth(<CommunityPanel />);
    expect(screen.getByText("Cargando eventos...")).toBeInTheDocument();
  });

  it("renderiza las cards de eventos tras la carga", async () => {
    mockEventsSearch.mockResolvedValue({
      data: { content: mockEvents, totalPages: 1 },
    });
    wrapWithAuth(<CommunityPanel />);
    await waitFor(() => {
      expect(screen.getByText("Hackathon BCN")).toBeInTheDocument();
      expect(screen.getByText("React Summit")).toBeInTheDocument();
    });
  });

  it("muestra mensaje cuando no hay eventos", async () => {
    mockEventsSearch.mockResolvedValue({
      data: { content: [], totalPages: 1 },
    });
    wrapWithAuth(<CommunityPanel />);
    await waitFor(() => {
      expect(
        screen.getByText("No hay eventos disponibles."),
      ).toBeInTheDocument();
    });
  });

  it("muestra error cuando la API falla", async () => {
    mockEventsSearch.mockRejectedValue(new Error("fail"));
    wrapWithAuth(<CommunityPanel />);
    await waitFor(() => {
      expect(
        screen.getByText("No se pudieron cargar los eventos."),
      ).toBeInTheDocument();
    });
  });

  it("muestra el botón FILTRAR", async () => {
    mockEventsSearch.mockResolvedValue({
      data: { content: [], totalPages: 1 },
    });
    wrapWithAuth(<CommunityPanel />);
    expect(screen.getByText("FILTRAR")).toBeInTheDocument();
  });

  it("abre el FilterPanel al hacer click en FILTRAR", async () => {
    mockEventsSearch.mockResolvedValue({
      data: { content: [], totalPages: 1 },
    });
    wrapWithAuth(<CommunityPanel />);
    fireEvent.click(screen.getByText("FILTRAR"));
    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });
  });

  it("muestra 'Próximos Eventos en Comunidad' por defecto", async () => {
    mockEventsSearch.mockResolvedValue({
      data: { content: [], totalPages: 1 },
    });
    wrapWithAuth(<CommunityPanel />);
    expect(
      screen.getByText("Próximos Eventos en Comunidad"),
    ).toBeInTheDocument();
  });

  it("muestra paginación cuando hay más de 1 página", async () => {
    mockEventsSearch.mockResolvedValue({
      data: { content: mockEvents, totalPages: 3 },
    });
    wrapWithAuth(<CommunityPanel />);
    await waitFor(() => {
      expect(screen.getByLabelText("Página 1")).toBeInTheDocument();
      expect(screen.getByLabelText("Página 2")).toBeInTheDocument();
      expect(screen.getByLabelText("Página 3")).toBeInTheDocument();
    });
  });

  it("NO muestra botón 'Limpiar filtros' sin filtros activos", async () => {
    mockEventsSearch.mockResolvedValue({
      data: { content: [], totalPages: 1 },
    });
    wrapWithAuth(<CommunityPanel />);
    await waitFor(() => {
      expect(screen.queryByText(/Limpiar filtros/)).not.toBeInTheDocument();
    });
  });
});

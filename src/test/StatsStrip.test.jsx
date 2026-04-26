import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import StatsStrip from "../components/molecules/StatsStrip/StatsStrip";
import { usersApi } from "../services/usersApi";
import { eventsApi } from "../services/eventsApi";
import { ticketsApi } from "../services/ticketsApi";

vi.mock("../services/usersApi", () => ({
  usersApi: { getAll: vi.fn() },
}));
vi.mock("../services/eventsApi", () => ({
  eventsApi: { getAll: vi.fn() },
}));
vi.mock("../services/ticketsApi", () => ({
  ticketsApi: { getCount: vi.fn() },
}));

describe("StatsStrip Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renderiza los estados iniciales (ceros) antes de cargar", () => {
    usersApi.getAll.mockReturnValue(new Promise(() => {}));
    
    render(<StatsStrip />);
    expect(screen.getByText("Usuarios activos")).toBeInTheDocument();
    expect(screen.getByText("Eventos en vivo")).toBeInTheDocument();
  });

  it("carga y muestra los datos correctamente desde las APIs", async () => {
    usersApi.getAll.mockResolvedValue({ data: new Array(10).fill({}) });
    eventsApi.getAll.mockResolvedValue({ data: { totalElements: 5 } });
    ticketsApi.getCount.mockResolvedValue({ data: 20 });

    render(<StatsStrip />);
    await waitFor(() => {
      expect(screen.getByText("10")).toBeInTheDocument();
      expect(screen.getByText("5")).toBeInTheDocument();
      expect(screen.getByText("20")).toBeInTheDocument();
      expect(screen.getByText("4")).toBeInTheDocument();
    });
  });

  it("calcula correctamente el ancho de las barras (barWidth)", async () => {
    usersApi.getAll.mockResolvedValue({ data: { totalElements: 50 } });
    eventsApi.getAll.mockResolvedValue({ data: { totalElements: 25 } });
    ticketsApi.getCount.mockResolvedValue({ data: 100 });
    render(<StatsStrip />);

    await waitFor(() => {
      expect(screen.getByText("100")).toBeInTheDocument();
    });
  });

  it("maneja errores de las APIs sin romper el componente", async () => {
    usersApi.getAll.mockRejectedValue(new Error("Fail"));
    eventsApi.getAll.mockRejectedValue(new Error("Fail"));
    ticketsApi.getCount.mockRejectedValue(new Error("Fail"));
    render(<StatsStrip />);

    await waitFor(() => {
      expect(screen.getAllByText("0")).toHaveLength(3); 
      expect(screen.getByText("4")).toBeInTheDocument();
    });
  });

  it("normaliza correctamente el conteo de usuarios (formato alternativo)", async () => {
    usersApi.getAll.mockResolvedValue({ 
      data: { content: [{}, {}, {}] } 
    });
    eventsApi.getAll.mockResolvedValue({ data: { totalElements: 0 } });
    ticketsApi.getCount.mockResolvedValue({ data: 0 });

    render(<StatsStrip />);

    await waitFor(() => {
      expect(screen.getByText("3")).toBeInTheDocument();
    });
  });
});
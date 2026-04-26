import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import Ticker from "../components/molecules/Ticker/Ticker";
import { eventsApi } from "../services/eventsApi";

vi.mock("../services/eventsApi", () => ({
  eventsApi: {
    getAll: vi.fn(),
  },
}));

describe("Ticker Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renderiza los datos de FALLBACK inicialmente", () => {
    eventsApi.getAll.mockReturnValue(new Promise(() => {}));
    render(<Ticker />);
    expect(screen.getAllByText("eventos tech en vivo")[0]).toBeInTheDocument();
    expect(screen.getAllByText("comunidad femcoders")[0]).toBeInTheDocument();
  });

  it("actualiza los items cuando la API devuelve eventos", async () => {
    const mockEvents = [{ title: "React Conf 2026" }, { title: "AI Workshop" }];
    eventsApi.getAll.mockResolvedValue({
      data: { content: mockEvents },
    });

    render(<Ticker />);
    await waitFor(() => {
      expect(screen.getAllByText("React Conf 2026")[0]).toBeInTheDocument();
    });
    expect(screen.queryByText("eventos tech en vivo")).not.toBeInTheDocument();
  });

  it("duplica los elementos para el efecto de scroll infinito", async () => {
    const mockEvents = [{ title: "Evento Único" }];
    eventsApi.getAll.mockResolvedValue({ data: mockEvents });
    render(<Ticker />);
    await waitFor(() => {
      const items = screen.getAllByText("Evento Único");
      expect(items).toHaveLength(2);
    });
  });

  it("mantiene el FALLBACK si la API falla o devuelve un array vacío", async () => {
    eventsApi.getAll.mockRejectedValue(new Error("Network Error"));
    render(<Ticker />);
    await waitFor(() => {
      expect(
        screen.getAllByText("eventos tech en vivo")[0],
      ).toBeInTheDocument();
    });
  });

  it("tiene los atributos de accesibilidad correctos", () => {
    eventsApi.getAll.mockResolvedValue({ data: [] });
    render(<Ticker />);
    expect(
      screen.getByRole("region", { name: /novedades/i }),
    ).toBeInTheDocument();
    const track = screen.getByLabelText(/novedades/i).firstChild;
    expect(track).toHaveAttribute("aria-hidden", "true");
  });
});

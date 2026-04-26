import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import EventsSection from "../components/organisms/EventsSection/EventsSection";
import { eventsApi } from "../services/eventsApi";

const wrap = (ui) => render(<MemoryRouter>{ui}</MemoryRouter>);

vi.mock("../services/eventsApi", () => ({
  eventsApi: { getAll: vi.fn() },
}));

describe("EventsSection", () => {
  beforeEach(() => vi.clearAllMocks());

  it("no renderiza nada cuando la API no devuelve eventos", async () => {
    eventsApi.getAll.mockResolvedValue({ data: { content: [] } });
    const { container } = wrap(<EventsSection />);
    await waitFor(() => {
      expect(
        container.querySelector("[aria-label='Próximos eventos']"),
      ).toBeNull();
    });
  });

  it("renderiza las cards cuando hay eventos", async () => {
    eventsApi.getAll.mockResolvedValue({
      data: {
        content: [
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
        ],
      },
    });
    wrap(<EventsSection />);
    await waitFor(() => {
      expect(screen.getByText("Hackathon BCN")).toBeInTheDocument();
    });
  });

  it("maneja error de API sin romper el render (devuelve array vacío)", async () => {
    eventsApi.getAll.mockRejectedValue(new Error("Network error"));
    const { container } = wrap(<EventsSection />);
    await waitFor(() => {
      expect(
        container.querySelector("[aria-label='Próximos eventos']"),
      ).toBeNull();
    });
  });

  it("llama a eventsApi.getAll con page=0 y size=3", async () => {
    eventsApi.getAll.mockResolvedValue({ data: [] });
    wrap(<EventsSection />);
    await waitFor(() => {
      expect(eventsApi.getAll).toHaveBeenCalledWith(0, 3);
    });
  });
});

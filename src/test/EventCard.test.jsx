import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { BrowserRouter } from "react-router-dom";
import EventCard from "../components/molecules/EventCard/EventCard";

const mockedNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockedNavigate };
});

describe("EventCard Component", () => {
  const mockEvent = {
    id: "123",
    title: "Taller de Java",
    date: "2025-10-20",
    time: "20:00:00",
    authorAlias: "Ragnarok1",
    type: "Presencial",
    category: "Taller",
    price: 15,
    maxAttendees: 100,
    attendeesCount: 50,
    imageUrl: "http://localhost:5173/image.jpg",
    location: { venue: "Fira plaza España" },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderCard = (event = mockEvent) => {
    return render(
      <BrowserRouter>
        <EventCard event={event} />
      </BrowserRouter>,
    );
  };

  it("renderiza la información básica del evento", () => {
    renderCard();
    expect(screen.getByText("Taller de Java")).toBeInTheDocument();
    expect(screen.getByText("@Ragnarok1")).toBeInTheDocument();
    expect(screen.getByText("Fira plaza España")).toBeInTheDocument();
    expect(screen.getByText(/20 OCT 2025/i)).toBeInTheDocument();
  });

  it("navega a los detalles al hacer click en la tarjeta", () => {
    renderCard();
    const card = screen.getByRole("button");
    fireEvent.click(card);
    expect(mockedNavigate).toHaveBeenCalledWith("/home/info/123");
  });

  it("muestra el badge de 'Evento Lleno' cuando se alcanza el máximo de asistentes", () => {
    const fullEvent = { ...mockEvent, maxAttendees: 50, attendeesCount: 50 };
    renderCard(fullEvent);
    expect(screen.getByAltText("Evento Lleno")).toBeInTheDocument();
  });

  it("no muestra la ubicación si el evento es Online", () => {
    const onlineEvent = {
      ...mockEvent,
      type: "Online",
      location: { venue: "Zoom" },
    };
    renderCard(onlineEvent);
    expect(screen.queryByText("Zoom")).not.toBeInTheDocument();
  });

  it("formatea correctamente el autor cuando no tiene alias (authorName en minúsculas)", () => {
    const noAliasEvent = {
      ...mockEvent,
      authorAlias: null,
      authorName: "JENNIFER",
    };
    renderCard(noAliasEvent);
    expect(screen.getByText("@jennifer")).toBeInTheDocument();
  });

  it("reemplaza correctamente el puerto de localhost en la URL de la imagen", () => {
    renderCard();
    const img = screen.getByAltText("Taller de Java");
    expect(img.src).toContain("http://localhost:8080");
  });

  it("no muestra las plazas disponibles si el evento ya ha pasado", () => {
    const pastEvent = { ...mockEvent, date: "2020-01-01" };
    renderCard(pastEvent);
    expect(screen.queryByText(/Plazas:/i)).not.toBeInTheDocument();
  });

  it("aplica estilos de borde específicos según el tipo/categoría", () => {
    const { rerender } = renderCard(mockEvent);
    const onlineEvent = { ...mockEvent, type: "Online" };
    render(
      <BrowserRouter>
        <EventCard event={onlineEvent} />
      </BrowserRouter>,
    );
  });

  it("navega al presionar la tecla Enter", () => {
    renderCard();
    const card = screen.getByRole("button");
    fireEvent.keyDown(card, { key: "Enter", code: "Enter" });
    expect(mockedNavigate).toHaveBeenCalledWith("/home/info/123");
  });

  it("NO navega al presionar otras teclas", () => {
    renderCard();
    const card = screen.getByRole("button");
    fireEvent.keyDown(card, { key: "a", code: "KeyA" });
    expect(mockedNavigate).not.toHaveBeenCalled();
  });

  it("aplica estilos grises por defecto para tipos desconocidos", () => {
    const unknownEvent = { ...mockEvent, type: "otro", category: "varios" };
    renderCard(unknownEvent);
    const tag = screen.getByText("varios");
    expect(tag).toBeInTheDocument();
  });

  it("muestra '@usuario' si no hay alias ni nombre de autor", () => {
    const ghostEvent = { ...mockEvent, authorAlias: null, authorName: null };
    renderCard(ghostEvent);
    expect(screen.getByText("@usuario")).toBeInTheDocument();
  });

  it("maneja correctamente la ausencia de fecha y tiempo", () => {
    const noDateEvent = { ...mockEvent, date: null, time: null };
    renderCard(noDateEvent);
    expect(screen.queryByText(/GMT\+2/i)).not.toBeInTheDocument();
  });

  it("muestra la dirección si no hay nombre del recinto (venue)", () => {
    const addressEvent = {
      ...mockEvent,
      type: "Presencial",
      location: { venue: null, address: "Calle Falsa 123" },
    };
    renderCard(addressEvent);
    expect(screen.getByText("Calle Falsa 123")).toBeInTheDocument();
  });

  it("aplica colores correctos según la categoría online o presencial", () => {
    const { rerender } = renderCard({ ...mockEvent, type: "online" });
    const onlineTag = screen.getByText(mockEvent.category);
    expect(onlineTag).toHaveStyle({
      color: "rgb(0, 255, 157)",
      "border-color": "rgb(0, 255, 157)",
    });
    rerender(
      <BrowserRouter>
        <EventCard event={{ ...mockEvent, type: "presencial" }} />
      </BrowserRouter>,
    );

    const presencialTag = screen.getByText(mockEvent.category);
    expect(presencialTag).toHaveStyle({
      color: "rgb(255, 184, 0)",
      "border-color": "rgb(255, 184, 0)",
    });
  });

  it("aplica estilos grises cuando el tipo no es online ni presencial", () => {
    const unknownEvent = {
      ...mockEvent,
      type: "otro",
      category: "clase",
    };
    renderCard(unknownEvent);

    const tag = screen.getByText("clase");
    expect(tag).toHaveStyle({
      color: "rgb(160, 160, 160)",
      "border-color": "rgb(160, 160, 160)",
    });
  });
});

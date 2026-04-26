import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router";
import EventFormModal from "../components/molecules/EventFormModal/EventFormModal";
import { AuthContext } from "../context/auth/AuthContext";
import { eventsApi } from "../services/eventsApi";
import { locationsApi } from "../services/locationsApi";
import { imagesApi } from "../services/imagesApi";

vi.mock("../services/eventsApi", () => ({
  eventsApi: { create: vi.fn(), update: vi.fn() },
}));

vi.mock("../services/locationsApi", () => ({
  locationsApi: { create: vi.fn() },
}));

vi.mock("../services/imagesApi", () => ({
  imagesApi: { uploadEventImage: vi.fn() },
}));

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, useNavigate: () => mockNavigate };
});

global.URL.createObjectURL = vi.fn(() => "blob:mock-url");
global.URL.revokeObjectURL = vi.fn();

describe("EventFormModal Component", () => {
  const mockUser = { id: "user-123", name: "Jennifer" };
  const mockOnClose = vi.fn();
  const mockOnSaved = vi.fn();

  const renderModal = (props = {}) => {
    return render(
      <MemoryRouter>
        <AuthContext.Provider value={{ user: mockUser }}>
          <EventFormModal
            isOpen={true}
            onClose={mockOnClose}
            onSaved={mockOnSaved}
            {...props}
          />
        </AuthContext.Provider>
      </MemoryRouter>,
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("no renderiza nada si isOpen es false", () => {
    renderModal({ isOpen: false });
    expect(
      screen.queryByText(/Información de evento/i),
    ).not.toBeInTheDocument();
  });

  it("cambia los campos de localización según la modalidad (ONLINE vs PRESENCIAL)", () => {
    renderModal();
    fireEvent.click(screen.getByLabelText("ONLINE"));
    expect(screen.getByText("Enlace (URL)")).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText("PRESENCIAL"));
    expect(screen.getByText("Ciudad")).toBeInTheDocument();
    expect(screen.getByText("País")).toBeInTheDocument();
  });

  it("cierra el modal al hacer clic en el overlay", () => {
    renderModal();
    const overlay = screen
      .getByRole("heading", { name: /información de evento/i })
      .closest("div").parentElement;
    fireEvent.click(overlay);
    expect(mockOnClose).toHaveBeenCalled();
  });

  it("muestra errores de validación front-end si los campos están vacíos", async () => {
    renderModal();
    fireEvent.click(screen.getByText("Guardar"));
    expect(
      await screen.findByText("El título es obligatorio"),
    ).toBeInTheDocument();
    expect(screen.getByText("Selecciona una categoría")).toBeInTheDocument();
    expect(screen.getByText("Selecciona una modalidad")).toBeInTheDocument();
  });

  it("valida errores específicos de formato (URL, precio negativo, descripción corta/larga)", async () => {
    renderModal();
    fireEvent.click(screen.getByLabelText("ONLINE"));
    fireEvent.change(screen.getByLabelText("Enlace (URL)"), {
      target: { name: "location", value: "ftp://servidor" },
    });
    fireEvent.change(screen.getByPlaceholderText(/0=Gratis/), {
      target: { name: "price", value: "-10" },
    });
    fireEvent.change(screen.getByPlaceholderText("Describe el evento..."), {
      target: { name: "description", value: "Corta" },
    });
    fireEvent.click(screen.getByText("Guardar"));
    expect(
      await screen.findByText("La URL debe empezar por http:// o https://"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("El precio no puede ser negativo"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Descripción demasiado corta (mín. 10 carac.)"),
    ).toBeInTheDocument();
  });

  it("maneja la selección y limpieza de memoria de imágenes (revokeObjectURL)", async () => {
    renderModal();
    const file = new File(["test"], "test.png", { type: "image/png" });
    const input = document.querySelector('input[type="file"]');
    fireEvent.change(input, { target: { files: [file] } });
    expect(global.URL.createObjectURL).toHaveBeenCalled();
    const removeBtn = await screen.findByRole("button", { name: /eliminar/i });
    fireEvent.click(removeBtn);
    await waitFor(() => {
      expect(global.URL.revokeObjectURL).toHaveBeenCalled();
    });
  });

  it("carga y mapea correctamente los datos en modo edición", () => {
    const existingEvent = {
      id: "evt-1",
      title: "Evento Original",
      description: "Descripción para editar",
      type: "TALLER",
      category: "ONLINE",
      date: "2026-01-01",
      time: "10:00",
      maxAttendees: 50,
      price: 0,
      location: {
        address: "https://zoom.us/test",
        city: "Online",
        country: "Online",
      },
      imageUrl: "http://res.cloudinary.com/test.jpg",
    };
    renderModal({ event: existingEvent });
    expect(screen.getByText("Editar evento")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Evento Original")).toBeInTheDocument();
    expect(screen.getByLabelText("TALLER")).toBeChecked();
    expect(screen.getByLabelText("ONLINE")).toBeChecked();
  });

  it("flujo completo de creación exitosa", async () => {
    locationsApi.create.mockResolvedValue({ data: { id: "loc-1" } });
    eventsApi.create.mockResolvedValue({
      data: { id: "event-1", title: "Nuevo Evento" },
    });
    renderModal();
    fireEvent.change(screen.getByPlaceholderText(/título del evento/i), {
      target: { name: "title", value: "Masterclass Pro" },
    });
    fireEvent.change(screen.getByPlaceholderText(/Describe el evento/i), {
      target: {
        name: "description",
        value: "Una descripción válida de prueba",
      },
    });
    fireEvent.change(screen.getByLabelText(/Fecha/), {
      target: { name: "date", value: "2026-06-20" },
    });
    fireEvent.change(screen.getByLabelText(/Hora/), {
      target: { name: "time", value: "17:00" },
    });
    fireEvent.change(screen.getByPlaceholderText(/Ejemplo: 50/), {
      target: { name: "maxAttendees", value: "100" },
    });
    fireEvent.change(screen.getByPlaceholderText(/0=Gratis/), {
      target: { name: "price", value: "0" },
    });
    fireEvent.click(screen.getByLabelText("MASTERCLASS"));
    fireEvent.click(screen.getByLabelText("ONLINE"));
    fireEvent.change(screen.getByLabelText(/Enlace/), {
      target: { name: "location", value: "https://zoom.us/j/1" },
    });
    fireEvent.click(screen.getByText("Guardar"));
    await waitFor(() => {
      expect(locationsApi.create).toHaveBeenCalled();
      expect(eventsApi.create).toHaveBeenCalled();
      expect(mockOnSaved).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it("muestra errores devueltos por el servidor (400 y 500)", async () => {
    eventsApi.create.mockRejectedValueOnce({
      response: { status: 400, data: { title: "El título ya está en uso" } },
    });
    renderModal();
    fireEvent.change(screen.getByPlaceholderText(/título del evento/i), {
      target: { name: "title", value: "Duplicado" },
    });
    fireEvent.change(screen.getByPlaceholderText(/Describe el evento/i), {
      target: {
        name: "description",
        value: "Descripción suficientemente larga",
      },
    });
    fireEvent.change(screen.getByLabelText(/Fecha/), {
      target: { name: "date", value: "2026-06-20" },
    });
    fireEvent.change(screen.getByLabelText(/Hora/), {
      target: { name: "time", value: "17:00" },
    });
    fireEvent.click(screen.getByLabelText("HACKATHON"));
    fireEvent.click(screen.getByLabelText("ONLINE"));
    fireEvent.change(screen.getByLabelText(/Enlace/), {
      target: { name: "location", value: "https://hack.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(/Ejemplo: 50/), {
      target: { name: "maxAttendees", value: "10" },
    });
    fireEvent.change(screen.getByPlaceholderText(/0=Gratis/), {
      target: { name: "price", value: "0" },
    });
    fireEvent.click(screen.getByText("Guardar"));
    expect(
      await screen.findByText("El título ya está en uso"),
    ).toBeInTheDocument();
    eventsApi.create.mockRejectedValueOnce({ response: { status: 500 } });
    fireEvent.click(screen.getByText("Guardar"));
    expect(
      await screen.findByText(/Error del servidor \(500\)/i),
    ).toBeInTheDocument();
  });
});

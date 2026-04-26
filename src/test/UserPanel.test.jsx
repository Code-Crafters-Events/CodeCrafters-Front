import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { AuthContext } from "../context/auth/AuthContext";
import UserPanel from "../components/organisms/UserPanel/UserPanel";

const { mockEventsGetByUser, mockEventsDelete } = vi.hoisted(() => ({
  mockEventsGetByUser: vi.fn(),
  mockEventsDelete: vi.fn(),
}));

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, useNavigate: () => mockNavigate };
});
vi.mock("../services/eventsApi", () => ({
  eventsApi: { getByUser: mockEventsGetByUser, delete: mockEventsDelete },
}));

vi.mock("../components/atoms/Button/Button", () => ({
  default: ({ text, onClick, type, disabled }) => (
    <button type={type ?? "button"} onClick={onClick} disabled={disabled}>
      {text}
    </button>
  ),
}));

const eventFormModalProps = {};
vi.mock("../components/molecules/EventFormModal/EventFormModal", () => ({
  default: (props) => {
    Object.assign(eventFormModalProps, props);
    if (!props.isOpen) return null;
    return (
      <div data-testid="event-form-modal">
        <span>Información de evento</span>
        <button
          data-testid="modal-save-new"
          onClick={() =>
            props.onSaved(
              {
                id: 99,
                title: "Nuevo Evento",
                date: "2030-01-01",
                time: "10:00",
              },
              false,
            )
          }
        >
          Guardar nuevo
        </button>
        <button
          data-testid="modal-save-edit"
          onClick={() =>
            props.onSaved({ ...props.event, title: "Editado" }, true)
          }
        >
          Guardar edición
        </button>
        <button data-testid="modal-close" onClick={props.onClose}>
          Cerrar modal
        </button>
      </div>
    );
  },
}));

vi.mock("../components/organisms/MessageModal/MessageModal", () => ({
  default: ({ message, onConfirm, onClose, btnText, isLoading }) => (
    <div data-testid="message-modal">
      <span>{message}</span>
      <button
        data-testid="confirm-delete"
        onClick={onConfirm}
        disabled={isLoading}
      >
        {btnText}
      </button>
      <button data-testid="cancel-delete" onClick={onClose}>
        Cancelar
      </button>
    </div>
  ),
}));

vi.mock("../components/atoms/Toast/Toast", () => ({
  default: ({ message, onClose }) => (
    <div data-testid="toast">
      <span>{message}</span>
      <button data-testid="toast-close" onClick={onClose}>
        X
      </button>
    </div>
  ),
}));

vi.mock("../components/atoms/Tab/Tab", () => ({
  default: ({ text, count, isActive, onClick }) => (
    <button
      data-testid={`tab-${text}`}
      data-active={isActive}
      onClick={onClick}
    >
      {text} ({count})
    </button>
  ),
}));

vi.mock("../components/molecules/EventRow/EventRow", () => ({
  default: ({ event, onEdit, onDelete }) => (
    <div data-testid={`event-row-${event.id}`}>
      <span>{event.title}</span>
      <button title="Editar" onClick={() => onEdit(event)}>
        Editar
      </button>
      <button title="Borrar" onClick={() => onDelete(event.id)}>
        Borrar
      </button>
    </div>
  ),
}));

const mockUser = { id: 1, name: "Jennifer" };
const futureEvent = {
  id: 1,
  title: "Evento Futuro",
  type: "HACKATHON",
  date: "2030-06-01",
  time: "10:00",
};
const pastEvent = {
  id: 2,
  title: "Evento Pasado",
  type: "MASTERCLASS",
  date: "2020-01-01",
  time: "10:00",
};
const wrap = (user = mockUser) =>
  render(
    <MemoryRouter>
      <AuthContext.Provider
        value={{ user, login: vi.fn(), logout: vi.fn(), updateUser: vi.fn() }}
      >
        <UserPanel />
      </AuthContext.Provider>
    </MemoryRouter>,
  );

describe("UserPanel — Cobertura completa", () => {
  beforeEach(() => vi.clearAllMocks());

  it("muestra el título del panel", () => {
    mockEventsGetByUser.mockResolvedValue({ data: { content: [] } });
    wrap();
    expect(
      screen.getByText("Panel de control de mis eventos"),
    ).toBeInTheDocument();
  });

  it("muestra las tabs 'Eventos Activos' e 'Historial'", async () => {
    mockEventsGetByUser.mockResolvedValue({ data: { content: [] } });
    wrap();
    expect(screen.getByText(/Eventos Activos/)).toBeInTheDocument();
    expect(screen.getByText(/Historial/)).toBeInTheDocument();
  });

  it("muestra el botón 'Crear evento'", async () => {
    mockEventsGetByUser.mockResolvedValue({ data: { content: [] } });
    wrap();
    expect(screen.getByText("Crear evento")).toBeInTheDocument();
  });

  it("muestra 'Cargando eventos...' mientras carga", () => {
    mockEventsGetByUser.mockReturnValue(new Promise(() => {}));
    wrap();
    expect(screen.getByText("Cargando eventos...")).toBeInTheDocument();
  });

  it("muestra los eventos futuros en la tab activa", async () => {
    mockEventsGetByUser.mockResolvedValue({
      data: { content: [futureEvent, pastEvent] },
    });
    wrap();
    await waitFor(() =>
      expect(screen.getByText("Evento Futuro")).toBeInTheDocument(),
    );
    expect(screen.queryByText("Evento Pasado")).not.toBeInTheDocument();
  });

  it("acepta data como array plano (sin .content)", async () => {
    mockEventsGetByUser.mockResolvedValue({ data: [futureEvent] });
    wrap();
    await waitFor(() =>
      expect(screen.getByText("Evento Futuro")).toBeInTheDocument(),
    );
  });

  it("muestra lista vacía cuando loadEvents falla", async () => {
    mockEventsGetByUser.mockRejectedValue(new Error("network error"));
    wrap();
    await waitFor(() =>
      expect(
        screen.getByText("No tienes eventos activos próximamente."),
      ).toBeInTheDocument(),
    );
  });

  it("no llama a eventsApi.getByUser cuando user es null", () => {
    wrap(null);
    expect(mockEventsGetByUser).not.toHaveBeenCalled();
  });

  it("no llama a eventsApi.getByUser cuando user no tiene id", () => {
    wrap({ name: "sin id" });
    expect(mockEventsGetByUser).not.toHaveBeenCalled();
  });

  it("muestra 'No tienes eventos activos próximamente.' cuando la lista activa está vacía", async () => {
    mockEventsGetByUser.mockResolvedValue({ data: { content: [] } });
    wrap();
    await waitFor(() =>
      expect(
        screen.getByText("No tienes eventos activos próximamente."),
      ).toBeInTheDocument(),
    );
  });

  it("muestra 'Tu historial está vacío.' cuando la tab historial está vacía", async () => {
    mockEventsGetByUser.mockResolvedValue({ data: { content: [futureEvent] } });
    wrap();
    await waitFor(() => screen.getByText("Evento Futuro"));
    fireEvent.click(screen.getByTestId("tab-Historial"));
    await waitFor(() =>
      expect(screen.getByText("Tu historial está vacío.")).toBeInTheDocument(),
    );
  });

  it("muestra los eventos pasados al cambiar a la tab Historial", async () => {
    mockEventsGetByUser.mockResolvedValue({
      data: { content: [futureEvent, pastEvent] },
    });
    wrap();
    await waitFor(() => screen.getByText("Evento Futuro"));
    fireEvent.click(screen.getByTestId("tab-Historial"));
    await waitFor(() =>
      expect(screen.getByText("Evento Pasado")).toBeInTheDocument(),
    );
  });

  it("resetea la página a 1 al cambiar de tab (useEffect activeTab)", async () => {
    const manyEvents = Array.from({ length: 16 }, (_, i) => ({
      id: i + 10,
      title: `Evento ${i + 10}`,
      date: "2030-06-01",
      time: "10:00",
    }));
    mockEventsGetByUser.mockResolvedValue({
      data: { content: [...manyEvents, pastEvent] },
    });
    wrap();
    await waitFor(() => screen.getByText("Siguiente"));
    fireEvent.click(screen.getByText("Siguiente"));
    await waitFor(() => screen.getByText("Página 2 de 2"));
    fireEvent.click(screen.getByTestId("tab-Historial"));
    await waitFor(() =>
      expect(screen.getByText("Evento Pasado")).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByTestId("tab-Eventos Activos"));
    await waitFor(() =>
      expect(screen.queryByText("Página 2 de 2")).not.toBeInTheDocument(),
    );
  });

  it("muestra paginación cuando hay más de 15 eventos", async () => {
    const manyEvents = Array.from({ length: 16 }, (_, i) => ({
      id: i + 10,
      title: `Evento ${i + 10}`,
      date: "2030-06-01",
      time: "10:00",
    }));
    mockEventsGetByUser.mockResolvedValue({ data: { content: manyEvents } });
    wrap();
    await waitFor(() => screen.getByText("Siguiente"));
    expect(screen.getByText("Página 1 de 2")).toBeInTheDocument();
  });

  it("navega a la página siguiente con el botón 'Siguiente'", async () => {
    const manyEvents = Array.from({ length: 16 }, (_, i) => ({
      id: i + 10,
      title: `Evento ${i + 10}`,
      date: "2030-06-01",
      time: "10:00",
    }));
    mockEventsGetByUser.mockResolvedValue({ data: { content: manyEvents } });
    wrap();
    await waitFor(() => screen.getByText("Siguiente"));
    fireEvent.click(screen.getByText("Siguiente"));
    await waitFor(() =>
      expect(screen.getByText("Página 2 de 2")).toBeInTheDocument(),
    );
  });

  it("navega a la página anterior con el botón 'Anterior'", async () => {
    const manyEvents = Array.from({ length: 16 }, (_, i) => ({
      id: i + 10,
      title: `Evento ${i + 10}`,
      date: "2030-06-01",
      time: "10:00",
    }));
    mockEventsGetByUser.mockResolvedValue({ data: { content: manyEvents } });
    wrap();
    await waitFor(() => screen.getByText("Siguiente"));
    fireEvent.click(screen.getByText("Siguiente"));
    await waitFor(() => screen.getByText("Página 2 de 2"));
    fireEvent.click(screen.getByText("Anterior"));
    await waitFor(() =>
      expect(screen.getByText("Página 1 de 2")).toBeInTheDocument(),
    );
  });

  it("deshabilita el botón 'Anterior' en la primera página", async () => {
    const manyEvents = Array.from({ length: 16 }, (_, i) => ({
      id: i + 10,
      title: `Evento ${i + 10}`,
      date: "2030-06-01",
      time: "10:00",
    }));
    mockEventsGetByUser.mockResolvedValue({ data: { content: manyEvents } });
    wrap();
    await waitFor(() => screen.getByText("Anterior"));
    expect(screen.getByText("Anterior")).toBeDisabled();
  });

  it("deshabilita el botón 'Siguiente' en la última página", async () => {
    const manyEvents = Array.from({ length: 16 }, (_, i) => ({
      id: i + 10,
      title: `Evento ${i + 10}`,
      date: "2030-06-01",
      time: "10:00",
    }));
    mockEventsGetByUser.mockResolvedValue({ data: { content: manyEvents } });
    wrap();
    await waitFor(() => screen.getByText("Siguiente"));
    fireEvent.click(screen.getByText("Siguiente"));
    await waitFor(() => screen.getByText("Página 2 de 2"));
    expect(screen.getByText("Siguiente")).toBeDisabled();
  });

  it("abre el modal de creación al hacer click en 'Crear evento'", async () => {
    mockEventsGetByUser.mockResolvedValue({ data: { content: [] } });
    wrap();
    await waitFor(() =>
      screen.getByText("No tienes eventos activos próximamente."),
    );
    fireEvent.click(screen.getByText("Crear evento"));
    await waitFor(() =>
      expect(screen.getByText("Información de evento")).toBeInTheDocument(),
    );
  });

  it("cierra el modal al hacer click en 'Cerrar modal'", async () => {
    mockEventsGetByUser.mockResolvedValue({ data: { content: [] } });
    wrap();
    fireEvent.click(screen.getByText("Crear evento"));
    await waitFor(() => screen.getByTestId("event-form-modal"));
    fireEvent.click(screen.getByTestId("modal-close"));
    await waitFor(() =>
      expect(screen.queryByTestId("event-form-modal")).not.toBeInTheDocument(),
    );
  });

  it("abre el modal de edición al hacer click en 'Editar'", async () => {
    mockEventsGetByUser.mockResolvedValue({ data: { content: [futureEvent] } });
    wrap();
    await waitFor(() => screen.getByText("Evento Futuro"));
    fireEvent.click(screen.getByTitle("Editar"));
    await waitFor(() =>
      expect(screen.getByTestId("event-form-modal")).toBeInTheDocument(),
    );
  });

  it("añade el nuevo evento a la lista y muestra toast al guardar desde creación", async () => {
    mockEventsGetByUser.mockResolvedValue({ data: { content: [] } });
    wrap();
    await waitFor(() =>
      screen.getByText("No tienes eventos activos próximamente."),
    );
    fireEvent.click(screen.getByText("Crear evento"));
    await waitFor(() => screen.getByTestId("modal-save-new"));
    fireEvent.click(screen.getByTestId("modal-save-new"));
    await waitFor(() => {
      expect(screen.getByText("Nuevo Evento")).toBeInTheDocument();
      expect(screen.getByText("Creado correctamente.")).toBeInTheDocument();
    });
  });

  it("resetea a tab activa y página 1 al guardar evento nuevo", async () => {
    mockEventsGetByUser.mockResolvedValue({ data: { content: [pastEvent] } });
    wrap();
    await waitFor(() =>
      expect(screen.getByTestId("tab-Historial")).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByTestId("tab-Historial"));
    await waitFor(() =>
      expect(screen.getByText("Evento Pasado")).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByText("Crear evento"));
    await waitFor(() => screen.getByTestId("modal-save-new"));
    fireEvent.click(screen.getByTestId("modal-save-new"));
    await waitFor(() => {
      expect(screen.getByText("Nuevo Evento")).toBeInTheDocument();
      expect(screen.queryByText("Evento Pasado")).not.toBeInTheDocument();
    });
  });

  it("actualiza el evento en la lista y muestra toast al guardar edición", async () => {
    mockEventsGetByUser.mockResolvedValue({ data: { content: [futureEvent] } });
    wrap();
    await waitFor(() => screen.getByText("Evento Futuro"));
    fireEvent.click(screen.getByTitle("Editar"));
    await waitFor(() => screen.getByTestId("modal-save-edit"));
    fireEvent.click(screen.getByTestId("modal-save-edit"));
    await waitFor(() => {
      expect(screen.getByText("Editado")).toBeInTheDocument();
      expect(
        screen.getByText("Actualizado correctamente."),
      ).toBeInTheDocument();
    });
    expect(screen.queryByText("Evento Futuro")).not.toBeInTheDocument();
  });

  it("cierra el toast al hacer click en X", async () => {
    mockEventsGetByUser.mockResolvedValue({ data: { content: [] } });
    wrap();
    fireEvent.click(screen.getByText("Crear evento"));
    await waitFor(() => screen.getByTestId("modal-save-new"));
    fireEvent.click(screen.getByTestId("modal-save-new"));
    await waitFor(() => screen.getByTestId("toast"));
    fireEvent.click(screen.getByTestId("toast-close"));
    await waitFor(() =>
      expect(screen.queryByTestId("toast")).not.toBeInTheDocument(),
    );
  });

  it("abre el modal de confirmación al hacer click en 'Borrar'", async () => {
    mockEventsGetByUser.mockResolvedValue({ data: { content: [futureEvent] } });
    wrap();
    await waitFor(() => screen.getByTitle("Borrar"));
    fireEvent.click(screen.getByTitle("Borrar"));
    await waitFor(() =>
      expect(
        screen.getByText("¿Estás segur@ de eliminar este evento?"),
      ).toBeInTheDocument(),
    );
  });

  it("cierra el modal de eliminación al cancelar", async () => {
    mockEventsGetByUser.mockResolvedValue({ data: { content: [futureEvent] } });
    wrap();
    await waitFor(() => screen.getByTitle("Borrar"));
    fireEvent.click(screen.getByTitle("Borrar"));
    await waitFor(() => screen.getByTestId("cancel-delete"));
    fireEvent.click(screen.getByTestId("cancel-delete"));
    await waitFor(() =>
      expect(screen.queryByTestId("message-modal")).not.toBeInTheDocument(),
    );
  });

  it("llama a eventsApi.delete y elimina el evento al confirmar", async () => {
    mockEventsGetByUser.mockResolvedValue({ data: { content: [futureEvent] } });
    mockEventsDelete.mockResolvedValue({});
    wrap();
    await waitFor(() => screen.getByTitle("Borrar"));
    fireEvent.click(screen.getByTitle("Borrar"));
    await waitFor(() => screen.getByTestId("confirm-delete"));
    fireEvent.click(screen.getByTestId("confirm-delete"));
    await waitFor(() => {
      expect(mockEventsDelete).toHaveBeenCalledWith(1, mockUser.id);
      expect(screen.queryByText("Evento Futuro")).not.toBeInTheDocument();
      expect(screen.getByText("Evento eliminado.")).toBeInTheDocument();
    });
  });

  it("muestra toast de error cuando falla la eliminación", async () => {
    mockEventsGetByUser.mockResolvedValue({ data: { content: [futureEvent] } });
    mockEventsDelete.mockRejectedValue(new Error("server error"));
    wrap();
    await waitFor(() => screen.getByTitle("Borrar"));
    fireEvent.click(screen.getByTitle("Borrar"));
    await waitFor(() => screen.getByTestId("confirm-delete"));
    fireEvent.click(screen.getByTestId("confirm-delete"));
    await waitFor(() =>
      expect(screen.getByText("Error al eliminar.")).toBeInTheDocument(),
    );
  });

  it("deshabilita el botón de confirmar mientras está eliminando", async () => {
    let resolveDelete;
    mockEventsGetByUser.mockResolvedValue({ data: { content: [futureEvent] } });
    mockEventsDelete.mockReturnValue(
      new Promise((res) => {
        resolveDelete = res;
      }),
    );
    wrap();
    await waitFor(() => screen.getByTitle("Borrar"));
    fireEvent.click(screen.getByTitle("Borrar"));
    await waitFor(() => screen.getByTestId("confirm-delete"));
    fireEvent.click(screen.getByTestId("confirm-delete"));
    await waitFor(() =>
      expect(screen.getByTestId("confirm-delete")).toBeDisabled(),
    );
    resolveDelete({});
  });
});

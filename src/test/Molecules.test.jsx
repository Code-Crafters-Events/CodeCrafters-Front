import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import AttendeesList from "../components/molecules/AttendeesList/AttendeesList";
import FormField from "../components/molecules/FormField/FormField";
import EventRow from "../components/molecules/EventRow/EventRow";

const makeTickets = (n) =>
  Array.from({ length: n }, (_, i) => ({
    id: i + 1,
    userName: `user${i + 1}`,
    userProfileImage: null,
  }));

describe("AttendeesList", () => {
  it("muestra el número total de asistentes", () => {
    render(<AttendeesList tickets={makeTickets(3)} totalCount={3} />);
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("renderiza hasta 5 avatares visibles", () => {
    render(<AttendeesList tickets={makeTickets(5)} totalCount={5} />);
    for (let i = 1; i <= 5; i++) {
      expect(screen.getByLabelText(`user${i}`)).toBeInTheDocument();
    }
  });

  it("muestra solo 5 avatares aunque haya más en tickets", () => {
    render(<AttendeesList tickets={makeTickets(10)} totalCount={10} />);
    expect(screen.getByLabelText("user5")).toBeInTheDocument();
    expect(screen.queryByLabelText("user6")).not.toBeInTheDocument();
  });

  it("NO muestra botón 'Ver asistentes' cuando totalCount <= 5", () => {
    render(<AttendeesList tickets={makeTickets(5)} totalCount={5} />);
    expect(screen.queryByText("Ver asistentes")).not.toBeInTheDocument();
  });

  it("muestra botón 'Ver asistentes' cuando totalCount > 5", () => {
    render(<AttendeesList tickets={makeTickets(6)} totalCount={6} />);
    expect(screen.getByText("Ver asistentes")).toBeInTheDocument();
  });

  it("abre el modal al hacer click en 'Ver asistentes'", () => {
    render(<AttendeesList tickets={makeTickets(6)} totalCount={6} />);
    fireEvent.click(screen.getByText("Ver asistentes"));
    expect(screen.getByLabelText("Lista de asistentes")).toBeInTheDocument();
  });

  it("cierra el modal al hacer click en el botón de cierre del modal", () => {
    render(<AttendeesList tickets={makeTickets(6)} totalCount={6} />);
    fireEvent.click(screen.getByText("Ver asistentes"));
    fireEvent.click(screen.getByLabelText("Cerrar"));
    expect(
      screen.queryByLabelText("Lista de asistentes"),
    ).not.toBeInTheDocument();
  });

  it("no renderiza botón de modal con tickets vacíos y totalCount=0", () => {
    render(<AttendeesList tickets={[]} totalCount={0} />);
    expect(screen.getByText("0")).toBeInTheDocument();
    expect(screen.queryByText("Ver asistentes")).not.toBeInTheDocument();
  });
});

describe("FormField", () => {
  it("renderiza la etiqueta", () => {
    render(
      <FormField label="Email" name="email" value="" onChange={() => {}} />,
    );
    expect(screen.getByText("Email")).toBeInTheDocument();
  });

  it("renderiza el input con el name correcto", () => {
    render(
      <FormField label="Email" name="email" value="" onChange={() => {}} />,
    );
    expect(screen.getByRole("textbox")).toHaveAttribute("name", "email");
  });

  it("renderiza el mensaje de error cuando se pasa", () => {
    render(
      <FormField
        label="Email"
        name="email"
        value=""
        onChange={() => {}}
        error="Email inválido"
      />,
    );
    expect(screen.getByText("Email inválido")).toBeInTheDocument();
  });

  it("renderiza cadena vacía en el div de error cuando no hay error", () => {
    const { container } = render(
      <FormField label="Email" name="email" value="" onChange={() => {}} />,
    );
    const errorDiv = container.querySelector("[class*='error']");
    expect(errorDiv?.textContent).toBe("");
  });

  it("llama onChange cuando el usuario escribe", () => {
    const onChange = vi.fn();
    render(
      <FormField label="Nombre" name="name" value="" onChange={onChange} />,
    );
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "Jennifer" },
    });
    expect(onChange).toHaveBeenCalled();
  });

  it("llama onBlur cuando el input pierde el foco", () => {
    const onBlur = vi.fn();
    render(
      <FormField
        label="Nombre"
        name="name"
        value=""
        onChange={() => {}}
        onBlur={onBlur}
      />,
    );
    fireEvent.blur(screen.getByRole("textbox"));
    expect(onBlur).toHaveBeenCalledTimes(1);
  });

  it("asocia correctamente label e input mediante htmlFor/id", () => {
    render(
      <FormField label="Ciudad" name="city" value="" onChange={() => {}} />,
    );
    const label = screen.getByText("Ciudad");
    const input = screen.getByRole("textbox");
    expect(label).toHaveAttribute("for", "city");
    expect(input).toHaveAttribute("id", "city");
  });
});

const mockEvent = {
  id: 1,
  title: "Evento de prueba",
  type: "HACKATHON",
  date: "2030-01-01",
  time: "10:00",
};

describe("EventRow", () => {
  it("renderiza el título del evento", () => {
    render(
      <EventRow event={mockEvent} onEdit={() => {}} onDelete={() => {}} />,
    );
    expect(screen.getByText("Evento de prueba")).toBeInTheDocument();
  });

  it("muestra botones de editar y borrar cuando isPast=false", () => {
    render(
      <EventRow event={mockEvent} onEdit={() => {}} onDelete={() => {}} />,
    );
    expect(screen.getByTitle("Editar")).toBeInTheDocument();
    expect(screen.getByTitle("Borrar")).toBeInTheDocument();
  });

  it("oculta los botones de acción cuando isPast=true", () => {
    render(
      <EventRow
        event={mockEvent}
        onEdit={() => {}}
        onDelete={() => {}}
        isPast
      />,
    );
    expect(screen.queryByTitle("Editar")).not.toBeInTheDocument();
    expect(screen.queryByTitle("Borrar")).not.toBeInTheDocument();
  });

  it("llama onEdit con el evento al hacer click en Editar", () => {
    const onEdit = vi.fn();
    render(<EventRow event={mockEvent} onEdit={onEdit} onDelete={() => {}} />);
    fireEvent.click(screen.getByTitle("Editar"));
    expect(onEdit).toHaveBeenCalledWith(mockEvent);
  });

  it("llama onDelete con el id al hacer click en Borrar", () => {
    const onDelete = vi.fn();
    render(
      <EventRow event={mockEvent} onEdit={() => {}} onDelete={onDelete} />,
    );
    fireEvent.click(screen.getByTitle("Borrar"));
    expect(onDelete).toHaveBeenCalledWith(1);
  });
});

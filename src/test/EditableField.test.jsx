import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import EditableField from "../components/atoms/EditableField/EditableField";
import React from "react";

describe("EditableField", () => {
  const defaultProps = {
    label: "Nombre",
    value: "Jennifer",
    onSave: vi.fn().mockResolvedValue(undefined),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("muestra el valor en modo vista", () => {
    render(<EditableField {...defaultProps} />);
    expect(screen.getByText("Jennifer")).toBeInTheDocument();
  });

  it('muestra "********" para campos de contraseña en modo vista', () => {
    render(<EditableField {...defaultProps} type="password" />);
    expect(screen.getByText("********")).toBeInTheDocument();
  });

  it("muestra placeholder cuando value está vacío", () => {
    render(
      <EditableField
        label="Alias"
        value=""
        onSave={vi.fn()}
        placeholder="Sin especificar"
      />,
    );
    expect(screen.getByText("Sin especificar")).toBeInTheDocument();
  });

  it("muestra el botón de editar en modo vista", () => {
    render(<EditableField {...defaultProps} />);
    expect(screen.getByLabelText("Editar Nombre")).toBeInTheDocument();
  });

  it("NO muestra botón de editar cuando readOnly=true", () => {
    render(<EditableField {...defaultProps} readOnly />);
    expect(screen.queryByLabelText("Editar Nombre")).not.toBeInTheDocument();
  });

  it("entra en modo edición al hacer click en el botón de editar", () => {
    render(<EditableField {...defaultProps} />);
    fireEvent.click(screen.getByLabelText("Editar Nombre"));
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("no entra en modo edición cuando readOnly=true", () => {
    render(<EditableField {...defaultProps} readOnly />);
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });

  it("cancela la edición con Escape y restaura el valor original", () => {
    render(<EditableField {...defaultProps} />);
    fireEvent.click(screen.getByLabelText("Editar Nombre"));
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "Cambio temporal" } });
    fireEvent.keyDown(input, { key: "Escape" });
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    expect(screen.getByText("Jennifer")).toBeInTheDocument();
  });

  it("guarda el valor con Enter si el valor ha cambiado", async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    render(<EditableField {...defaultProps} onSave={onSave} />);
    fireEvent.click(screen.getByLabelText("Editar Nombre"));
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "Nuevo nombre" } });
    fireEvent.keyDown(input, { key: "Enter" });
    await waitFor(() => expect(onSave).toHaveBeenCalledWith("Nuevo nombre"));
  });

  it("NO llama onSave si el valor no ha cambiado (Enter)", async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    render(<EditableField {...defaultProps} onSave={onSave} />);
    fireEvent.click(screen.getByLabelText("Editar Nombre"));
    const input = screen.getByRole("textbox");
    fireEvent.keyDown(input, { key: "Enter" });
    await waitFor(() => {
      expect(onSave).not.toHaveBeenCalled();
      expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    });
  });

  it("guarda al perder el foco (onBlur)", async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    render(<EditableField {...defaultProps} onSave={onSave} />);
    fireEvent.click(screen.getByLabelText("Editar Nombre"));
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "Blur test" } });
    fireEvent.blur(input);
    await waitFor(() => expect(onSave).toHaveBeenCalledWith("Blur test"));
  });

  it("restaura el valor original si onSave falla", async () => {
    const onSave = vi.fn().mockRejectedValue(new Error("save failed"));
    render(
      <EditableField {...defaultProps} value="Original" onSave={onSave} />,
    );
    fireEvent.click(screen.getByLabelText("Editar Nombre"));
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "Valor que falla" } });
    fireEvent.keyDown(input, { key: "Enter" });
    await waitFor(() => {
      expect(input.value).toBe("Original");
    });
  });

  it("muestra el botón de toggle de contraseña en modo edición", () => {
    render(<EditableField {...defaultProps} type="password" />);
    fireEvent.click(screen.getByLabelText("Editar Nombre"));
    expect(screen.getByLabelText("Mostrar contraseña")).toBeInTheDocument();
  });

  it("alterna la visibilidad de la contraseña al hacer click en el candado", async () => {
    render(<EditableField {...defaultProps} type="password" />);
    fireEvent.click(screen.getByLabelText("Editar Nombre"));
    const input = screen.getByDisplayValue("Jennifer");
    expect(input).toHaveAttribute("type", "password");
    fireEvent.click(screen.getByLabelText("Mostrar contraseña"));
    expect(input).toHaveAttribute("type", "text");
    expect(screen.getByLabelText("Ocultar contraseña")).toBeInTheDocument();
  });

  it('muestra "guardando..." durante el guardado asíncrono', async () => {
    let resolvePromise;
    const onSave = vi.fn(
      () =>
        new Promise((res) => {
          resolvePromise = res;
        }),
    );
    render(<EditableField {...defaultProps} onSave={onSave} />);
    fireEvent.click(screen.getByLabelText("Editar Nombre"));
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "nuevo" } });
    fireEvent.keyDown(input, { key: "Enter" });

    await waitFor(() =>
      expect(screen.getByText("guardando...")).toBeInTheDocument(),
    );

    await act(async () => {
      resolvePromise();
    });

    await waitFor(() =>
      expect(screen.queryByText("guardando...")).not.toBeInTheDocument(),
    );
  });

  it("actualiza el draft cuando cambia el prop value externamente", () => {
    const { rerender } = render(<EditableField {...defaultProps} value="A" />);
    expect(screen.getByText("A")).toBeInTheDocument();
    rerender(<EditableField {...defaultProps} value="B" onSave={vi.fn()} />);
    expect(screen.getByText("B")).toBeInTheDocument();
  });

  it("evita que el botón de password robe el foco al hacer clic", () => {
    render(<EditableField {...defaultProps} type="password" />);
    fireEvent.click(screen.getByLabelText("Editar Nombre"));
    const eyeBtn = screen.getByLabelText("Mostrar contraseña");
    const mouseDownEvent = fireEvent.mouseDown(eyeBtn);
    expect(mouseDownEvent).toBe(false);
  });

  it("enfoca el input automáticamente al empezar a editar", async () => {
    vi.useFakeTimers();
    render(<EditableField {...defaultProps} />);
    fireEvent.click(screen.getByLabelText("Editar Nombre"));

    act(() => {
      vi.runAllTimers();
    });

    const input = screen.getByRole("textbox");
    expect(document.activeElement).toBe(input);
    vi.useRealTimers();
  });

  it("no hace nada especial cuando se pulsan otras teclas", () => {
    render(<EditableField {...defaultProps} />);
    fireEvent.click(screen.getByLabelText("Editar Nombre"));
    const input = screen.getByRole("textbox");
    fireEvent.keyDown(input, { key: "Shift" });
    expect(input).toBeInTheDocument();
    expect(defaultProps.onSave).not.toHaveBeenCalled();
  });
});

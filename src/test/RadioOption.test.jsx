import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import RadioOption from "../components/atoms/RadioOption/RadioOption";

describe("RadioOption", () => {
  it("renderiza el label", () => {
    render(
      <RadioOption
        name="type"
        value="ONLINE"
        label="Online"
        checked={false}
        onChange={() => {}}
      />,
    );
    expect(screen.getByText("Online")).toBeInTheDocument();
  });

  it("está marcado cuando checked=true", () => {
    render(
      <RadioOption
        name="type"
        value="ONLINE"
        label="Online"
        checked={true}
        onChange={() => {}}
      />,
    );
    // FIX: Definir la constante 'radio' antes de usarla
    const radio = screen.getByRole("radio", { hidden: true });
    expect(radio).toBeChecked();
  });

  it("no está marcado cuando checked=false", () => {
    render(
      <RadioOption
        name="type"
        value="ONLINE"
        label="Online"
        checked={false}
        onChange={() => {}}
      />,
    );
    // FIX: Definir 'radio' y usar .not.toBeChecked()
    const radio = screen.getByRole("radio", { hidden: true });
    expect(radio).not.toBeChecked();
  });

  it("llama onChange cuando se selecciona", () => {
    const onChange = vi.fn();
    render(
      <RadioOption
        name="type"
        value="ONLINE"
        label="Online"
        checked={false}
        onChange={onChange}
      />,
    );
    // FIX: Añadir { hidden: true } aquí también
    fireEvent.click(screen.getByRole("radio", { hidden: true }));
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("asigna correctamente name y value al input", () => {
    render(
      <RadioOption
        name="category"
        value="PRESENCIAL"
        label="Presencial"
        checked={false}
        onChange={() => {}}
      />,
    );
    const radio = screen.getByRole("radio", { hidden: true });
    expect(radio).toHaveAttribute("name", "category");
    expect(radio).toHaveAttribute("value", "PRESENCIAL");
  });
});

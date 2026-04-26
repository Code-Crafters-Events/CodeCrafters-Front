import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

import Input from "../components/atoms/Input/Input";

describe("Input", () => {
  it("renderiza un input de tipo text por defecto", () => {
    render(<Input />);
    expect(screen.getByRole("textbox")).toHaveAttribute("type", "text");
  });

  it("aplica el tipo pasado como prop", () => {
    render(<Input type="email" />);
    expect(screen.getByRole("textbox")).toHaveAttribute("type", "email");
  });

  it("muestra el placeholder", () => {
    render(<Input placeholder="Escribe aquí" />);
    expect(screen.getByPlaceholderText("Escribe aquí")).toBeInTheDocument();
  });

  it("asigna el id correctamente", () => {
    render(<Input id="my-input" />);
    expect(document.getElementById("my-input")).toBeInTheDocument();
  });

  it("aplica className adicional", () => {
    render(<Input className="extra" />);
    expect(screen.getByRole("textbox").className).toContain("extra");
  });

  it("pasa props adicionales (disabled, maxLength…)", () => {
    render(<Input disabled maxLength={10} />);
    const input = screen.getByRole("textbox");
    expect(input).toBeDisabled();
    expect(input).toHaveAttribute("maxlength", "10");
  });
});
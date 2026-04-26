import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import Button from "../components/atoms/Button/Button";

const mockNavigate = vi.fn();
vi.mock("react-router", () => ({
  useNavigate: () => mockNavigate,
}));

const wrap = (ui) => render(<MemoryRouter>{ui}</MemoryRouter>);

describe("Button", () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it("renderiza el texto del botón", () => {
    wrap(<Button text="Guardar" />);
    expect(screen.getByRole("button", { name: "Guardar" })).toBeInTheDocument();
  });

  it("llama a onClick cuando se hace click y onClick está definido", () => {
    const onClick = vi.fn();
    wrap(<Button text="Click" onClick={onClick} />);
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("navega a path cuando no hay onClick pero sí hay path", () => {
    wrap(<Button text="Ir" path="/home/community" />);
    fireEvent.click(screen.getByRole("button"));
    expect(mockNavigate).toHaveBeenCalledWith("/home/community");
  });

  it("onClick tiene prioridad sobre path", () => {
    const onClick = vi.fn();
    wrap(<Button text="Ir" path="/home" onClick={onClick} />);
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('el type por defecto es "button"', () => {
    wrap(<Button text="btn" />);
    expect(screen.getByRole("button")).toHaveAttribute("type", "button");
  });

  it('acepta type="submit"', () => {
    wrap(<Button text="btn" type="submit" />);
    expect(screen.getByRole("button")).toHaveAttribute("type", "submit");
  });

  it("deshabilita el botón cuando disabled=true", () => {
    wrap(<Button text="btn" disabled />);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("no navega ni llama onClick si no están definidos", () => {
    wrap(<Button text="noop" />);
    expect(() => fireEvent.click(screen.getByRole("button"))).not.toThrow();
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});

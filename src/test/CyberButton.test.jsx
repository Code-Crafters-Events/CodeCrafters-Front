import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

import CyberButton from "../components/atoms/CyberButton/CyberButton";

describe("CyberButton", () => {
  it("renderiza el texto de los children", () => {
    render(<CyberButton>REGISTRARSE</CyberButton>);
    expect(screen.getByText("REGISTRARSE")).toBeInTheDocument();
  });

  it("aplica la variante 'primary' por defecto", () => {
    const { container } = render(<CyberButton>btn</CyberButton>);
    expect(container.firstChild.className).toContain("primary");
  });

  it("aplica la variante 'secondary' cuando se pasa", () => {
    const { container } = render(
      <CyberButton variant="secondary">btn</CyberButton>
    );
    expect(container.firstChild.className).toContain("secondary");
  });

  it("llama a onClick cuando se hace click", () => {
    const onClick = vi.fn();
    render(<CyberButton onClick={onClick}>btn</CyberButton>);
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("no lanza error si onClick no está definido", () => {
    render(<CyberButton>btn</CyberButton>);
    expect(() => fireEvent.click(screen.getByRole("button"))).not.toThrow();
  });
});
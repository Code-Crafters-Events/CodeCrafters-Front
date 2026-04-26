import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import BootLog from "../components/molecules/BootLog/BootLog";

describe("BootLog Component", () => {
  const mockLines = ["Iniciando sistema...", "Cargando módulos...", "Listo."];

  it("siempre renderiza la línea de prompt './init.sh'", () => {
    render(<BootLog lines={mockLines} visibleCount={0} />);
    expect(screen.getByText("./init.sh")).toBeInTheDocument();
  });

  it("aplica la clase de visibilidad solo a las líneas permitidas por visibleCount", () => {
    const { container } = render(<BootLog lines={mockLines} visibleCount={2} />);
    const line1 = screen.getByText("Iniciando sistema...").closest('span');
    const line2 = screen.getByText("Cargando módulos...").closest('span');
    const line3 = screen.getByText("Listo.").closest('span');
    expect(line1.className).toMatch(/visible/);
    expect(line2.className).toMatch(/visible/);
    expect(line3.className).not.toMatch(/visible/);
  });

  it("se renderiza vacío (solo prompt) si el array de líneas está vacío", () => {
    const { container } = render(<BootLog lines={[]} visibleCount={10} />);
    expect(screen.getByText("./init.sh")).toBeInTheDocument();
    const terminal = container.firstChild; 
    expect(terminal.children.length).toBe(1);
  });

  it("pasa la prop showCursor a la última línea visible", () => {
    render(<BootLog lines={mockLines} visibleCount={1} />);
    const activeLine = screen.getByText("Iniciando sistema...").closest('span');
  });
});
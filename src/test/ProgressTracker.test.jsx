import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import ProgressTracker from "../components/molecules/ProgressTracker/ProgressTracker";

describe("ProgressTracker Component", () => {
  it("renderiza correctamente con las props proporcionadas", () => {
    const testLabel = "Cargando perfil...";
    const testPct = 75;
    render(<ProgressTracker label={testLabel} pct={testPct} />);
    expect(screen.getByText(testLabel)).toBeInTheDocument();
    expect(screen.getByText(/75\s*%/)).toBeInTheDocument();
    const container = screen.getByText(/75\s*%/).closest("div").parentElement;
    const fill = container.querySelector('div[style*="width: 75%"]');
    expect(fill).toBeInTheDocument();
  });

  it("usa valores por defecto cuando no se pasan props", () => {
    render(<ProgressTracker />);
    expect(screen.getByText(/^0\s*%/)).toBeInTheDocument();
  });

  it("aplica la clase de estilo del contenedor", () => {
    const { container } = render(<ProgressTracker />);
    const wrapper = container.firstChild;
    expect(wrapper.className).toMatch(/wrapper/);
  });
});

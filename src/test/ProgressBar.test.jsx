import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

import ProgressBar from "../components/atoms/ProgressBar/ProgressBar";

describe("ProgressBar", () => {
  it("muestra el porcentaje en el label", () => {
    render(<ProgressBar pct={42} />);
    expect(screen.getByText("42%")).toBeInTheDocument();
  });

  it("muestra 0% por defecto", () => {
    render(<ProgressBar />);
    expect(screen.getByText("0%")).toBeInTheDocument();
  });

  it("aplica el width correcto al fill", () => {
    const { container } = render(<ProgressBar pct={75} />);
    const fill = container.querySelector("[class*='fill']");
    expect(fill).toHaveStyle({ width: "75%" });
  });

  it("muestra la etiqueta 'loading' y '100%'", () => {
    render(<ProgressBar pct={50} />);
    expect(screen.getByText("loading")).toBeInTheDocument();
    expect(screen.getByText("100%")).toBeInTheDocument();
  });
});
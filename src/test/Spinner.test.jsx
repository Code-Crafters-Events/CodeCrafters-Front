import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

import Spinner from "../components/atoms/Spinner/Spinner";

describe("Spinner", () => {
  it("muestra el porcentaje en el centro", () => {
    render(<Spinner pct={60} />);
    expect(screen.getByText("60%")).toBeInTheDocument();
  });

  it("muestra 0% por defecto", () => {
    render(<Spinner />);
    expect(screen.getByText("0%")).toBeInTheDocument();
  });

  it("renderiza los 3 anillos", () => {
    const { container } = render(<Spinner pct={50} />);
    expect(container.querySelectorAll("[class*='ring']").length).toBeGreaterThanOrEqual(3);
  });
});
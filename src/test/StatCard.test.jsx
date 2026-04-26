import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

import StatCard from "../components/atoms/StatCard/StatCard";

describe("StatCard", () => {
  it("muestra el número y el label", () => {
    render(
      <StatCard number="42" label="Usuarios activos" color="#00FF9D" barWidth="80%" />
    );
    expect(screen.getByText("42")).toBeInTheDocument();
    expect(screen.getByText("Usuarios activos")).toBeInTheDocument();
  });

  it("aplica el color al número", () => {
    render(
      <StatCard number="10" label="Eventos" color="#FF2D78" barWidth="50%" />
    );
    expect(screen.getByText("10")).toHaveStyle({ color: "#FF2D78" });
  });

  it("aplica el background y --w al barFill", () => {
    const { container } = render(
      <StatCard number="5" label="Tickets" color="#FFB800" barWidth="60%" />
    );
    const fill = container.querySelector("[class*='barFill']");
    expect(fill).toHaveStyle({ background: "#FFB800" });
  });
});

import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

import SectionLabel from "../components/atoms/SectionLabel/SectionLabel";

describe("SectionLabel", () => {
  it("renderiza el title", () => {
    render(<SectionLabel title="Próximos eventos" />);
    expect(screen.getByText("Próximos eventos")).toBeInTheDocument();
  });

  it("usa un h4 como contenedor", () => {
    const { container } = render(<SectionLabel title="Test" />);
    expect(container.querySelector("h4")).toBeInTheDocument();
  });
});
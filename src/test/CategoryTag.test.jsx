import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import CategoryTag from "../components/atoms/CategoryTag/CategoryTag";

describe("CategoryTag", () => {
  const COLORS = {
    HACKATHON: "#FF2D78",
    MASTERCLASS: "#00F5FF",
    NETWORKING: "#FFB800",
    TALLER: "#00FF9D",
  };

  Object.entries(COLORS).forEach(([category, color]) => {
    it(`aplica el color correcto para ${category}`, () => {
      const { container } = render(<CategoryTag category={category} />);
      const tag = container.querySelector("span");
      expect(tag.style.getPropertyValue("--category-color")).toBe(color);
    });
  });

  it("aplica color blanco para categoría desconocida", () => {
    const { container } = render(<CategoryTag category="DESCONOCIDO" />);
    const tag = container.querySelector("span");
    expect(tag.style.getPropertyValue("--category-color")).toBe("#FFFFFF");
  });

  it("funciona con categoría en minúsculas (toUpperCase)", () => {
    const { container } = render(<CategoryTag category="hackathon" />);
    const tag = container.querySelector("span");
    expect(tag.style.getPropertyValue("--category-color")).toBe("#FF2D78");
  });

  it("muestra el texto de la categoría", () => {
    render(<CategoryTag category="TALLER" />);
    expect(screen.getByText("TALLER")).toBeInTheDocument();
  });

  it("maneja category undefined sin errores", () => {
    const { container } = render(<CategoryTag />);
    const tag = container.querySelector("span");
    expect(tag.style.getPropertyValue("--category-color")).toBe("#FFFFFF");
  });
});

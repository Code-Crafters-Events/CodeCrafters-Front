import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

import Label from "../components/atoms/Label/Label";

describe("Label", () => {
  it("renderiza los children", () => {
    render(<Label>Mi etiqueta</Label>);
    expect(screen.getByText("Mi etiqueta")).toBeInTheDocument();
  });

  it("asigna htmlFor correctamente", () => {
    render(<Label htmlFor="email">Email</Label>);
    expect(screen.getByText("Email")).toHaveAttribute("for", "email");
  });

  it("aplica className", () => {
    render(<Label className="my-class">txt</Label>);
    expect(screen.getByText("txt").className).toContain("my-class");
  });
});
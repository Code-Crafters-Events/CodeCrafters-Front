import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import CornerBrackets from "../components/atoms/CornerBrackets/CornerBrackets";

describe("CornerBrackets", () => {
  it("renderiza los 4 divs de esquina", () => {
    const { container } = render(<CornerBrackets />);
    const corners = container.querySelectorAll("div");
    expect(corners).toHaveLength(4);
  });

  it("incluye las clases topLeft, topRight, bottomLeft, bottomRight", () => {
    const { container } = render(<CornerBrackets />);
    const html = container.innerHTML;
    expect(html).toContain("topLeft");
    expect(html).toContain("topRight");
    expect(html).toContain("bottomLeft");
    expect(html).toContain("bottomRight");
  });
});
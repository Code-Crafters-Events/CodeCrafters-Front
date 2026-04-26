import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

import StatusLabel from "../components/atoms/StatusLabel/StatusLabel";

describe("StatusLabel", () => {
  it("renderiza el texto pasado", () => {
    render(<StatusLabel text="SISTEMA ONLINE" />);
    expect(screen.getByText("SISTEMA ONLINE")).toBeInTheDocument();
  });

  it("renderiza vacío cuando text no se pasa", () => {
    const { container } = render(<StatusLabel />);
    expect(container.firstChild.textContent).toBe("");
  });
});
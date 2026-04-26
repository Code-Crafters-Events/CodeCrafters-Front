import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

import Logo from "../components/atoms/Logo/Logo";

describe("Logo", () => {
  it("muestra el texto CODE_CRAFTERS", () => {
    render(<Logo />);
    expect(screen.getByText(/CODE/)).toBeInTheDocument();
    expect(screen.getByText(/CRAFTERS/)).toBeInTheDocument();
  });

  it("muestra el subtítulo del sistema", () => {
    render(<Logo />);
    expect(screen.getByText(/system boot sequence/i)).toBeInTheDocument();
  });
});
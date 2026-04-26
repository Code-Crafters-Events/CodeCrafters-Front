import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

import TickerItem from "../components/atoms/TickerItem/TickerItem";

describe("TickerItem", () => {
  it("renderiza el separador y el texto", () => {
    render(<TickerItem separator="►" text="eventos tech en vivo" />);
    expect(screen.getByText("►")).toBeInTheDocument();
    expect(screen.getByText("eventos tech en vivo")).toBeInTheDocument();
  });

  it("renderiza con diferentes separadores", () => {
    render(<TickerItem separator="✦" text="hackathon" />);
    expect(screen.getByText("✦")).toBeInTheDocument();
  });
});

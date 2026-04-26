import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";

import Footer from "../components/organisms/Footer/Footer";

const wrap = (ui) => render(<MemoryRouter>{ui}</MemoryRouter>);

describe("Footer", () => {
  it("muestra el copyright del año", () => {
    wrap(<Footer />);
    expect(screen.getByText(/2026 CODE CRAFTERS/)).toBeInTheDocument();
  });

  it("muestra el nombre de la autora", () => {
    wrap(<Footer />);
    expect(screen.getByText("JENNIFER CROS")).toBeInTheDocument();
  });

  it("muestra 'ALL RIGHTS RESERVED'", () => {
    wrap(<Footer />);
    expect(screen.getByText("ALL RIGHTS RESERVED")).toBeInTheDocument();
  });

  it("muestra el nombre de la app en el título inferior", () => {
    wrap(<Footer />);
    const codeElements = screen.getAllByText(/CODE/);
    expect(codeElements.length).toBeGreaterThan(0);

    expect(screen.getAllByText(/CRAFTERS/).length).toBeGreaterThan(0);
  });
});

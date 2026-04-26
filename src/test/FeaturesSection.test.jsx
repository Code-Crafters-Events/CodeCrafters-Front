import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";

import FeaturesSection from "../components/organisms/FeaturesSection/FeaturesSection";

const wrap = (ui) => render(<MemoryRouter>{ui}</MemoryRouter>);

describe("FeaturesSection", () => {
  it("renderiza las 4 feature cards", () => {
    wrap(<FeaturesSection />);
    expect(screen.getByText("Gestión de eventos")).toBeInTheDocument();
    expect(screen.getByText("Ticketing & pagos")).toBeInTheDocument();
    expect(screen.getByText("Perfil de usuario")).toBeInTheDocument();
    expect(screen.getByText("Red social tech")).toBeInTheDocument();
  });

  it("cada card muestra su descripción", () => {
    wrap(<FeaturesSection />);
    expect(screen.getByText(/Crea, edita y elimina/)).toBeInTheDocument();
    expect(screen.getByText(/Genera tickets/)).toBeInTheDocument();
    expect(screen.getByText(/Spring Security/)).toBeInTheDocument();
    expect(screen.getByText(/quién asiste/)).toBeInTheDocument();
  });

  it("tiene aria-label de funcionalidades", () => {
    const { container } = wrap(<FeaturesSection />);
    expect(
      container.querySelector("[aria-label='Funcionalidades']"),
    ).toBeInTheDocument();
  });
});

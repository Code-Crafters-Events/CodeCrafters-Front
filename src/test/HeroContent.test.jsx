import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import HeroContent from "../components/molecules/HeroContent/HeroContent";

describe("HeroContent Component", () => {
  const mockOnRegister = vi.fn();
  const mockOnCommunity = vi.fn();

  it("renderiza todos los textos principales del Hero", () => {
    render(<HeroContent onRegister={mockOnRegister} onCommunity={mockOnCommunity} />);
    expect(screen.getByText("CODE")).toBeInTheDocument();
    expect(screen.getByText("CRAFT")).toBeInTheDocument();
    expect(screen.getByText("ERS")).toBeInTheDocument();
    expect(screen.getByText(/Aprende.Conecta./i)).toBeInTheDocument();
    expect(screen.getByText("Innova")).toBeInTheDocument();
    expect(screen.getByText(/El punto de encuentro para la comunidad tecnológica/i)).toBeInTheDocument();
  });

  it("llama a onRegister cuando se hace click en el botón REGISTRARSE", () => {
    render(<HeroContent onRegister={mockOnRegister} onCommunity={mockOnCommunity} />);

    const registerBtn = screen.getByRole("button", { name: /REGISTRARSE/i });
    fireEvent.click(registerBtn);

    expect(mockOnRegister).toHaveBeenCalledTimes(1);
  });

  it("llama a onCommunity cuando se hace click en el botón EXPLORAR", () => {
    render(<HeroContent onRegister={mockOnRegister} onCommunity={mockOnCommunity} />);

    const exploreBtn = screen.getByRole("button", { name: /EXPLORAR/i });
    fireEvent.click(exploreBtn);

    expect(mockOnCommunity).toHaveBeenCalledTimes(1);
  });

  it("aplica las clases de estilo correctamente", () => {
    const { container } = render(
      <HeroContent onRegister={mockOnRegister} onCommunity={mockOnCommunity} />
    );
    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass(/wrapper/);
  });
});
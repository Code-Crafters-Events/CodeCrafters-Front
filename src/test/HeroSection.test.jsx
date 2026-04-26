import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import HeroSection from "../components/organisms/HeroSection/HeroSection";

const wrap = (ui) => render(<MemoryRouter>{ui}</MemoryRouter>);

describe("HeroSection", () => {
  it("renderiza el botón REGISTRARSE", () => {
    wrap(<HeroSection onRegister={() => {}} onCommunity={() => {}} />);
    expect(screen.getByText("REGISTRARSE")).toBeInTheDocument();
  });

  it("renderiza el botón EXPLORAR", () => {
    wrap(<HeroSection onRegister={() => {}} onCommunity={() => {}} />);
    expect(screen.getByText("EXPLORAR")).toBeInTheDocument();
  });

  it("llama a onRegister al hacer click en REGISTRARSE", () => {
    const onRegister = vi.fn();
    wrap(<HeroSection onRegister={onRegister} onCommunity={() => {}} />);
    fireEvent.click(screen.getByText("REGISTRARSE"));
    expect(onRegister).toHaveBeenCalledTimes(1);
  });

  it("llama a onCommunity al hacer click en EXPLORAR", () => {
    const onCommunity = vi.fn();
    wrap(<HeroSection onRegister={() => {}} onCommunity={onCommunity} />);
    fireEvent.click(screen.getByText("EXPLORAR"));
    expect(onCommunity).toHaveBeenCalledTimes(1);
  });

  it("tiene aria-label de presentación", () => {
    const { container } = wrap(
      <HeroSection onRegister={() => {}} onCommunity={() => {}} />,
    );
    expect(
      container.querySelector("[aria-label='Presentación']"),
    ).toBeInTheDocument();
  });

  it("muestra el tagline y subtítulo", () => {
    wrap(<HeroSection onRegister={() => {}} onCommunity={() => {}} />);
    expect(screen.getByText(/Aprende/)).toBeInTheDocument();
  });
});

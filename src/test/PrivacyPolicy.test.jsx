import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import PrivacyPolicy from "../components/organisms/PrivacyPolicy/PrivacyPolicy";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, useNavigate: () => mockNavigate };
});
vi.mock("react-router", async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, useNavigate: () => mockNavigate };
});

const wrap = (ui) => render(<MemoryRouter>{ui}</MemoryRouter>);

describe("PrivacyPolicy", () => {
  it("muestra el título principal", () => {
    wrap(<PrivacyPolicy />);
    expect(screen.getByText("Protocolo de Privacidad")).toBeInTheDocument();
  });

  it("muestra las 4 secciones principales", () => {
    wrap(<PrivacyPolicy />);
    expect(screen.getByText(/Recopilación de Datos/)).toBeInTheDocument();
    expect(screen.getByText(/Uso de la Información/)).toBeInTheDocument();
    expect(screen.getByText(/Seguridad de Encriptación/)).toBeInTheDocument();
    expect(screen.getByText(/Tus Derechos/)).toBeInTheDocument();
  });

  it("muestra la fecha de última actualización", () => {
    wrap(<PrivacyPolicy />);
    expect(screen.getByText(/Última actualización/)).toBeInTheDocument();
  });

  it("muestra el enlace de contacto con el email", () => {
    wrap(<PrivacyPolicy />);
    const link = screen.getByText("Contactar Soporte");
    expect(link).toHaveAttribute("href", "mailto:codecraftersevents@gmail.com");
  });

  it("muestra el texto de dudas", () => {
    wrap(<PrivacyPolicy />);
    expect(screen.getByText("¿Dudas sobre el protocolo?")).toBeInTheDocument();
  });
});

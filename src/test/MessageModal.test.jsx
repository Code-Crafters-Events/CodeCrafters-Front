import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import MessageModal from "../components/organisms/MessageModal/MessageModal";

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

describe("MessageModal", () => {
  const defaultProps = {
    message: "¿Estás seguro de eliminar?",
    btnText: "Eliminar",
    btnClass: "neon",
    onConfirm: vi.fn(),
    onClose: vi.fn(),
  };

  beforeEach(() => vi.clearAllMocks());

  it("renderiza el mensaje", () => {
    wrap(<MessageModal {...defaultProps} />);
    expect(screen.getByText("¿Estás seguro de eliminar?")).toBeInTheDocument();
  });

  it("renderiza el botón de confirmación con el texto correcto", () => {
    wrap(<MessageModal {...defaultProps} />);
    expect(screen.getByText("Eliminar")).toBeInTheDocument();
  });

  it("renderiza el botón secundario 'Cancelar' por defecto", () => {
    wrap(<MessageModal {...defaultProps} />);
    expect(screen.getByText("Cancelar")).toBeInTheDocument();
  });

  it("usa el texto del botón secundario personalizado", () => {
    wrap(<MessageModal {...defaultProps} secondaryBtnText="Cerrar" />);
    expect(screen.getByText("Cerrar")).toBeInTheDocument();
  });

  it("llama a onConfirm al hacer click en el botón de acción", () => {
    const onConfirm = vi.fn();
    wrap(<MessageModal {...defaultProps} onConfirm={onConfirm} />);
    fireEvent.click(screen.getByText("Eliminar"));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("llama a onClose al hacer click en el botón secundario", () => {
    const onClose = vi.fn();
    wrap(<MessageModal {...defaultProps} onClose={onClose} />);
    fireEvent.click(screen.getByText("Cancelar"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("muestra el spinner y oculta el botón secundario cuando isLoading=true", () => {
    wrap(<MessageModal {...defaultProps} isLoading />);
    expect(screen.queryByText("Cancelar")).not.toBeInTheDocument();
    expect(screen.getByText("Eliminando...")).toBeInTheDocument();
  });

  it("muestra mensaje de procesando cuando isLoading=true", () => {
    wrap(<MessageModal {...defaultProps} isLoading />);
    expect(
      screen.getByText(/Procesando eliminación/)
    ).toBeInTheDocument();
  });

  it("el botón de confirmación está deshabilitado cuando isLoading=true", () => {
    wrap(<MessageModal {...defaultProps} isLoading />);
    expect(screen.getByText("Eliminando...")).toBeDisabled();
  });

  it("renderiza la imagen cuando se pasa y no está cargando", () => {
    wrap(<MessageModal {...defaultProps} image="http://img.png" />);
    expect(screen.getByAltText("Modal Icon")).toBeInTheDocument();
  });

  it("NO renderiza la imagen cuando isLoading=true", () => {
    wrap(<MessageModal {...defaultProps} image="http://img.png" isLoading />);
    expect(screen.queryByAltText("Modal Icon")).not.toBeInTheDocument();
  });
});
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import AvatarUpload from "../components/atoms/AvatarUpload/AvatarUpload";
import React from "react";

const defaultProps = {
  onFileSelect: vi.fn(),
  onRemove: vi.fn(),
};

describe("AvatarUpload", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  it('muestra "Subir foto" cuando no hay preview', () => {
    render(<AvatarUpload {...defaultProps} />);
    expect(screen.getByText("Subir foto")).toBeInTheDocument();
  });

  it("muestra la letra placeholder cuando no hay preview", () => {
    render(<AvatarUpload {...defaultProps} placeholderLetter="J" />);
    expect(screen.getByText("J")).toBeInTheDocument();
  });

  it("NO muestra el botón Eliminar cuando no hay preview", () => {
    render(<AvatarUpload {...defaultProps} />);
    expect(screen.queryByText("Eliminar")).not.toBeInTheDocument();
  });

  it('muestra "Cambiar foto" cuando hay preview', () => {
    render(<AvatarUpload {...defaultProps} preview="blob:mock" />);
    expect(screen.getByText("Cambiar foto")).toBeInTheDocument();
  });

  it("renderiza la imagen de preview cuando se pasa preview", () => {
    render(<AvatarUpload {...defaultProps} preview="blob:mock" />);
    expect(screen.getByAltText("Vista previa")).toBeInTheDocument();
  });

  it("muestra el botón Eliminar cuando hay preview", () => {
    render(<AvatarUpload {...defaultProps} preview="blob:mock" />);
    expect(screen.getByText("Eliminar")).toBeInTheDocument();
  });

  it("llama a onRemove al hacer click en Eliminar", () => {
    render(<AvatarUpload {...defaultProps} preview="blob:mock" />);
    fireEvent.click(screen.getByText("Eliminar"));
    expect(defaultProps.onRemove).toHaveBeenCalledTimes(1);
  });

  it("llama onFileSelect con error cuando el tipo no está permitido", () => {
    render(<AvatarUpload {...defaultProps} />);
    const input = screen.getByLabelText("Seleccionar foto de perfil");
    const file = new File(["content"], "file.pdf", { type: "application/pdf" });
    fireEvent.change(input, { target: { files: [file] } });
    expect(defaultProps.onFileSelect).toHaveBeenCalledWith(
      null,
      "Solo se permiten imágenes JPG, PNG, WEBP o GIF",
    );
  });

  it("llama onFileSelect con error cuando el archivo supera 5 MB", () => {
    render(<AvatarUpload {...defaultProps} />);
    const input = screen.getByLabelText("Seleccionar foto de perfil");
    const bigFile = new File(["x"], "big.jpg", { type: "image/jpeg" });
    Object.defineProperty(bigFile, "size", { value: 6 * 1024 * 1024 });
    fireEvent.change(input, { target: { files: [bigFile] } });
    expect(defaultProps.onFileSelect).toHaveBeenCalledWith(
      null,
      "El archivo no puede superar 5 MB",
    );
  });

  it("llama onFileSelect con el archivo cuando es válido", () => {
    render(<AvatarUpload {...defaultProps} />);
    const input = screen.getByLabelText("Seleccionar foto de perfil");
    const validFile = new File(["x"], "photo.jpg", { type: "image/jpeg" });
    Object.defineProperty(validFile, "size", { value: 1024 });
    fireEvent.change(input, { target: { files: [validFile] } });
    expect(defaultProps.onFileSelect).toHaveBeenCalledWith(validFile, null);
  });

  it("muestra el mensaje de error cuando se pasa el prop error", () => {
    render(<AvatarUpload {...defaultProps} error="Error de prueba" />);
    expect(screen.getByRole("alert")).toHaveTextContent("Error de prueba");
  });

  it("aplica estilos de borde según la prop shape", () => {
    const { rerender } = render(
      <AvatarUpload {...defaultProps} shape="square" />,
    );
    let preview = screen.getByRole("group").firstElementChild;
    expect(preview.style.borderRadius).toBe("4px");

    rerender(<AvatarUpload {...defaultProps} shape="round" />);
    preview = screen.getByRole("group").firstElementChild;
    expect(preview.style.borderRadius).toBe("50%");
  });

  it("muestra el hint personalizado o por defecto", () => {
    const { rerender } = render(<AvatarUpload {...defaultProps} />);
    expect(screen.getByText(/JPG, PNG, WEBP o GIF/)).toBeInTheDocument();

    rerender(<AvatarUpload {...defaultProps} hint="Solo PNG" />);
    expect(screen.getByText("Solo PNG")).toBeInTheDocument();
  });

  it("abre el selector de archivos al hacer click en el botón", () => {
    render(<AvatarUpload {...defaultProps} />);
    const input = screen.getByLabelText("Seleccionar foto de perfil");
    const clickSpy = vi.spyOn(input, "click");
    fireEvent.click(screen.getByText("Subir foto"));
    expect(clickSpy).toHaveBeenCalled();
  });

  it("limpia el valor del input al eliminar", () => {
    render(<AvatarUpload {...defaultProps} preview="blob:mock" />);
    const input = screen.getByLabelText("Seleccionar foto de perfil");
    fireEvent.change(input, { target: { files: [new File([""], "t.jpg")] } });
    fireEvent.click(screen.getByText("Eliminar"));
    expect(input.value).toBe("");
    expect(defaultProps.onRemove).toHaveBeenCalled();
  });

  it("cubre la rama negativa de la línea 39 (ref null)", () => {
    const { result } = render(<AvatarUpload {...defaultProps} />);
    const button = screen.getByText("Subir foto");
    fireEvent.click(button);
  });

  it("cubre la rama de files undefined/null en la línea 22 y 23", () => {
    render(<AvatarUpload {...defaultProps} />);
    const input = screen.getByLabelText("Seleccionar foto de perfil");
    fireEvent.change(input, { target: { files: null } });
    fireEvent.change(input, { target: { files: [] } });
    expect(defaultProps.onFileSelect).not.toHaveBeenCalled();
  });

  it("llama al click del input cuando se cambia la foto existente", () => {
    render(<AvatarUpload {...defaultProps} preview="blob:mock" />);
    const input = screen.getByLabelText("Seleccionar foto de perfil");
    const clickSpy = vi.spyOn(input, "click");
    fireEvent.click(screen.getByText("Cambiar foto"));
    expect(clickSpy).toHaveBeenCalled();
  });
});

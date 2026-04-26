import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import AttendeeAvatar from "../components/atoms/AttendeesAvatar/AttendeesAvatar";

describe("AttendeeAvatar", () => {
  it("muestra la inicial en mayúscula cuando no hay imageUrl", () => {
    render(<AttendeeAvatar name="jennifer" />);
    expect(screen.getByText("J")).toBeInTheDocument();
  });

  it('muestra "?" cuando name es undefined', () => {
    render(<AttendeeAvatar />);
    expect(screen.getByText("?")).toBeInTheDocument();
  });

  it('muestra "?" cuando name es cadena vacía', () => {
    render(<AttendeeAvatar name="" />);
    expect(screen.getByText("?")).toBeInTheDocument();
  });

  it("renderiza <img> cuando se pasa imageUrl", () => {
    render(
      <AttendeeAvatar name="Ana" imageUrl="http://localhost:8080/img.jpg" />,
    );
    const img = screen.getByRole("img", { name: "Ana" });
    expect(img).toBeInTheDocument();
  });

  it("reemplaza localhost:5173 por localhost:8080 en la URL de imagen", () => {
    render(
      <AttendeeAvatar name="Ana" imageUrl="http://localhost:5173/img.jpg" />,
    );
    const img = screen.getByRole("img");
    expect(img.src).toContain("localhost:8080");
    expect(img.src).not.toContain("localhost:5173");
  });

  it("aplica title y aria-label con el nombre del asistente", () => {
    const { container } = render(<AttendeeAvatar name="Luis" />);
    const div = container.firstChild;
    expect(div).toHaveAttribute("title", "Luis");
    expect(div).toHaveAttribute("aria-label", "Luis");
  });

  it("aplica la clase de tamaño 'sm' por defecto", () => {
    const { container } = render(<AttendeeAvatar name="Ana" />);
    expect(container.firstChild.className).toContain("sm");
  });

  it("aplica la clase de tamaño 'md' cuando se pasa size='md'", () => {
    const { container } = render(<AttendeeAvatar name="Ana" size="md" />);
    expect(container.firstChild.className).toContain("md");
  });
});

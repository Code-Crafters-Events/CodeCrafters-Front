import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import Toast from "../components/atoms/Toast/Toast";

describe("Toast", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("muestra el mensaje", () => {
    render(<Toast message="Operación correcta" type="success" />);
    expect(screen.getByText("Operación correcta")).toBeInTheDocument();
  });

  it("tiene role=alert y aria-live=polite", () => {
    render(<Toast message="msg" />);
    const toast = screen.getByRole("alert");
    expect(toast).toHaveAttribute("aria-live", "polite");
  });

  it.each([
    ["success", "✓"],
    ["error", "✕"],
    ["warning", "⚠"],
    ["info", "i"],
  ])('muestra el icono "%s" para type="%s"', (type, icon) => {
    render(<Toast message="msg" type={type} />);
    expect(screen.getByText(icon, { selector: "span" })).toBeInTheDocument();
  });

  it("llama onClose tras la duración especificada", () => {
    const onClose = vi.fn();
    render(
      <Toast message="msg" type="success" duration={3000} onClose={onClose} />,
    );
    expect(onClose).not.toHaveBeenCalled();
    vi.advanceTimersByTime(3000);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("NO llama onClose antes de que termine la duración", () => {
    const onClose = vi.fn();
    render(
      <Toast message="msg" type="success" duration={3000} onClose={onClose} />,
    );
    vi.advanceTimersByTime(2999);
    expect(onClose).not.toHaveBeenCalled();
  });

  it("NO llama onClose cuando duration=0", () => {
    const onClose = vi.fn();
    render(
      <Toast message="msg" type="success" duration={0} onClose={onClose} />,
    );
    vi.advanceTimersByTime(9999);
    expect(onClose).not.toHaveBeenCalled();
  });

  it("NO configura timer cuando no hay onClose", () => {
    expect(() => {
      render(<Toast message="msg" type="success" />);
      vi.advanceTimersByTime(5000);
    }).not.toThrow();
  });

  it("muestra el botón de cierre cuando onClose está definido", () => {
    const onClose = vi.fn();
    render(<Toast message="msg" onClose={onClose} />);
    expect(screen.getByLabelText("Cerrar notificación")).toBeInTheDocument();
  });

  it("NO muestra el botón de cierre cuando onClose no está definido", () => {
    render(<Toast message="msg" />);
    expect(
      screen.queryByLabelText("Cerrar notificación"),
    ).not.toBeInTheDocument();
  });

  it("llama onClose al hacer click en el botón de cierre", () => {
    const onClose = vi.fn();
    render(<Toast message="msg" onClose={onClose} />);
    fireEvent.click(screen.getByLabelText("Cerrar notificación"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

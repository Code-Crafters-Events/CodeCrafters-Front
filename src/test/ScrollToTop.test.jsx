import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import ScrollToTop from "../components/atoms/ScrollToTop/ScrollToTop";

describe("ScrollToTop", () => {
  beforeEach(() => {
    window.scrollTo = vi.fn();
    Object.defineProperty(window, "pageYOffset", {
      writable: true,
      value: 0,
    });
  });

  it("no renderiza el botón cuando el scroll es 0", () => {
    render(<ScrollToTop />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("no renderiza cuando el scroll es exactamente 300", () => {
    window.pageYOffset = 300;
    render(<ScrollToTop />);
    act(() => { fireEvent.scroll(window); });
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("renderiza el botón cuando el scroll supera 300px", () => {
    render(<ScrollToTop />);
    act(() => {
      window.pageYOffset = 301;
      fireEvent.scroll(window);
    });
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("vuelve a ocultarse cuando el scroll baja de 300px", () => {
    render(<ScrollToTop />);
    act(() => {
      window.pageYOffset = 400;
      fireEvent.scroll(window);
    });
    expect(screen.getByRole("button")).toBeInTheDocument();
    act(() => {
      window.pageYOffset = 100;
      fireEvent.scroll(window);
    });
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("llama window.scrollTo al hacer click en el botón", () => {
    render(<ScrollToTop />);
    act(() => {
      window.pageYOffset = 500;
      fireEvent.scroll(window);
    });
    fireEvent.click(screen.getByRole("button"));
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: "smooth" });
  });

  it("elimina el event listener al desmontar", () => {
    const removeEventListenerSpy = vi.spyOn(window, "removeEventListener");
    const { unmount } = render(<ScrollToTop />);
    unmount();
    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      "scroll",
      expect.any(Function)
    );
  });
});
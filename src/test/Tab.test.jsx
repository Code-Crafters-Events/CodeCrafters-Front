import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import Tab from "../components/atoms/Tab/Tab";

describe("Tab", () => {
  it("renderiza el texto", () => {
    render(<Tab text="Activos" onClick={() => {}} />);
    expect(screen.getByText("Activos")).toBeInTheDocument();
  });

  it("renderiza el count cuando se pasa", () => {
    render(<Tab text="Activos" count={5} onClick={() => {}} />);
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("NO renderiza count cuando es undefined", () => {
    const { container } = render(<Tab text="Activos" onClick={() => {}} />);
    const countSpans = container.querySelectorAll("span");
    const countSpan = Array.from(countSpans).find((s) => s.textContent === "");
    expect(countSpan).toBeUndefined();
  });

  it("tiene clase active cuando isActive=true", () => {
    const { container } = render(
      <Tab text="Tab" isActive onClick={() => {}} />,
    );
    expect(container.firstChild.className).toContain("active");
  });

  it("NO tiene clase active cuando isActive=false", () => {
    const { container } = render(
      <Tab text="Tab" isActive={false} onClick={() => {}} />,
    );
    expect(container.firstChild.className).not.toContain("active");
  });

  it("llama onClick al hacer click", () => {
    const onClick = vi.fn();
    render(<Tab text="Tab" onClick={onClick} />);
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('el type del botón es "button"', () => {
    render(<Tab text="Tab" onClick={() => {}} />);
    expect(screen.getByRole("button")).toHaveAttribute("type", "button");
  });
});
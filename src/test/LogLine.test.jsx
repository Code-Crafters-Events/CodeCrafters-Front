import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import LogLine from "../components/atoms/LogLine/LogLine";

describe("LogLine", () => {
  it("renderiza el prompt cuando isPrompt=true", () => {
    render(<LogLine text="./init.sh" isPrompt visible />);
    expect(screen.getByText("cc@system:~$")).toBeInTheDocument();
    expect(screen.getByText("./init.sh")).toBeInTheDocument();
  });

  it("renderiza el ✓ cuando isPrompt=false", () => {
    render(<LogLine text="PostgreSQL conectado" visible />);
    expect(screen.getByText("✓")).toBeInTheDocument();
  });

  it("elimina el prefijo ✓ del texto si ya lo lleva", () => {
    render(<LogLine text="✓ PostgreSQL conectado" visible />);
    expect(screen.getByText("PostgreSQL conectado")).toBeInTheDocument();
  });

  it("muestra el cursor _ cuando showCursor=true", () => {
    render(<LogLine text="cargando" visible showCursor />);
    expect(screen.getByText("_")).toBeInTheDocument();
  });

  it("NO muestra el cursor cuando showCursor=false", () => {
    render(<LogLine text="cargando" visible />);
    expect(screen.queryByText("_")).not.toBeInTheDocument();
  });

  it("aplica clase visible cuando visible=true", () => {
    const { container } = render(<LogLine text="test" visible />);
    expect(container.firstChild.className).toContain("visible");
  });

  it("NO aplica clase visible cuando visible=false", () => {
    const { container } = render(<LogLine text="test" visible={false} />);
    expect(container.firstChild.className).not.toContain("visible");
  });
});

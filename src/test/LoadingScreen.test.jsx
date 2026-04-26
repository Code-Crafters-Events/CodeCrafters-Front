import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { AuthContext } from "../context/auth/AuthContext";
import LoadingScreen from "../components/organisms/LoadingScreen/LoadingScreen";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock("../constants/bootSteps", () => ({
  BOOT_STEPS: [
    { pct: 0, label: "INIT", log: null },
    { pct: 100, label: "ONLINE", log: "✓ sistema ok" },
  ],
  STEP_DELAY_MS: 0,
}));

describe("LoadingScreen", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renderiza el logo CODE_CRAFTERS", () => {
    render(
      <MemoryRouter>
        <LoadingScreen />
      </MemoryRouter>,
    );
    expect(screen.getByText(/CODE/)).toBeInTheDocument();
    expect(screen.getByText(/CRAFTERS/)).toBeInTheDocument();
  });

  it("muestra el botón ENTRAR AL SISTEMA tras completar la secuencia", async () => {
    render(
      <MemoryRouter>
        <LoadingScreen />
      </MemoryRouter>,
    );
    await act(async () => {
      vi.runAllTimers();
    });
    expect(screen.getByText("ENTRAR AL SISTEMA →")).toBeInTheDocument();
  });

  it("navega a /home al hacer click en ENTRAR AL SISTEMA", async () => {
    render(
      <MemoryRouter>
        <LoadingScreen />
      </MemoryRouter>,
    );
    await act(async () => {
      vi.runAllTimers();
    });
    fireEvent.click(screen.getByText("ENTRAR AL SISTEMA →"));
    expect(mockNavigate).toHaveBeenCalledWith("/home");
  });

  it("muestra el 0% al inicio", () => {
    render(
      <MemoryRouter>
        <LoadingScreen />
      </MemoryRouter>,
    );

    const percentElements = screen.getAllByText("0%");

    expect(percentElements.length).toBeGreaterThan(0);
    expect(percentElements[0]).toBeInTheDocument();
  });
});

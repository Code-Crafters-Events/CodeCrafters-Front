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
import useAuth from "../hooks/useAuth";
import Header from "../components/organisms/Header/Header";

const { mockLogin, mockLogout, mockAuthLogin } = vi.hoisted(() => ({
  mockLogin: vi.fn(),
  mockLogout: vi.fn(),
  mockAuthLogin: vi.fn(),
}));

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, useNavigate: () => mockNavigate };
});
vi.mock("react-router", async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock("../services/authApi", () => ({
  authApi: { login: mockAuthLogin, register: vi.fn() },
}));

vi.mock("../hooks/useAuth", () => ({
  default: vi.fn(),
}));

const wrapWithAuth = (ui, user = null) =>
  render(
    <MemoryRouter>
      <AuthContext.Provider
        value={{ user, login: mockLogin, logout: mockLogout }}
      >
        {ui}
      </AuthContext.Provider>
    </MemoryRouter>,
  );

describe("Header", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("muestra el botón CONECTAR cuando el usuario no está logado", () => {
    useAuth.mockReturnValue({ user: null, logout: vi.fn() });
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>,
    );
    expect(screen.getByText("CONECTAR")).toBeInTheDocument();
  });

  it("muestra el icono de logout cuando el usuario está logado", () => {
    useAuth.mockReturnValue({
      user: { id: 1, name: "Jennifer", profileImage: null },
      logout: vi.fn(),
    });
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>,
    );
    expect(screen.getByAltText("LogOut")).toBeInTheDocument();
  });

  it("muestra la inicial del nombre cuando no hay profileImage", () => {
    useAuth.mockReturnValue({
      user: { id: 1, name: "Jennifer", profileImage: null },
      logout: vi.fn(),
    });
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>,
    );
    expect(screen.getByText("J")).toBeInTheDocument();
  });

  it("muestra el avatar cuando hay profileImage", () => {
    useAuth.mockReturnValue({
      user: {
        id: 1,
        name: "Jen",
        profileImage: "http://localhost:8080/img.jpg",
      },
      logout: vi.fn(),
    });
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>,
    );
    expect(screen.getByAltText("avatar")).toBeInTheDocument();
  });

  it("reemplaza localhost:5173 por localhost:8080 en la URL del avatar", () => {
    useAuth.mockReturnValue({
      user: {
        id: 1,
        name: "Jen",
        profileImage: "http://localhost:5173/img.jpg",
      },
      logout: vi.fn(),
    });
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>,
    );
    const avatar = screen.getByAltText("avatar");
    expect(avatar.src).toContain("localhost:8080");
    expect(avatar.src).not.toContain("localhost:5173");
  });

  it("llama a logout y navega a /home al hacer click en el icono de logout", () => {
    const logoutFn = vi.fn();
    useAuth.mockReturnValue({
      user: { id: 1, name: "Jennifer", profileImage: null },
      logout: logoutFn,
    });
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByAltText("LogOut"));
    expect(logoutFn).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith("/home");
  });

  it("renderiza los 4 enlaces de navegación", () => {
    useAuth.mockReturnValue({ user: null, logout: vi.fn() });
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>,
    );
    expect(screen.getByText("EVENTOS")).toBeInTheDocument();
    expect(screen.getByText("COMUNIDAD")).toBeInTheDocument();
    expect(screen.getByText("TICKETS")).toBeInTheDocument();
    expect(screen.getByText("PERFIL")).toBeInTheDocument();
  });

  it("muestra el título CODE_CRAFTERS", () => {
    useAuth.mockReturnValue({ user: null, logout: vi.fn() });
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>,
    );
    expect(screen.getByText(/CODE/)).toBeInTheDocument();
    expect(screen.getByText(/CRAFTERS/)).toBeInTheDocument();
  });

  it("profileImage null devuelve null en getAvatarUrl", () => {
    useAuth.mockReturnValue({
      user: { id: 1, name: "Jen", profileImage: null },
      logout: vi.fn(),
    });
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>,
    );
    expect(screen.queryByAltText("avatar")).not.toBeInTheDocument();
  });
});

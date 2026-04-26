import { render, screen, act, renderHook } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useContext } from "react";
import { AuthContext } from "../context/auth/AuthContext";
import { AuthProvider } from "../context/auth/AuthProvider";
import useAuth from "../hooks/useAuth";

const TestConsumer = () => {
  const { user, login, logout, updateUser } = useContext(AuthContext);
  return (
    <div>
      <span data-testid="user">{user ? JSON.stringify(user) : "null"}</span>
      <button
        onClick={() => login({ id: 1, name: "Jennifer", token: "tok123" })}
      >
        login
      </button>
      <button onClick={() => login({ userId: 2, name: "Ana" })}>
        login-userid
      </button>
      <button onClick={logout}>logout</button>
      <button onClick={() => updateUser({ name: "Actualizado" })}>
        update
      </button>
    </div>
  );
};

const renderWithProvider = () =>
  render(
    <AuthProvider>
      <TestConsumer />
    </AuthProvider>,
  );

describe("AuthProvider", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("inicia con user=null cuando localStorage está vacío", () => {
    renderWithProvider();
    expect(screen.getByTestId("user").textContent).toBe("null");
  });

  it("restaura el usuario desde localStorage en el arranque", () => {
    const stored = { id: 5, name: "Stored" };
    localStorage.setItem("user", JSON.stringify(stored));
    renderWithProvider();
    expect(screen.getByTestId("user").textContent).toContain("Stored");
  });

  it("devuelve null si el JSON en localStorage es inválido", () => {
    localStorage.setItem("user", "not-valid-json{{{");
    renderWithProvider();
    expect(screen.getByTestId("user").textContent).toBe("null");
  });

  it("guarda el usuario en estado y localStorage tras login", () => {
    renderWithProvider();
    act(() => {
      screen.getByText("login").click();
    });
    const user = JSON.parse(screen.getByTestId("user").textContent);
    expect(user.id).toBe(1);
    expect(user.name).toBe("Jennifer");
    expect(localStorage.getItem("user")).toContain("Jennifer");
  });

  it("guarda el token en localStorage cuando viene en userData", () => {
    renderWithProvider();
    act(() => {
      screen.getByText("login").click();
    });
    expect(localStorage.getItem("token")).toBe("tok123");
  });

  it("normaliza userId → id en el login", () => {
    renderWithProvider();
    act(() => {
      screen.getByText("login-userid").click();
    });
    const user = JSON.parse(screen.getByTestId("user").textContent);
    expect(user.id).toBe(2);
  });

  it("limpia user, localStorage y token tras logout", () => {
    localStorage.setItem("user", JSON.stringify({ id: 1, name: "Test" }));
    localStorage.setItem("token", "tok");
    renderWithProvider();
    act(() => {
      screen.getByText("logout").click();
    });
    expect(screen.getByTestId("user").textContent).toBe("null");
    expect(localStorage.getItem("user")).toBeNull();
    expect(localStorage.getItem("token")).toBeNull();
  });

  it("fusiona los datos del usuario con updateUser", () => {
    localStorage.setItem("user", JSON.stringify({ id: 1, name: "Original" }));
    renderWithProvider();
    act(() => {
      screen.getByText("update").click();
    });
    const user = JSON.parse(screen.getByTestId("user").textContent);
    expect(user.name).toBe("Actualizado");
    expect(user.id).toBe(1);
    expect(localStorage.getItem("user")).toContain("Actualizado");
  });
});

describe("useAuth", () => {
  it("devuelve el contexto de autenticación", () => {
    const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current).toHaveProperty("user");
    expect(result.current).toHaveProperty("login");
    expect(result.current).toHaveProperty("logout");
    expect(result.current).toHaveProperty("updateUser");
  });
});

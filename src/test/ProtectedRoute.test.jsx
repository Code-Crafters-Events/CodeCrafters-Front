import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "../router/ProtectedRoute";
import { AuthContext } from "../context/auth/AuthContext";

const renderWithAuth = (user, initialPath = "/protected") =>
  render(
    <AuthContext.Provider value={{ user }}>
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route
            path="/protected"
            element={
              <ProtectedRoute>
                <div>Contenido protegido</div>
              </ProtectedRoute>
            }
          />
          <Route path="/home/login" element={<div>Página de login</div>} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  );

describe("ProtectedRoute", () => {
  it("renderiza los children cuando el usuario está autenticado", () => {
    renderWithAuth({ id: 1, name: "Jennifer" });
    expect(screen.getByText("Contenido protegido")).toBeInTheDocument();
  });

  it("redirige a /home/login cuando el usuario es null", () => {
    renderWithAuth(null);
    expect(screen.getByText("Página de login")).toBeInTheDocument();
    expect(screen.queryByText("Contenido protegido")).not.toBeInTheDocument();
  });

  it("redirige a /home/login cuando el usuario es undefined", () => {
    renderWithAuth(undefined);
    expect(screen.getByText("Página de login")).toBeInTheDocument();
  });
});

import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { AuthContext } from "../context/auth/AuthContext";
import LoginForm from "../components/organisms/LoginForm/LoginForm";

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
      <AuthContext.Provider value={{ user, login: mockLogin, logout: mockLogout }}>
        {ui}
      </AuthContext.Provider>
    </MemoryRouter>
  );


  describe("LoginForm", () => {
    beforeEach(() => vi.clearAllMocks());
  
    it("renderiza los campos email y password", () => {
      wrapWithAuth(<LoginForm />);
      expect(screen.getByLabelText("Email")).toBeInTheDocument();
      expect(screen.getByLabelText("Password")).toBeInTheDocument();
    });
  
    it("renderiza el botón de submit", () => {
      wrapWithAuth(<LoginForm />);
      expect(screen.getByText("Entrar")).toBeInTheDocument();
    });
  
    it("muestra error de email vacío al intentar enviar", async () => {
      wrapWithAuth(<LoginForm />);
      fireEvent.click(screen.getByText("Entrar"));
      await waitFor(() => {
        expect(screen.getByText("El email es obligatorio")).toBeInTheDocument();
      });
    });
  
    it("muestra error de contraseña vacía al intentar enviar", async () => {
      wrapWithAuth(<LoginForm />);
      fireEvent.click(screen.getByText("Entrar"));
      await waitFor(() => {
        expect(screen.getByText("La contraseña es obligatoria")).toBeInTheDocument();
      });
    });
  
    it("muestra error de formato de email inválido (onBlur)", async () => {
      wrapWithAuth(<LoginForm />);
      const emailInput = screen.getByLabelText("Email");
      fireEvent.change(emailInput, { target: { value: "no-es-email", name: "email" } });
      fireEvent.blur(emailInput);
      await waitFor(() => {
        expect(screen.getByText("Formato de email inválido")).toBeInTheDocument();
      });
    });
  
    it("muestra error de contraseña corta (onBlur)", async () => {
      wrapWithAuth(<LoginForm />);
      const passInput = screen.getByLabelText("Password");
      fireEvent.change(passInput, { target: { value: "abc", name: "password" } });
      fireEvent.blur(passInput);
      await waitFor(() => {
        expect(screen.getByText("Mínimo 6 caracteres")).toBeInTheDocument();
      });
    });
  
    it("NO llama a authApi.login si hay errores de validación", async () => {
      wrapWithAuth(<LoginForm />);
      fireEvent.click(screen.getByText("Entrar"));
      await waitFor(() => {
        expect(mockAuthLogin).not.toHaveBeenCalled();
      });
    });
  
    it("llama a authApi.login con email y password al enviar formulario válido", async () => {
      mockAuthLogin.mockResolvedValue({ data: { id: 1, token: "tok" } });
      wrapWithAuth(<LoginForm />);
  
      fireEvent.change(screen.getByLabelText("Email"), {
        target: { value: "jennifer@test.com", name: "email" },
      });
      fireEvent.change(screen.getByLabelText("Password"), {
        target: { value: "password123", name: "password" },
      });
      fireEvent.click(screen.getByText("Entrar"));
  
      await waitFor(() => {
        expect(mockAuthLogin).toHaveBeenCalledWith({
          email: "jennifer@test.com",
          password: "password123",
        });
      });
    });
  
    it("muestra error de email no encontrado en respuesta 404", async () => {
      mockAuthLogin.mockRejectedValue({ response: { status: 404 } });
      wrapWithAuth(<LoginForm />);
  
      fireEvent.change(screen.getByLabelText("Email"), {
        target: { value: "noexiste@test.com", name: "email" },
      });
      fireEvent.change(screen.getByLabelText("Password"), {
        target: { value: "password123", name: "password" },
      });
      fireEvent.click(screen.getByText("Entrar"));
  
      await waitFor(() => {
        expect(
          screen.getByText("No existe ninguna cuenta con este email")
        ).toBeInTheDocument();
      });
    });
  
    it("muestra error de contraseña incorrecta en respuesta 401", async () => {
      mockAuthLogin.mockRejectedValue({ response: { status: 401 } });
      wrapWithAuth(<LoginForm />);
  
      fireEvent.change(screen.getByLabelText("Email"), {
        target: { value: "jennifer@test.com", name: "email" },
      });
      fireEvent.change(screen.getByLabelText("Password"), {
        target: { value: "wrongpass", name: "password" },
      });
      fireEvent.click(screen.getByText("Entrar"));
  
      await waitFor(() => {
        expect(screen.getByText("Contraseña incorrecta")).toBeInTheDocument();
      });
    });
  
    it("muestra error global para errores distintos de 401/403/404", async () => {
      mockAuthLogin.mockRejectedValue({ response: { status: 500 } });
      wrapWithAuth(<LoginForm />);
  
      fireEvent.change(screen.getByLabelText("Email"), {
        target: { value: "jennifer@test.com", name: "email" },
      });
      fireEvent.change(screen.getByLabelText("Password"), {
        target: { value: "password123", name: "password" },
      });
      fireEvent.click(screen.getByText("Entrar"));
  
      await waitFor(() => {
        expect(screen.getByRole("alert")).toBeInTheDocument();
      });
    });
  
    it("muestra 'Entrando...' durante el submit", async () => {
      let resolve;
      mockAuthLogin.mockReturnValue(new Promise((res) => { resolve = res; }));
      wrapWithAuth(<LoginForm />);
  
      fireEvent.change(screen.getByLabelText("Email"), {
        target: { value: "jennifer@test.com", name: "email" },
      });
      fireEvent.change(screen.getByLabelText("Password"), {
        target: { value: "password123", name: "password" },
      });
      fireEvent.click(screen.getByText("Entrar"));
  
      await waitFor(() => {
        expect(screen.getByText("Entrando...")).toBeInTheDocument();
      });
      resolve({ data: { id: 1 } });
    });
  
    it("tiene el enlace de registro", () => {
      wrapWithAuth(<LoginForm />);
      expect(screen.getByText("aquí")).toBeInTheDocument();
    });
  });
  
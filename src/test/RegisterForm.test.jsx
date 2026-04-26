import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { AuthContext } from "../context/auth/AuthContext";
import RegisterForm from "../components/organisms/RegisterForm/RegisterForm";

const { mockAuthRegister, mockAuthLogin, mockUploadProfileImage } = vi.hoisted(() => ({
  mockAuthRegister: vi.fn(),
  mockAuthLogin: vi.fn(),
  mockUploadProfileImage: vi.fn(),
}));

const mockNavigate = vi.fn();
const mockLoginFn = vi.fn();

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock("../services/authApi", () => ({
  authApi: { register: mockAuthRegister, login: mockAuthLogin },
}));

vi.mock("../services/imagesApi", () => ({
  imagesApi: { uploadProfileImage: mockUploadProfileImage },
}));

vi.mock("../components/atoms/Button/Button", () => ({
  default: ({ text, onClick, type, disabled }) => (
    <button type={type ?? "button"} onClick={onClick} disabled={disabled}>
      {text}
    </button>
  ),
}));

const avatarProps = {};
vi.mock("../components/atoms/AvatarUpload/AvatarUpload", () => ({
  default: (props) => {
    Object.assign(avatarProps, props);
    return (
      <div>
        <button data-testid="avatar-select">Seleccionar avatar</button>
        <button data-testid="avatar-remove" onClick={props.onRemove}>
          Quitar avatar
        </button>
        {props.error && <p data-testid="avatar-error">{props.error}</p>}
        {props.preview && <img data-testid="avatar-preview" src={props.preview} alt="preview" />}
      </div>
    );
  },
}));

vi.mock("../components/atoms/Toast/Toast", () => ({
  default: (props) => (
    <div data-testid="toast">
      <span>{props.message}</span>
      <button data-testid="toast-close" onClick={props.onClose}>
        Cerrar toast
      </button>
    </div>
  ),
}));

const wrap = () =>
  render(
    <MemoryRouter>
      <AuthContext.Provider
        value={{ user: null, login: mockLoginFn, logout: vi.fn(), updateUser: vi.fn() }}
      >
        <RegisterForm />
      </AuthContext.Provider>
    </MemoryRouter>
  );

const fillRequiredFields = ({
  name = "Jennifer",
  firstName = "Cros",
  email = "jen@test.com",
  password = "password123",
} = {}) => {
  fireEvent.change(document.querySelector("input[name='name']"), {
    target: { value: name, name: "name" },
  });
  fireEvent.change(document.querySelector("input[name='firstName']"), {
    target: { value: firstName, name: "firstName" },
  });
  fireEvent.change(document.querySelector("input[name='email']"), {
    target: { value: email, name: "email" },
  });
  fireEvent.change(document.querySelector("input[name='password']"), {
    target: { value: password, name: "password" },
  });
};

const acceptTerms = () => fireEvent.click(screen.getByRole("checkbox"));
const submitForm = () => fireEvent.click(screen.getByText("Registrarse"));

describe("RegisterForm — Cobertura completa", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete window.location;
    window.location = { href: "" };
    vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:fake-url");
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renderiza todos los campos del formulario", () => {
    wrap();
    expect(screen.getByText("Nombre *")).toBeInTheDocument();
    expect(screen.getByText("Primer apellido *")).toBeInTheDocument();
    expect(screen.getByText("Segundo apellido")).toBeInTheDocument();
    expect(screen.getByText("Alias")).toBeInTheDocument();
    expect(screen.getByText("Email *")).toBeInTheDocument();
    expect(screen.getByText("Contraseña *")).toBeInTheDocument();
  });

  it("renderiza el botón de registro y cancelar", () => {
    wrap();
    expect(screen.getByText("Registrarse")).toBeInTheDocument();
    expect(screen.getByText("Cancelar")).toBeInTheDocument();
  });

  it("renderiza el enlace a política de privacidad", () => {
    wrap();
    expect(screen.getByText("políticas de privacidad")).toBeInTheDocument();
  });

  it("muestra error de nombre obligatorio al enviar vacío", async () => {
    wrap();
    submitForm();
    await waitFor(() =>
      expect(screen.getByText("El nombre es obligatorio")).toBeInTheDocument()
    );
  });

  it("muestra error de primer apellido obligatorio al enviar vacío", async () => {
    wrap();
    submitForm();
    await waitFor(() =>
      expect(screen.getByText("El primer apellido es obligatorio")).toBeInTheDocument()
    );
  });

  it("muestra error de email obligatorio al enviar vacío", async () => {
    wrap();
    submitForm();
    await waitFor(() =>
      expect(screen.getByText("El email es obligatorio")).toBeInTheDocument()
    );
  });

  it("muestra error de contraseña obligatoria al enviar vacío", async () => {
    wrap();
    submitForm();
    await waitFor(() =>
      expect(screen.getByText("La contraseña es obligatoria")).toBeInTheDocument()
    );
  });

  it("NO llama a authApi.register si hay errores de validación front-end", async () => {
    wrap();
    submitForm();
    await waitFor(() =>
      expect(screen.getByText("El nombre es obligatorio")).toBeInTheDocument()
    );
    expect(mockAuthRegister).not.toHaveBeenCalled();
  });

  it("muestra error de email inválido en onBlur", async () => {
    wrap();
    const emailInput = document.querySelector("input[name='email']");
    fireEvent.change(emailInput, { target: { value: "noemail", name: "email" } });
    fireEvent.blur(emailInput);
    await waitFor(() =>
      expect(screen.getByText("Formato de email inválido")).toBeInTheDocument()
    );
  });

  it("muestra error de contraseña corta en onBlur", async () => {
    wrap();
    const passInput = document.querySelector("input[name='password']");
    fireEvent.change(passInput, { target: { value: "abc", name: "password" } });
    fireEvent.blur(passInput);
    await waitFor(() =>
      expect(screen.getByText("Mínimo 6 caracteres")).toBeInTheDocument()
    );
  });

  it("limpia el serverError del campo al cambiar su valor (handleChange)", async () => {
    mockAuthRegister.mockRejectedValue({ response: { status: 409 } });
    wrap();
    fillRequiredFields();
    acceptTerms();
    submitForm();
    await waitFor(() =>
      expect(screen.getByText("Este email ya está registrado.")).toBeInTheDocument()
    );
    fireEvent.change(document.querySelector("input[name='email']"), {
      target: { value: "otro@test.com", name: "email" },
    });
    await waitFor(() =>
      expect(screen.queryByText("Este email ya está registrado.")).not.toBeInTheDocument()
    );
  });

  it("muestra error de términos cuando no se acepta el checkbox", async () => {
    wrap();
    fillRequiredFields();
    submitForm();
    await waitFor(() =>
      expect(
        screen.getByText("Debes aceptar las políticas de privacidad")
      ).toBeInTheDocument()
    );
  });

  it("llama a authApi.register con los datos correctos", async () => {
    mockAuthRegister.mockResolvedValue({ data: {} });
    mockAuthLogin.mockResolvedValue({ data: { id: 1 } });
    wrap();
    fillRequiredFields();
    acceptTerms();
    submitForm();
    await waitFor(() =>
      expect(mockAuthRegister).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Jennifer",
          firstName: "Cros",
          email: "jen@test.com",
          password: "password123",
          secondName: null,
          alias: null,
          profileImage: null,
        })
      )
    );
  });

  it("llama a authApi.login tras register exitoso", async () => {
    mockAuthRegister.mockResolvedValue({ data: {} });
    mockAuthLogin.mockResolvedValue({ data: { id: 1 } });
    wrap();
    fillRequiredFields();
    acceptTerms();
    submitForm();
    await waitFor(() =>
      expect(mockAuthLogin).toHaveBeenCalledWith({
        email: "jen@test.com",
        password: "password123",
      })
    );
  });

  it("llama a login() del contexto con authData", async () => {
    mockAuthRegister.mockResolvedValue({ data: {} });
    mockAuthLogin.mockResolvedValue({ data: { id: 1, token: "tok" } });
    wrap();
    fillRequiredFields();
    acceptTerms();
    submitForm();
    await waitFor(() =>
      expect(mockLoginFn).toHaveBeenCalledWith(expect.objectContaining({ id: 1 }))
    );
  });

  it("muestra el Toast de bienvenida tras registro exitoso", async () => {
    mockAuthRegister.mockResolvedValue({ data: {} });
    mockAuthLogin.mockResolvedValue({ data: { id: 1 } });
    wrap();
    fillRequiredFields();
    acceptTerms();
    submitForm();
    await waitFor(() =>
      expect(screen.getByText("¡Bienvenid@ a Code Crafters!")).toBeInTheDocument()
    );
  });

  it("redirige a /home/community al cerrar el Toast", async () => {
    mockAuthRegister.mockResolvedValue({ data: {} });
    mockAuthLogin.mockResolvedValue({ data: { id: 1 } });
    wrap();
    fillRequiredFields();
    acceptTerms();
    submitForm();
    await waitFor(() => screen.getByTestId("toast-close"));
    fireEvent.click(screen.getByTestId("toast-close"));
    expect(window.location.href).toBe("/home/community");
  });

  it("envía secondName y alias cuando se rellenan", async () => {
    mockAuthRegister.mockResolvedValue({ data: {} });
    mockAuthLogin.mockResolvedValue({ data: { id: 1 } });
    wrap();
    fillRequiredFields();
    fireEvent.change(document.querySelector("input[name='secondName']"), {
      target: { value: "García", name: "secondName" },
    });
    fireEvent.change(document.querySelector("input[name='alias']"), {
      target: { value: "jenny", name: "alias" },
    });
    acceptTerms();
    submitForm();
    await waitFor(() =>
      expect(mockAuthRegister).toHaveBeenCalledWith(
        expect.objectContaining({ secondName: "García", alias: "jenny" })
      )
    );
  });

  it("sube el avatar cuando hay avatarFile y userId", async () => {
    const fakeFile = new File(["img"], "avatar.png", { type: "image/png" });
    mockAuthRegister.mockResolvedValue({ data: {} });
    mockAuthLogin.mockResolvedValue({ data: { id: 42 } });
    mockUploadProfileImage.mockResolvedValue({
      data: { imageUrl: "http://localhost:8080/img/avatar.png" },
    });
    wrap();
    act(() => avatarProps.onFileSelect(fakeFile, null));
    fillRequiredFields();
    acceptTerms();
    submitForm();
    await waitFor(() =>
      expect(mockUploadProfileImage).toHaveBeenCalledWith(42, fakeFile)
    );
  });

  it("reemplaza localhost:5173 por localhost:8080 en la URL del avatar", async () => {
    const fakeFile = new File(["img"], "avatar.png", { type: "image/png" });
    mockAuthRegister.mockResolvedValue({ data: {} });
    mockAuthLogin.mockResolvedValue({ data: { id: 42 } });
    mockUploadProfileImage.mockResolvedValue({
      data: { imageUrl: "http://localhost:5173/img/avatar.png" },
    });
    wrap();
    act(() => avatarProps.onFileSelect(fakeFile, null));
    fillRequiredFields();
    acceptTerms();
    submitForm();
    await waitFor(() =>
      expect(mockLoginFn).toHaveBeenCalledWith(
        expect.objectContaining({
          profileImage: "http://localhost:8080/img/avatar.png",
        })
      )
    );
  });

  it("acepta imageUrl como string directo en uploadRes.data", async () => {
    const fakeFile = new File(["img"], "avatar.png", { type: "image/png" });
    mockAuthRegister.mockResolvedValue({ data: {} });
    mockAuthLogin.mockResolvedValue({ data: { id: 42 } });
    mockUploadProfileImage.mockResolvedValue({
      data: "http://localhost:8080/img/avatar.png",
    });
    wrap();
    act(() => avatarProps.onFileSelect(fakeFile, null));
    fillRequiredFields();
    acceptTerms();
    submitForm();
    await waitFor(() =>
      expect(mockLoginFn).toHaveBeenCalledWith(
        expect.objectContaining({
          profileImage: "http://localhost:8080/img/avatar.png",
        })
      )
    );
  });

  it("continúa el registro aunque falle la subida del avatar", async () => {
    const fakeFile = new File(["img"], "avatar.png", { type: "image/png" });
    mockAuthRegister.mockResolvedValue({ data: {} });
    mockAuthLogin.mockResolvedValue({ data: { id: 42 } });
    mockUploadProfileImage.mockRejectedValue(new Error("upload failed"));
    wrap();
    act(() => avatarProps.onFileSelect(fakeFile, null));
    fillRequiredFields();
    acceptTerms();
    submitForm();
    await waitFor(() => expect(mockLoginFn).toHaveBeenCalled());
    await waitFor(() =>
      expect(screen.getByText("¡Bienvenid@ a Code Crafters!")).toBeInTheDocument()
    );
  });

  it("no sube avatar si no hay userId en la respuesta de login", async () => {
    const fakeFile = new File(["img"], "avatar.png", { type: "image/png" });
    mockAuthRegister.mockResolvedValue({ data: {} });
    mockAuthLogin.mockResolvedValue({ data: { token: "tok" } });
    wrap();
    act(() => avatarProps.onFileSelect(fakeFile, null));
    fillRequiredFields();
    acceptTerms();
    submitForm();
    await waitFor(() => expect(mockLoginFn).toHaveBeenCalled());
    expect(mockUploadProfileImage).not.toHaveBeenCalled();
  });

  it("usa authData.userId si no hay authData.id", async () => {
    const fakeFile = new File(["img"], "avatar.png", { type: "image/png" });
    mockAuthRegister.mockResolvedValue({ data: {} });
    mockAuthLogin.mockResolvedValue({ data: { userId: 99 } });
    mockUploadProfileImage.mockResolvedValue({
      data: { imageUrl: "http://localhost:8080/img/x.png" },
    });
    wrap();
    act(() => avatarProps.onFileSelect(fakeFile, null));
    fillRequiredFields();
    acceptTerms();
    submitForm();
    await waitFor(() =>
      expect(mockUploadProfileImage).toHaveBeenCalledWith(99, fakeFile)
    );
  });

  it("muestra error de avatar cuando onFileSelect recibe un error", () => {
    wrap();
    act(() => avatarProps.onFileSelect(null, "Formato no soportado"));
    expect(screen.getByTestId("avatar-error")).toHaveTextContent("Formato no soportado");
  });

  it("quita el avatar al llamar a onRemove", () => {
    const fakeFile = new File(["img"], "avatar.png", { type: "image/png" });
    wrap();
    act(() => avatarProps.onFileSelect(fakeFile, null));
    expect(URL.createObjectURL).toHaveBeenCalledWith(fakeFile);
    fireEvent.click(screen.getByTestId("avatar-remove"));
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:fake-url");
  });

  it("revoca la URL del preview anterior al seleccionar un nuevo avatar", () => {
    const file1 = new File(["a"], "a.png", { type: "image/png" });
    const file2 = new File(["b"], "b.png", { type: "image/png" });
    wrap();
    act(() => avatarProps.onFileSelect(file1, null));
    act(() => avatarProps.onFileSelect(file2, null));
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:fake-url");
  });

  it("muestra 'Registrando...' durante el submit", async () => {
    let resolveRegister;
    mockAuthRegister.mockReturnValue(new Promise((res) => { resolveRegister = res; }));
    wrap();
    fillRequiredFields();
    acceptTerms();
    submitForm();
    await waitFor(() =>
      expect(screen.getByText("Registrando...")).toBeInTheDocument()
    );
    resolveRegister({ data: {} });
  });

  it("deshabilita el botón de envío mientras carga", async () => {
    let resolveRegister;
    mockAuthRegister.mockReturnValue(new Promise((res) => { resolveRegister = res; }));
    wrap();
    fillRequiredFields();
    acceptTerms();
    submitForm();
    await waitFor(() =>
      expect(screen.getByText("Registrando...").closest("button")).toBeDisabled()
    );
    resolveRegister({ data: {} });
  });

  it("muestra error de email duplicado cuando el servidor responde 409", async () => {
    mockAuthRegister.mockRejectedValue({ response: { status: 409 } });
    wrap();
    fillRequiredFields();
    acceptTerms();
    submitForm();
    await waitFor(() =>
      expect(screen.getByText("Este email ya está registrado.")).toBeInTheDocument()
    );
  });

  it("muestra errores de campo cuando el servidor responde 400 con objeto de errores", async () => {
    mockAuthRegister.mockRejectedValue({
      response: {
        status: 400,
        data: { name: "Nombre no válido", email: "Email incorrecto" },
      },
    });
    wrap();
    fillRequiredFields();
    acceptTerms();
    submitForm();
    await waitFor(() => {
      expect(screen.getByText("Nombre no válido")).toBeInTheDocument();
      expect(screen.getByText("Email incorrecto")).toBeInTheDocument();
    });
  });

  it("muestra error global para errores de servidor que no son 400 ni 409", async () => {
    mockAuthRegister.mockRejectedValue({ response: { status: 500 } });
    wrap();
    fillRequiredFields();
    acceptTerms();
    submitForm();
    await waitFor(() =>
      expect(
        screen.getByText("Hubo un error al procesar el registro.")
      ).toBeInTheDocument()
    );
  });

  it("muestra error global cuando no hay response (error de red)", async () => {
    mockAuthRegister.mockRejectedValue(new Error("Network Error"));
    wrap();
    fillRequiredFields();
    acceptTerms();
    submitForm();
    await waitFor(() =>
      expect(
        screen.getByText("Hubo un error al procesar el registro.")
      ).toBeInTheDocument()
    );
  });
});

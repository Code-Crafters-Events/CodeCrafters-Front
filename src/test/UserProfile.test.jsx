import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import UserProfile from "../components/organisms/UserProfile/UserProfile";
import { AuthContext } from "../context/auth/AuthContext";

const { mockUsersUpdateProfile, mockUsersDelete, mockImagesUploadProfile } =
  vi.hoisted(() => ({
    mockUsersUpdateProfile: vi.fn(),
    mockUsersDelete: vi.fn(),
    mockImagesUploadProfile: vi.fn(),
  }));

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ id: "1" }),
  };
});
vi.mock("react-router", async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock("../services/usersApi", () => ({
  usersApi: {
    updateProfile: mockUsersUpdateProfile,
    delete: mockUsersDelete,
  },
}));

vi.mock("../services/imagesApi", () => ({
  imagesApi: { uploadProfileImage: mockImagesUploadProfile },
}));

const mockUser = {
  id: 1,
  name: "Jennifer",
  firstName: "Cros",
  email: "jen@test.com",
  alias: "jen",
  secondName: "",
  profileImage: null,
};

const wrapEventDetail = (user = null) =>
  render(
    <MemoryRouter initialEntries={["/home/info/1"]}>
      <AuthContext.Provider value={{ user, login: vi.fn(), logout: vi.fn() }}>
        <Routes>
          <Route path="/home/info/:id" element={<EventDetail />} />
          <Route path="/home/community" element={<div>Comunidad</div>} />
          <Route path="/home/login" element={<div>Login</div>} />
        </Routes>
      </AuthContext.Provider>
    </MemoryRouter>,
  );

const wrapWithAuth = (ui, user = mockUser) =>
  render(
    <MemoryRouter>
      <AuthContext.Provider
        value={{ user, login: vi.fn(), logout: vi.fn(), updateUser: vi.fn() }}
      >
        {ui}
      </AuthContext.Provider>
    </MemoryRouter>,
  );

describe("UserProfile", () => {
  beforeEach(() => vi.clearAllMocks());

  it("no renderiza nada cuando user es null", () => {
    const { container } = wrapWithAuth(<UserProfile />, null);
    expect(container.firstChild).toBeNull();
  });

  it("muestra el título 'Mi perfil'", () => {
    wrapWithAuth(<UserProfile />);
    expect(screen.getByText("Mi perfil")).toBeInTheDocument();
  });

  it("renderiza los campos editables del perfil", () => {
    wrapWithAuth(<UserProfile />);
    expect(screen.getByText("Nombre")).toBeInTheDocument();
    expect(screen.getByText("Primer apellido")).toBeInTheDocument();
    expect(screen.getByText("Email")).toBeInTheDocument();
    expect(screen.getByText("Contraseña")).toBeInTheDocument();
  });

  it("muestra el valor del nombre en el campo", () => {
    wrapWithAuth(<UserProfile />);
    expect(screen.getByText("Jennifer")).toBeInTheDocument();
  });

  it("muestra el botón 'Ir a Comunidad'", () => {
    wrapWithAuth(<UserProfile />);
    expect(screen.getByText("Ir a Comunidad")).toBeInTheDocument();
  });

  it("muestra el botón 'Eliminar Cuenta'", () => {
    wrapWithAuth(<UserProfile />);
    expect(screen.getByText("Eliminar Cuenta")).toBeInTheDocument();
  });

  it("navega a /home/community al hacer click en 'Ir a Comunidad'", () => {
    wrapWithAuth(<UserProfile />);
    fireEvent.click(screen.getByText("Ir a Comunidad"));
    expect(mockNavigate).toHaveBeenCalledWith("/home/community");
  });

  it("abre el modal de confirmación al hacer click en 'Eliminar Cuenta'", () => {
    wrapWithAuth(<UserProfile />);
    fireEvent.click(screen.getByText("Eliminar Cuenta"));
    expect(
      screen.getByText("¿Estás segur@ de que quieres eliminar tu cuenta?"),
    ).toBeInTheDocument();
  });

  it("llama a usersApi.delete al confirmar eliminación de cuenta", async () => {
    mockUsersDelete.mockResolvedValue({});
    wrapWithAuth(<UserProfile />);
    fireEvent.click(screen.getByText("Eliminar Cuenta"));
    const confirmButton = screen
      .getAllByRole("button", { name: /eliminar cuenta/i })
      .find((btn) => btn.className.includes("danger"));
    fireEvent.click(confirmButton);
    await waitFor(() => {
      expect(mockUsersDelete).toHaveBeenCalledWith(mockUser.id);
    });
  });

  it("cierra el modal de eliminación al hacer click en Cancelar", () => {
    wrapWithAuth(<UserProfile />);
    fireEvent.click(screen.getByText("Eliminar Cuenta"));
    expect(
      screen.getByText("¿Estás segur@ de que quieres eliminar tu cuenta?"),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByText("Cancelar"));
    expect(
      screen.queryByText("¿Estás segur@ de que quieres eliminar tu cuenta?"),
    ).not.toBeInTheDocument();
  });

  it("muestra error en avatar cuando el tipo de archivo no es válido", () => {
    wrapWithAuth(<UserProfile />);
    const input = screen.getByLabelText("Seleccionar foto de perfil");
    const badFile = new File(["x"], "doc.pdf", { type: "application/pdf" });
    fireEvent.change(input, { target: { files: [badFile] } });
    expect(
      screen.getByText("Solo se permiten imágenes JPG, PNG, WEBP o GIF"),
    ).toBeInTheDocument();
  });

  it("muestra el botón 'Guardar foto' al seleccionar una imagen válida", () => {
    wrapWithAuth(<UserProfile />);
    const input = screen.getByLabelText("Seleccionar foto de perfil");
    const validFile = new File(["x"], "foto.jpg", { type: "image/jpeg" });
    Object.defineProperty(validFile, "size", { value: 1024 });
    fireEvent.change(input, { target: { files: [validFile] } });
    expect(screen.getByText("Guardar foto")).toBeInTheDocument();
  });

  it("llama a imagesApi.uploadProfileImage al hacer click en 'Guardar foto'", async () => {
    mockImagesUploadProfile.mockResolvedValue({
      data: { imageUrl: "https://cloudinary.com/nueva.jpg" },
    });
    wrapWithAuth(<UserProfile />);
    const input = screen.getByLabelText("Seleccionar foto de perfil");
    const validFile = new File(["x"], "foto.jpg", { type: "image/jpeg" });
    Object.defineProperty(validFile, "size", { value: 1024 });
    fireEvent.change(input, { target: { files: [validFile] } });
    fireEvent.click(screen.getByText("Guardar foto"));
    await waitFor(() => {
      expect(mockImagesUploadProfile).toHaveBeenCalledWith(
        mockUser.id,
        validFile,
      );
    });
  });

  it("muestra la inicial del usuario como placeholder del avatar", () => {
    wrapWithAuth(<UserProfile />);
    expect(screen.getByText("J")).toBeInTheDocument();
  });

  it("muestra error de toast cuando falla la subida de imagen", async () => {
    mockImagesUploadProfile.mockRejectedValue(new Error("upload failed"));
    wrapWithAuth(<UserProfile />);
    const input = screen.getByLabelText("Seleccionar foto de perfil");
    const validFile = new File(["x"], "foto.jpg", { type: "image/jpeg" });
    Object.defineProperty(validFile, "size", { value: 1024 });
    fireEvent.change(input, { target: { files: [validFile] } });
    fireEvent.click(screen.getByText("Guardar foto"));
    await waitFor(() => {
      expect(
        screen.getByText("No se pudo subir la imagen."),
      ).toBeInTheDocument();
    });
  });
});

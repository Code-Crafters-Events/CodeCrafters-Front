import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
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
  return { ...actual, useNavigate: () => mockNavigate };
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
  secondName: "García",
  profileImage: null,
};

const mockUpdateUser = vi.fn();
const mockLogout = vi.fn();
const wrapWithAuth = (user = mockUser) =>
  render(
    <MemoryRouter>
      <AuthContext.Provider
        value={{
          user,
          login: vi.fn(),
          logout: mockLogout,
          updateUser: mockUpdateUser,
        }}
      >
        <UserProfile />
      </AuthContext.Provider>
    </MemoryRouter>
  );

const selectValidFile = () => {
  const input = screen.getByLabelText("Seleccionar foto de perfil");
  const file = new File(["x"], "foto.jpg", { type: "image/jpeg" });
  Object.defineProperty(file, "size", { value: 1024 });
  fireEvent.change(input, { target: { files: [file] } });
  return file;
};

const editField = async (label, newValue) => {
  fireEvent.click(screen.getByLabelText(`Editar ${label}`));
  const input = await waitFor(() => {
    const el = document.querySelector(
      `input[type='text'], input[type='password'], input[type='email']`
    );
    if (!el) throw new Error("input no encontrado");
    return el;
  });
  fireEvent.change(input, { target: { value: newValue } });
  fireEvent.keyDown(input, { key: "Enter" });
};

describe("UserProfile — cobertura 100%", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:fake-url");
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
  });

  it("no renderiza nada cuando user es null", () => {
    const { container } = wrapWithAuth(null);
    expect(container.firstChild).toBeNull();
  });

  it("muestra el título 'Mi perfil'", () => {
    wrapWithAuth();
    expect(screen.getByText("Mi perfil")).toBeInTheDocument();
  });

  it("reemplaza localhost:5173 por localhost:8080 en profileImage al montar", () => {
    wrapWithAuth({ ...mockUser, profileImage: "http://localhost:5173/img.jpg" });
    const img = screen.getByAltText("Vista previa");
    expect(img.src).toContain("localhost:8080");
    expect(img.src).not.toContain("localhost:5173");
  });

  it("no renderiza preview cuando profileImage es null", () => {
    wrapWithAuth({ ...mockUser, profileImage: null });
    expect(screen.queryByAltText("Vista previa")).not.toBeInTheDocument();
  });

  it("actualiza el avatarPreview cuando cambia user.profileImage (useEffect)", () => {
    const { rerender } = wrapWithAuth({ ...mockUser, profileImage: null });
    expect(screen.queryByAltText("Vista previa")).not.toBeInTheDocument();

    rerender(
      <MemoryRouter>
        <AuthContext.Provider
          value={{
            user: { ...mockUser, profileImage: "http://localhost:8080/nueva.jpg" },
            login: vi.fn(),
            logout: mockLogout,
            updateUser: mockUpdateUser,
          }}
        >
          <UserProfile />
        </AuthContext.Provider>
      </MemoryRouter>
    );

    expect(screen.getByAltText("Vista previa")).toBeInTheDocument();
  });

  it("renderiza todos los campos editables", () => {
    wrapWithAuth();
    ["Nombre", "Primer apellido", "Segundo apellido", "Alias", "Email", "Contraseña"].forEach(
      (label) => expect(screen.getByText(label)).toBeInTheDocument()
    );
  });

  it("muestra los valores del usuario en los campos", () => {
    wrapWithAuth();
    expect(screen.getByText("Jennifer")).toBeInTheDocument();
    expect(screen.getByText("jen@test.com")).toBeInTheDocument();
    expect(screen.getByText("jen")).toBeInTheDocument();
  });

  it("muestra la inicial del nombre como placeholder del avatar", () => {
    wrapWithAuth();
    expect(screen.getByText("J")).toBeInTheDocument();
  });

  it("muestra '?' cuando user.name está vacío", () => {
    wrapWithAuth({ ...mockUser, name: "" });
    expect(screen.getByText("?")).toBeInTheDocument();
  });

  it("navega a /home/community al hacer click en 'Ir a Comunidad'", () => {
    wrapWithAuth();
    fireEvent.click(screen.getByText("Ir a Comunidad"));
    expect(mockNavigate).toHaveBeenCalledWith("/home/community");
  });

  it("saveField 'Nombre' → llama a updateProfile y muestra toast 'Perfil actualizado.'", async () => {
    mockUsersUpdateProfile.mockResolvedValue({ data: mockUser });
    wrapWithAuth();
    await editField("Nombre", "Nuevo Nombre");
    await waitFor(() => {
      expect(screen.getByText("Perfil actualizado.")).toBeInTheDocument();
    });
    expect(mockUsersUpdateProfile).toHaveBeenCalledWith(
      mockUser.id,
      expect.objectContaining({ name: "Nuevo Nombre" })
    );
  });

  it("saveField 'Primer apellido' → muestra toast 'Perfil actualizado.'", async () => {
    mockUsersUpdateProfile.mockResolvedValue({ data: mockUser });
    wrapWithAuth();
    await editField("Primer apellido", "Nuevo Apellido");
    await waitFor(() => {
      expect(screen.getByText("Perfil actualizado.")).toBeInTheDocument();
    });
    expect(mockUsersUpdateProfile).toHaveBeenCalledWith(
      mockUser.id,
      expect.objectContaining({ firstName: "Nuevo Apellido" })
    );
  });

  it("saveField 'Segundo apellido' → muestra toast 'Perfil actualizado.'", async () => {
    mockUsersUpdateProfile.mockResolvedValue({ data: mockUser });
    wrapWithAuth();
    await editField("Segundo apellido", "Segundo Nuevo");
    await waitFor(() => {
      expect(screen.getByText("Perfil actualizado.")).toBeInTheDocument();
    });
    expect(mockUsersUpdateProfile).toHaveBeenCalledWith(
      mockUser.id,
      expect.objectContaining({ secondName: "Segundo Nuevo" })
    );
  });

  it("saveField 'Alias' → muestra toast 'Perfil actualizado.'", async () => {
    mockUsersUpdateProfile.mockResolvedValue({ data: mockUser });
    wrapWithAuth();
    await editField("Alias", "nuevoalias");
    await waitFor(() => {
      expect(screen.getByText("Perfil actualizado.")).toBeInTheDocument();
    });
    expect(mockUsersUpdateProfile).toHaveBeenCalledWith(
      mockUser.id,
      expect.objectContaining({ alias: "nuevoalias" })
    );
  });

  it("saveField 'Email' → muestra toast 'Perfil actualizado.'", async () => {
    mockUsersUpdateProfile.mockResolvedValue({ data: mockUser });
    wrapWithAuth();
    await editField("Email", "nuevo@test.com");
    await waitFor(() => {
      expect(screen.getByText("Perfil actualizado.")).toBeInTheDocument();
    });
    expect(mockUsersUpdateProfile).toHaveBeenCalledWith(
      mockUser.id,
      expect.objectContaining({ email: "nuevo@test.com" })
    );
  });

  it("saveField 'Contraseña' → muestra toast 'Contraseña actualizada.'", async () => {
    mockUsersUpdateProfile.mockResolvedValue({ data: mockUser });
    wrapWithAuth();
    await editField("Contraseña", "nuevapass123");
    await waitFor(() => {
      expect(screen.getByText("Contraseña actualizada.")).toBeInTheDocument();
    });
    expect(mockUsersUpdateProfile).toHaveBeenCalledWith(
      mockUser.id,
      expect.objectContaining({ password: "nuevapass123" })
    );
  });

  it("saveField llama a updateUser con los datos de la respuesta", async () => {
    const updatedUser = { ...mockUser, name: "NuevoNombre" };
    mockUsersUpdateProfile.mockResolvedValue({ data: updatedUser });
    wrapWithAuth();
    await editField("Nombre", "NuevoNombre");
    await waitFor(() => {
      expect(mockUpdateUser).toHaveBeenCalledWith(updatedUser);
    });
  });

  it("saveField muestra toast de error cuando falla la API", async () => {
    mockUsersUpdateProfile.mockRejectedValue(new Error("API error"));
    wrapWithAuth();
    await editField("Nombre", "Otro nombre");
    await waitFor(() => {
      expect(
        screen.getByText("Error al actualizar los datos.")
      ).toBeInTheDocument();
    });
  });

  it("cierra el toast al hacer click en el botón de cierre", async () => {
    mockUsersUpdateProfile.mockResolvedValue({ data: mockUser });
    wrapWithAuth();
    await editField("Nombre", "Nombre nuevo");
    await waitFor(() => screen.getByText("Perfil actualizado."));
    fireEvent.click(screen.getByLabelText("Cerrar notificación"));
    await waitFor(() => {
      expect(screen.queryByText("Perfil actualizado.")).not.toBeInTheDocument();
    });
  });

  it("muestra error de avatar cuando el tipo de archivo no es válido", () => {
    wrapWithAuth();
    const input = screen.getByLabelText("Seleccionar foto de perfil");
    const badFile = new File(["x"], "doc.pdf", { type: "application/pdf" });
    fireEvent.change(input, { target: { files: [badFile] } });
    expect(
      screen.getByText("Solo se permiten imágenes JPG, PNG, WEBP o GIF")
    ).toBeInTheDocument();
  });

  it("muestra la preview del avatar al seleccionar un archivo válido", () => {
    wrapWithAuth();
    selectValidFile();
    expect(screen.getByAltText("Vista previa")).toBeInTheDocument();
  });

  it("revoca la URL blob anterior al seleccionar un segundo archivo", () => {
    wrapWithAuth();
    selectValidFile();
    selectValidFile();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:fake-url");
  });

  it("muestra el botón 'Guardar foto' al seleccionar imagen válida", () => {
    wrapWithAuth();
    selectValidFile();
    expect(screen.getByText("Guardar foto")).toBeInTheDocument();
  });

  it("llama a uploadProfileImage al hacer click en 'Guardar foto'", async () => {
    mockImagesUploadProfile.mockResolvedValue({
      data: { imageUrl: "https://cloudinary.com/nueva.jpg" },
    });
    wrapWithAuth();
    const file = selectValidFile();
    fireEvent.click(screen.getByText("Guardar foto"));
    await waitFor(() => {
      expect(mockImagesUploadProfile).toHaveBeenCalledWith(mockUser.id, file);
    });
  });

  it("llama a updateUser con la nueva URL tras subir el avatar", async () => {
    mockImagesUploadProfile.mockResolvedValue({
      data: { imageUrl: "https://cloudinary.com/nueva.jpg" },
    });
    wrapWithAuth();
    selectValidFile();
    fireEvent.click(screen.getByText("Guardar foto"));
    await waitFor(() => {
      expect(mockUpdateUser).toHaveBeenCalledWith({
        profileImage: "https://cloudinary.com/nueva.jpg",
      });
    });
  });

  it("muestra toast de éxito tras subir el avatar", async () => {
    mockImagesUploadProfile.mockResolvedValue({
      data: { imageUrl: "https://cloudinary.com/nueva.jpg" },
    });
    wrapWithAuth();
    selectValidFile();
    fireEvent.click(screen.getByText("Guardar foto"));
    await waitFor(() => {
      expect(screen.getByText("Foto de perfil actualizada.")).toBeInTheDocument();
    });
  });

  it("oculta el botón 'Guardar foto' tras subir correctamente (avatarFile → null)", async () => {
    mockImagesUploadProfile.mockResolvedValue({
      data: { imageUrl: "https://cloudinary.com/nueva.jpg" },
    });
    wrapWithAuth();
    selectValidFile();
    fireEvent.click(screen.getByText("Guardar foto"));
    await waitFor(() => {
      expect(screen.queryByText("Guardar foto")).not.toBeInTheDocument();
    });
  });

  it("muestra toast de error cuando falla la subida del avatar", async () => {
    mockImagesUploadProfile.mockRejectedValue(new Error("upload failed"));
    wrapWithAuth();
    selectValidFile();
    fireEvent.click(screen.getByText("Guardar foto"));
    await waitFor(() => {
      expect(screen.getByText("No se pudo subir la imagen.")).toBeInTheDocument();
    });
  });

  it("llama a updateProfile con profileImage null al eliminar avatar con URL http", async () => {
    const userWithImage = { ...mockUser, profileImage: "http://localhost:8080/img.jpg" };
    mockUsersUpdateProfile.mockResolvedValue({ data: userWithImage });
    wrapWithAuth(userWithImage);
    fireEvent.click(screen.getByText("Eliminar"));
    await waitFor(() => {
      expect(mockUsersUpdateProfile).toHaveBeenCalledWith(
        mockUser.id,
        expect.objectContaining({ profileImage: null })
      );
    });
  });

  it("muestra toast de éxito al eliminar el avatar", async () => {
    const userWithImage = { ...mockUser, profileImage: "http://localhost:8080/img.jpg" };
    mockUsersUpdateProfile.mockResolvedValue({ data: userWithImage });
    wrapWithAuth(userWithImage);
    fireEvent.click(screen.getByText("Eliminar"));
    await waitFor(() => {
      expect(screen.getByText("Foto de perfil eliminada.")).toBeInTheDocument();
    });
  });

  it("revoca la URL blob al eliminar avatar cuando la preview es blob", async () => {
    wrapWithAuth();
    selectValidFile();
    mockUsersUpdateProfile.mockResolvedValue({ data: mockUser });
    fireEvent.click(screen.getByText("Eliminar"));
    await waitFor(() => {
      expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:fake-url");
    });
  });

  it("muestra toast de error cuando falla la eliminación del avatar", async () => {
    const userWithImage = { ...mockUser, profileImage: "http://localhost:8080/img.jpg" };
    mockUsersUpdateProfile.mockRejectedValue(new Error("delete failed"));
    wrapWithAuth(userWithImage);
    fireEvent.click(screen.getByText("Eliminar"));
    await waitFor(() => {
      expect(screen.getByText("No se pudo eliminar la foto.")).toBeInTheDocument();
    });
  });

  it("abre el modal de confirmación al hacer click en 'Eliminar Cuenta'", () => {
    wrapWithAuth();
    fireEvent.click(screen.getByText("Eliminar Cuenta"));
    expect(
      screen.getByText("¿Estás segur@ de que quieres eliminar tu cuenta?")
    ).toBeInTheDocument();
  });

  it("cierra el modal al hacer click en 'Cancelar'", () => {
    wrapWithAuth();
    fireEvent.click(screen.getByText("Eliminar Cuenta"));
    fireEvent.click(screen.getByText("Cancelar"));
    expect(
      screen.queryByText("¿Estás segur@ de que quieres eliminar tu cuenta?")
    ).not.toBeInTheDocument();
  });

  it("llama a usersApi.delete, logout y navega a /home/login al confirmar", async () => {
  mockUsersDelete.mockResolvedValue({});
  wrapWithAuth();
  fireEvent.click(screen.getByText("Eliminar Cuenta"));
  const allDeleteBtns = screen.getAllByRole("button", { name: /eliminar cuenta/i });
  fireEvent.click(allDeleteBtns[allDeleteBtns.length - 1]);
  await waitFor(() => {
    expect(mockUsersDelete).toHaveBeenCalledWith(mockUser.id);
    expect(mockLogout).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith("/home/login");
  });
});

it("muestra toast de error cuando falla la eliminación de cuenta", async () => {
  mockUsersDelete.mockRejectedValue(new Error("delete failed"));
  wrapWithAuth();
  fireEvent.click(screen.getByText("Eliminar Cuenta"));
  const allDeleteBtns = screen.getAllByRole("button", { name: /eliminar cuenta/i });
  fireEvent.click(allDeleteBtns[allDeleteBtns.length - 1]);
  await waitFor(() => {
    expect(
      screen.getByText("No se pudo eliminar la cuenta.")
    ).toBeInTheDocument();
  });
  expect(mockLogout).not.toHaveBeenCalled();
});
});

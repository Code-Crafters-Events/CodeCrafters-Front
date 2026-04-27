import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./UserProfile.module.css";
import EditableField from "../../atoms/EditableField/EditableField";
import AvatarUpload from "../../atoms/AvatarUpload/AvatarUpload";
import Toast from "../../atoms/Toast/Toast";
import Button from "../../atoms/Button/Button";
import MessageModal from "../MessageModal/MessageModal";
import { usersApi } from "../../../services/usersApi";
import { imagesApi } from "../../../services/imagesApi";
import { AuthContext } from "../../../context/auth/AuthContext";
import WarningIcon from "../../../assets/warning.png";

const resolveUrl = (url) => {
  if (!url) return null;
  return url.replace("http://localhost:5173", "http://localhost:8080");
};

const UserProfile = () => {
  const { user, updateUser, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(
    resolveUrl(user?.profileImage),
  );
  const [avatarError, setAvatarError] = useState("");
  const [toast, setToast] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    setAvatarPreview(resolveUrl(user?.profileImage));
  }, [user]);

  if (!user) return null;

  const saveField = async (field, value) => {
    try {
      const payload = {
        name: field === "name" ? value : user.name,
        firstName: field === "firstName" ? value : user.firstName,
        secondName: field === "secondName" ? value : user.secondName || "",
        alias: field === "alias" ? value : user.alias || "",
        email: field === "email" ? value : user.email,
        profileImage: user.profileImage || null,
        password: field === "password" ? value : null,
      };

      const res = await usersApi.updateProfile(user.id, payload);
      updateUser({ ...res.data });

      setToast({
        message:
          field === "password"
            ? "Contraseña actualizada."
            : "Perfil actualizado.",
        type: "success",
      });
    } catch (error) {
      setToast({ message: "Error al actualizar los datos.", type: "error" });
      throw new Error("save failed");
    }
  };

  const handleFileSelect = (file, error) => {
    if (error) {
      setAvatarError(error);
      return;
    }
    if (avatarPreview?.startsWith("blob:")) URL.revokeObjectURL(avatarPreview);
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    setAvatarError("");
  };

  const handleRemoveAvatar = async () => {
    try {
      const payload = {
        name: user.name,
        firstName: user.firstName,
        secondName: user.secondName || "",
        alias: user.alias || "",
        email: user.email,
        profileImage: null,
      };

      const res = await usersApi.updateProfile(user.id, payload);
      updateUser({ ...res.data });

      if (avatarPreview?.startsWith("blob:"))
        URL.revokeObjectURL(avatarPreview);
      setAvatarFile(null);
      setAvatarPreview(null);
      setToast({ message: "Foto de perfil eliminada.", type: "success" });
    } catch (error) {
      setToast({ message: "No se pudo eliminar la foto.", type: "error" });
    }
  };

  const handleSaveAvatar = async () => {
    if (!avatarFile) return;
    try {
      const res = await imagesApi.uploadProfileImage(user.id, avatarFile);
      const newUrl = res.data.imageUrl;
      updateUser({ profileImage: newUrl });
      setAvatarFile(null);
      setToast({ message: "Foto de perfil actualizada.", type: "success" });
    } catch {
      setToast({ message: "No se pudo subir la imagen.", type: "error" });
    }
  };

  const confirmDeleteAccount = async () => {
    try {
      await usersApi.delete(user.id);
      setShowDeleteModal(false);
      logout();
      navigate("/home/login");
    } catch (error) {
      setToast({ message: "No se pudo eliminar la cuenta.", type: "error" });
    }
  };

  return (
    <section className={styles.container}>
      <h1 className={styles.title}>Mi perfil</h1>
      <div className={styles.card}>
        <div className={styles.avatarSection}>
          <AvatarUpload
            preview={avatarPreview}
            placeholderLetter={user.name?.[0]?.toUpperCase() ?? "?"}
            onFileSelect={handleFileSelect}
            onRemove={handleRemoveAvatar}
            error={avatarError}
          />
          {avatarFile && (
            <Button
              text="Guardar foto"
              BtnClass="neon"
              onClick={handleSaveAvatar}
            />
          )}
        </div>

        <div className={styles.fields}>
          <EditableField
            label="Nombre"
            value={user.name}
            onSave={(val) => saveField("name", val)}
          />
          <EditableField
            label="Primer apellido"
            value={user.firstName}
            onSave={(val) => saveField("firstName", val)}
          />
          <EditableField
            label="Segundo apellido"
            value={user.secondName}
            placeholder="Sin especificar"
            onSave={(val) => saveField("secondName", val)}
          />
          <EditableField
            label="Alias"
            value={user.alias}
            placeholder="Escribe un alias"
            onSave={(val) => saveField("alias", val)}
          />
          <EditableField
            label="Email"
            value={user.email}
            onSave={(val) => saveField("email", val)}
          />
          <EditableField
            label="Contraseña"
            value=""
            placeholder="Escribir nueva contraseña"
            type="password"
            onSave={(val) => saveField("password", val)}
          />
        </div>

        <div className={styles.actions}>
          <Button
            text="Ir a Comunidad"
            BtnClass="ghost"
            onClick={() => navigate("/home/community")}
          />
          <Button
            text="Eliminar Cuenta"
            BtnClass="delete"
            onClick={() => setShowDeleteModal(true)}
          />
        </div>
      </div>

      {showDeleteModal && (
        <MessageModal
          image={WarningIcon}
          message="¿Estás segur@ de que quieres eliminar tu cuenta?"
          btnText="Eliminar Cuenta"
          btnClass="danger"
          onConfirm={confirmDeleteAccount}
          onClose={() => setShowDeleteModal(false)}
        />
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          duration={3000}
          onClose={() => setToast(null)}
        />
      )}
    </section>
  );
};

export default UserProfile;

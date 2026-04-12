import { useState, useContext } from "react";
import styles from "./RegisterForm.module.css";
import FormField from "../../molecules/FormField/FormField";
import Button from "../../atoms/Button/Button";
import AvatarUpload from "../../atoms/AvatarUpload/AvatarUpload";
import { authApi } from "../../../services/authApi";
import { imagesApi } from "../../../services/imagesApi";
import { AuthContext } from "../../../context/auth/AuthContext";
import Toast from "../../atoms/Toast/Toast";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

const validate = (fields) => {
  const errors = {};

  if (!fields.name.trim()) errors.name = "El nombre es obligatorio";

  if (!fields.firstName.trim())
    errors.firstName = "El primer apellido es obligatorio";

  if (!fields.email.trim()) {
    errors.email = "El email es obligatorio";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) {
    errors.email = "Formato de email inválido";
  }

  if (!fields.password.trim()) {
    errors.password = "La contraseña es obligatoria";
  } else if (fields.password.length < 6) {
    errors.password = "Mínimo 6 caracteres";
  }

  return errors;
};

const INITIAL_FIELDS = {
  name: "",
  firstName: "",
  secondName: "",
  alias: "",
  email: "",
  password: "",
};

const RegisterForm = () => {
  const { login } = useContext(AuthContext);
  const [fields, setFields] = useState(INITIAL_FIELDS);
  const [touched, setTouched] = useState({});
  const [serverErrors, setServerErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const navigate = useNavigate();
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarError, setAvatarError] = useState("");
  const [accepted, setAccepted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFields((prev) => ({ ...prev, [name]: value }));
    if (serverErrors[name])
      setServerErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleBlur = (e) => {
    setTouched((prev) => ({ ...prev, [e.target.name]: true }));
  };

  const getError = (field) =>
    (touched[field] && validate(fields)[field]) || serverErrors[field] || "";

  const handleFileSelect = (file, error) => {
    if (error) {
      setAvatarError(error);
      return;
    }
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    setAvatarError("");
  };

  const handleRemoveAvatar = () => {
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    setAvatarFile(null);
    setAvatarPreview(null);
    setAvatarError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setTouched({ name: true, firstName: true, email: true, password: true });

    const frontErrors = validate(fields);
    if (Object.keys(frontErrors).length > 0) return;

    if (!accepted) {
      setServerErrors({
        _terms: "Debes aceptar las políticas de privacidad para continuar",
      });
      return;
    }

    setIsLoading(true);
    setServerErrors({});

    try {
      const payload = {
        name: fields.name.trim(),
        firstName: fields.firstName.trim(),
        secondName: fields.secondName.trim() || null,
        alias: fields.alias.trim() || null,
        email: fields.email.trim(),
        password: fields.password,
        profileImage: null,
      };

      const registerResponse = await authApi.register(payload);
      const authData = registerResponse.data;
      const userId = authData.id ?? authData.user?.id;

      login(authData);

      if (avatarFile && userId) {
        try {
          await imagesApi.uploadProfileImage(userId, avatarFile);
        } catch {
          console.warn("Registro exitoso, pero no se pudo subir la imagen.");
        }
      }

      setShowToast(true);
    } catch (error) {
      const status = error.response?.status;
      const data = error.response?.data;

      if (status === 400 && data && typeof data === "object") {
        setServerErrors(data);
      } else if (status === 409) {
        setServerErrors({
          email: "Este email ya está registrado. ¿Quieres iniciar sesión?",
        });
      } else {
        setServerErrors({
          _global: `Error inesperado (${status ?? "sin conexión"}). Inténtalo de nuevo.`,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className={styles.container}>
      {serverErrors._global && (
        <p className={styles.globalError} role="alert">
          {serverErrors._global}
        </p>
      )}

      <form
        className={styles.form}
        onSubmit={handleSubmit}
        noValidate
        aria-label="Formulario de registro de usuario"
      >
        <h1 className={styles.title}>
          <span className={styles.desktopOnly}>Formulario de </span>Registro
        </h1>

        <FormField
          label="Nombre *"
          name="name"
          value={fields.name}
          type="text"
          placeholder="Tu nombre"
          onChange={handleChange}
          onBlur={handleBlur}
          error={getError("name")}
          autoComplete="given-name"
          aria-required="true"
          tabIndex={1}
        />
        <FormField
          label="Primer apellido *"
          name="firstName"
          value={fields.firstName}
          type="text"
          placeholder="Tu primer apellido"
          onChange={handleChange}
          onBlur={handleBlur}
          error={getError("firstName")}
          autoComplete="family-name"
          aria-required="true"
          tabIndex={2}
        />
        <FormField
          label="Segundo apellido"
          name="secondName"
          value={fields.secondName}
          type="text"
          placeholder="Opcional"
          onChange={handleChange}
          onBlur={handleBlur}
          error={getError("secondName")}
          autoComplete="additional-name"
          tabIndex={3}
        />
        <FormField
          label="Alias"
          name="alias"
          value={fields.alias}
          type="text"
          placeholder="@tu_alias (opcional)"
          onChange={handleChange}
          onBlur={handleBlur}
          error={getError("alias")}
          tabIndex={4}
        />
        <FormField
          label="Email *"
          name="email"
          value={fields.email}
          type="email"
          placeholder="correo@ejemplo.com"
          onChange={handleChange}
          onBlur={handleBlur}
          error={getError("email")}
          autoComplete="email"
          aria-required="true"
          tabIndex={5}
        />
        <FormField
          label="Contraseña *"
          name="password"
          value={fields.password}
          type="password"
          placeholder="Mínimo 6 caracteres"
          onChange={handleChange}
          onBlur={handleBlur}
          error={getError("password")}
          autoComplete="new-password"
          aria-required="true"
          tabIndex={6}
        />
        <AvatarUpload
          preview={avatarPreview}
          placeholderLetter={fields.name ? fields.name[0].toUpperCase() : "?"}
          onFileSelect={handleFileSelect}
          onRemove={handleRemoveAvatar}
          error={avatarError}
        />

        <div className={styles.accions}>
          <div className={styles.actions}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={accepted}
                onChange={() => {
                  setAccepted((v) => !v);
                  setServerErrors((prev) => ({ ...prev, _terms: undefined }));
                }}
                className={styles.checkbox}
                aria-required="true"
              />
              Acepto las
              <Link to="/privacy" className={styles.privacyLink}>
                políticas de privacidad
              </Link>
            </label>

            {serverErrors._terms && (
              <p className={styles.termsError} role="alert">
                {serverErrors._terms}
              </p>
            )}
          </div>

          <div className={styles.actionsButtons}>
            <Button
              text={isLoading ? "Registrando..." : "Registrarse"}
              BtnClass="neon"
              type="submit"
              disabled={isLoading}
              aria-busy={isLoading}
            />
            <Button text="Cancelar" BtnClass="cancel" path="/home" />
          </div>
        </div>
      </form>
      {showToast && (
        <Toast
          message="¡Cuenta creada correctamente! Bienvenid@."
          type="success"
          duration={3000}
          onClose={() => {
            setShowToast(false);
            navigate("/home/community");
          }}
        />
      )}
    </section>
  );
};

export default RegisterForm;

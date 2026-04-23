import { useState, useContext } from "react";
import styles from "./LoginForm.module.css";
import FormField from "../../molecules/FormField/FormField";
import Button from "../../atoms/Button/Button";
import Toast from "../../atoms/Toast/Toast";
import { authApi } from "../../../services/authApi";
import { AuthContext } from "../../../context/auth/AuthContext";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

const validate = (fields) => {
  const errors = {};

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

const INITIAL_FIELDS = { email: "", password: "" };

const LoginForm = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [fields, setFields] = useState(INITIAL_FIELDS);
  const [touched, setTouched] = useState({});
  const [serverErrors, setServerErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null);

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    setTouched({ email: true, password: true });

    const frontErrors = validate(fields);
    if (Object.keys(frontErrors).length > 0) return;

    setIsLoading(true);
    setServerErrors({});

    try {
      const response = await authApi.login({
        email: fields.email.trim(),
        password: fields.password,
      });

      login(response.data);

      setToast({ message: "¡Bienvenid@ de nuevo!", type: "success" });
    } catch (error) {
      const status = error.response?.status;

      if (status === 404) {
        setServerErrors({ email: "No existe ninguna cuenta con este email" });
      } else if (status === 401 || status === 403) {
        setServerErrors({ password: "Contraseña incorrecta" });
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
        aria-label="Formulario de inicio de sesión"
      >
        <h1 className={styles.title}>Formulario de inicio</h1>

        <FormField
          label="Email"
          name="email"
          value={fields.email}
          type="email"
          placeholder="correo@ejemplo.com"
          onChange={handleChange}
          onBlur={handleBlur}
          error={getError("email")}
          autoComplete="email"
          aria-required="true"
          tabIndex={1}
        />

        <FormField
          label="Password"
          name="password"
          value={fields.password}
          type="password"
          placeholder="Tu contraseña"
          onChange={handleChange}
          onBlur={handleBlur}
          error={getError("password")}
          autoComplete="current-password"
          aria-required="true"
          tabIndex={2}
        />

        <p className={styles.registerLink}>
          ¿No tienes cuenta? Regístrate&nbsp;
          <Link to="/home/register" className={styles.link}>
            aquí
          </Link>
        </p>

        <div className={styles.actions}>
          <Button
            text={isLoading ? "Entrando..." : "Entrar"}
            BtnClass="neon"
            type="submit"
            disabled={isLoading}
            aria-busy={isLoading}
            tabIndex={3}
          />
          <Button text="Volver" BtnClass="cancel" path="/home" tabIndex={4} />
        </div>
      </form>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          duration={2000}
          onClose={() => {
            setToast(null);
            navigate("/home/community");
          }}
        />
      )}
    </section>
  );
};

export default LoginForm;

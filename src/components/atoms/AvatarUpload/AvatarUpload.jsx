import { useRef } from "react";
import styles from "./AvatarUpload.module.css";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE_MB = 5;

const AvatarUpload = ({
  preview,
  placeholderLetter = "?",
  onFileSelect,
  onRemove,
  error,
  hint = `JPG, PNG, WEBP o GIF · Máx. ${MAX_SIZE_MB} MB`,
}) => {
  const inputRef = useRef(null);

  const handleButtonClick = () => inputRef.current?.click();

  const handleChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      onFileSelect(null, "Solo se permiten imágenes JPG, PNG, WEBP o GIF");
      e.target.value = "";
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      onFileSelect(null, `El archivo no puede superar ${MAX_SIZE_MB} MB`);
      e.target.value = "";
      return;
    }

    onFileSelect(file, null);
  };

  const handleRemove = () => {
    if (inputRef.current) inputRef.current.value = "";
    onRemove();
  };

  return (
    <div className={styles.wrapper} role="group" aria-label="Foto de perfil">
      <div className={styles.preview} aria-hidden="true">
        {preview ? (
          <img src={preview} alt="Vista previa" />
        ) : (
          <span className={styles.placeholder}>{placeholderLetter}</span>
        )}
      </div>

      <div className={styles.controls}>
        <p className={styles.label}>
          Foto de perfil <span className={styles.optional}>(opcional)</span>
        </p>

        <input
          ref={inputRef}
          type="file"
          accept={ALLOWED_TYPES.join(",")}
          onChange={handleChange}
          className={styles.hiddenInput}
          aria-label="Seleccionar foto de perfil"
          tabIndex={-1}
        />

        <div className={styles.buttons}>
          <button
            type="button"
            className={styles.uploadBtn}
            onClick={handleButtonClick}
          >
            {preview ? "Cambiar foto" : "Subir foto"}
          </button>

          {preview && (
            <button
              type="button"
              className={styles.removeBtn}
              onClick={handleRemove}
              aria-label="Eliminar foto seleccionada"
            >
              Eliminar
            </button>
          )}
        </div>

        <p className={styles.hint}>{hint}</p>

        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}
      </div>
    </div>
  );
};

export default AvatarUpload;

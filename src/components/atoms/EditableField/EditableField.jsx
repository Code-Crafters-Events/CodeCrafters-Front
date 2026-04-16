import { useState, useRef, useEffect } from "react";
import styles from "./EditableField.module.css";

const EditableField = ({
  label,
  value,
  onSave,
  type = "text",
  placeholder = "Sin especificar",
  readOnly = false,
}) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value ?? "");
  const [showPass, setShowPass] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    setDraft(value ?? "");
  }, [value]);

  const handleStartEdit = () => {
    if (readOnly) return;
    setEditing(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleCancel = () => {
    setDraft(value ?? "");
    setEditing(false);
    setShowPass(false);
  };

  const handleSave = async () => {
    const trimmed = draft.trim();

    if (trimmed === (value ?? "")) {
      setEditing(false);
      return;
    }

    setIsSaving(true);
    try {
      await onSave(trimmed);
      setEditing(false);
    } catch (error) {
      setDraft(value ?? "");
    } finally {
      setIsSaving(false);
      setShowPass(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape") handleCancel();
  };

  return (
    <div className={styles.field}>
      <span className={styles.label}>{label}</span>

      <div className={styles.valueRow}>
        {editing ? (
          <div className={styles.inputContainer}>
            <input
              ref={inputRef}
              type={
                type === "password" ? (showPass ? "text" : "password") : type
              }
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={handleSave}
              onKeyDown={handleKeyDown}
              className={styles.input}
              disabled={isSaving}
              placeholder={placeholder}
            />

            {type === "password" && (
              <button
                type="button"
                className={styles.eye}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => setShowPass(!showPass)}
                aria-label={
                  showPass ? "Ocultar contraseña" : "Mostrar contraseña"
                }
              >
                {showPass ? "🔓" : "🔒"}
              </button>
            )}
          </div>
        ) : (
          <span className={`${styles.value} ${!value ? styles.empty : ""}`}>
            {type === "password" ? "********" : value || placeholder}
          </span>
        )}

        {!readOnly && !editing && (
          <button
            type="button"
            className={styles.editBtn}
            onClick={handleStartEdit}
            aria-label={`Editar ${label}`}
          >
            ✎
          </button>
        )}

        {isSaving && <span className={styles.saving}>guardando...</span>}
      </div>
    </div>
  );
};

export default EditableField;

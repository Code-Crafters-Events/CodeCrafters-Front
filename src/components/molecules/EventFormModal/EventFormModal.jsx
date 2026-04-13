import { useState, useEffect, useContext } from "react";
import styles from "./EventFormModal.module.css";
import RadioOption from "../../atoms/RadioOption/RadioOption";
import FormField from "../../molecules/FormField/FormField";
import AvatarUpload from "../../atoms/AvatarUpload/AvatarUpload";
import Button from "../../atoms/Button/Button";
import { eventsApi } from "../../../services/eventsApi";
import { imagesApi } from "../../../services/imagesApi";
import { locationsApi } from "../../../services/locationsApi";
import { AuthContext } from "../../../context/auth/AuthContext";

const CATEGORIES = ["MASTERCLASS", "HACKATHON", "TALLER", "NETWORKING"];
const TYPES = ["ONLINE", "PRESENCIAL"];

const validate = (fields) => {
  const errors = {};

  if (!fields.title.trim()) errors.title = "El título es obligatorio";

  if (!fields.date) {
    errors.date = "La fecha es obligatoria";
  } else if (!/^\d{4}-\d{2}-\d{2}$/.test(fields.date)) {
    errors.date = "Formato: AAAA-MM-DD";
  }

  if (!fields.category) errors.category = "Selecciona una categoría";

  if (!fields.type) errors.type = "Selecciona una modalidad";

  if (fields.price !== "" && isNaN(Number(fields.price)))
    errors.price = "El precio debe ser un número";

  return errors;
};

const INITIAL = {
  title: "",
  description: "",
  category: "",
  type: "",
  date: "",
  time: "",
  maxAttendees: "",
  location: "",
  price: "",
};

const isTouchDevice = () =>
  typeof window !== "undefined" &&
  ("ontouchstart" in window || navigator.maxTouchPoints > 0);

const EventFormModal = ({ isOpen, onClose, event = null, onSaved }) => {
  const { user } = useContext(AuthContext);
  const isEditing = Boolean(event);
  const useDateText = isTouchDevice();

  const [fields, setFields] = useState(INITIAL);
  const [touched, setTouched] = useState({});
  const [serverErrors, setServerErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageError, setImageError] = useState("");

  useEffect(() => {
    if (event) {
      setFields({
        title: event.title ?? "",
        description: event.description ?? "",
        category: event.type ?? "",
        type: event.category ?? "",
        date: event.date ?? "",
        time: event.time ?? "",
        maxAttendees:
          event.maxAttendees != null ? String(event.maxAttendees) : "",
        location: event.location?.address ?? event.location?.venue ?? "",
        price: event.price != null ? String(event.price) : "",
      });
      if (event.imageUrl) setImagePreview(event.imageUrl);
      else {
        setImagePreview(null);
        setImageFile(null);
      }
    } else {
      setFields(INITIAL);
      setImageFile(null);
      setImagePreview(null);
    }
    setTouched({});
    setServerErrors({});
  }, [event, isOpen]);

  if (!isOpen) return null;

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

  const handleImageSelect = (file, error) => {
    if (error) {
      setImageError(error);
      return;
    }
    if (imagePreview?.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setImageError("");
  };

  const handleImageRemove = () => {
    if (imagePreview?.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
    setImageFile(null);
    setImagePreview(null);
    setImageError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setTouched(Object.fromEntries(Object.keys(fields).map((k) => [k, true])));

    const frontErrors = validate(fields);
    if (Object.keys(frontErrors).length > 0) return;

    setIsLoading(true);
    setServerErrors({});

    try {
      let locationId = event?.location?.id ?? null;

      if (fields.location.trim()) {
        try {
          const locRes = await locationsApi.create({
            venue: fields.type === "ONLINE" ? "Online" : fields.location.trim(),
            address:
              fields.type === "PRESENCIAL" ? fields.location.trim() : null,
            city: null,
            province: null,
            country: null,
            zipCode: null,
            latitude: null,
            longitude: null,
          });
          locationId = locRes.data.id;
        } catch {
          console.warn("No se pudo guardar la ubicación.");
        }
      }

      const payload = {
        title: fields.title.trim(),
        description: fields.description.trim() || null,
        type: fields.category,
        category: fields.type,
        date: fields.date,
        time: fields.time || null,
        maxAttendees: fields.maxAttendees ? Number(fields.maxAttendees) : null,
        locationId,
        price: fields.price !== "" ? Number(fields.price) : null,
        imageUrl: event?.imageUrl ?? null,
      };

      let savedEvent;
      if (isEditing) {
        const res = await eventsApi.update(event.id, payload, user.id);
        savedEvent = res.data;
      } else {
        const res = await eventsApi.create(payload, user.id);
        savedEvent = res.data;
      }

      if (imageFile && savedEvent?.id) {
        try {
          const imgRes = await imagesApi.uploadEventImage(
            savedEvent.id,
            user.id,
            imageFile,
          );
          savedEvent = { ...savedEvent, imageUrl: imgRes.data.imageUrl };
        } catch (imgError) {
          console.error(
            "Error subiendo imagen:",
            imgError.response?.data ?? imgError.message,
          );
        }
      }

      onSaved(savedEvent, isEditing);
      onClose();
    } catch (error) {
      const status = error.response?.status;
      const data = error.response?.data;

      if (status === 400 && data && typeof data === "object") {
        setServerErrors(data);
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
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-label={isEditing ? "Editar evento" : "Crear evento"}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={styles.modal}>
        <h2 className={styles.title}>
          {isEditing ? "Editar evento" : "Información de evento"}
        </h2>

        {serverErrors._global && (
          <p className={styles.globalError} role="alert">
            {serverErrors._global}
          </p>
        )}

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={styles.group}>
            <div className={styles.radioRow}>
              {CATEGORIES.map((cat) => (
                <RadioOption
                  key={cat}
                  name="category"
                  value={cat}
                  label={cat}
                  checked={fields.category === cat}
                  onChange={handleChange}
                />
              ))}
            </div>
            {getError("category") && (
              <p className={styles.fieldError}>{getError("category")}</p>
            )}
          </div>

          <div className={styles.grid}>
            <FormField
              label="Título del evento"
              name="title"
              value={fields.title}
              type="text"
              placeholder="Nombre del evento"
              onChange={handleChange}
              onBlur={handleBlur}
              error={getError("title")}
            />

            <FormField
              label={useDateText ? "Fecha (AAAA-MM-DD)" : "Fecha"}
              name="date"
              value={fields.date}
              type={useDateText ? "text" : "date"}
              placeholder={useDateText ? "2026-12-31" : undefined}
              pattern={useDateText ? "\\d{4}-\\d{2}-\\d{2}" : undefined}
              inputMode={useDateText ? "numeric" : undefined}
              onChange={handleChange}
              onBlur={handleBlur}
              error={getError("date")}
            />

            <FormField
              label="Hora"
              name="time"
              value={fields.time}
              type="time"
              onChange={handleChange}
              onBlur={handleBlur}
              error={getError("time")}
            />

            <FormField
              label="Máx. plazas"
              name="maxAttendees"
              value={fields.maxAttendees}
              type="number"
              placeholder="Ej: 50"
              onChange={handleChange}
              onBlur={handleBlur}
              error={getError("maxAttendees")}
            />

            <FormField
              label={
                fields.type === "ONLINE"
                  ? "Enlace (Zoom, Meet...)"
                  : "Dirección"
              }
              name="location"
              value={fields.location}
              type={fields.type === "ONLINE" ? "url" : "text"}
              placeholder={
                fields.type === "ONLINE"
                  ? "https://zoom.us/..."
                  : "Calle, ciudad..."
              }
              onChange={handleChange}
              onBlur={handleBlur}
              error={getError("location")}
            />

            <FormField
              label="Descripción"
              name="description"
              value={fields.description}
              type="text"
              placeholder="Describe el evento..."
              onChange={handleChange}
              onBlur={handleBlur}
              error={getError("description")}
            />
          </div>

          <div className={styles.group}>
            <div className={styles.radioRow}>
              {TYPES.map((t) => (
                <RadioOption
                  key={t}
                  name="type"
                  value={t}
                  label={t}
                  checked={fields.type === t}
                  onChange={handleChange}
                />
              ))}
            </div>
            {getError("type") && (
              <p className={styles.fieldError}>{getError("type")}</p>
            )}
          </div>

          <div className={styles.priceRow}>
            <span className={styles.priceLabel}>Precio:</span>
            <div className={styles.priceInput}>
              <FormField
                label=""
                name="price"
                value={fields.price}
                type="number"
                placeholder="0 = Gratuito"
                onChange={handleChange}
                onBlur={handleBlur}
                error={getError("price")}
              />
            </div>
          </div>

          <AvatarUpload
            preview={imagePreview}
            placeholderLetter="+"
            onFileSelect={handleImageSelect}
            onRemove={handleImageRemove}
            error={imageError}
            hint="JPG, PNG, WEBP · Máx. 5 MB"
            shape="square"
          />

          <div className={styles.actions}>
            <Button
              text={
                isLoading
                  ? "Guardando..."
                  : isEditing
                    ? "Editar"
                    : "Guardar evento"
              }
              BtnClass="neon"
              type="submit"
              disabled={isLoading}
              aria-busy={isLoading}
            />
            <Button
              text="Volver"
              BtnClass="cancel"
              type="button"
              onClick={onClose}
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventFormModal;

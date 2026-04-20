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

  if (!fields.title.trim()) {
    errors.title = "El título es obligatorio";
  } else if (fields.title.length < 5) {
    errors.title = "Mínimo 5 caracteres";
  }

  if (!fields.date) {
    errors.date = "La fecha es obligatoria";
  }

  if (!fields.time) {
    errors.time = "La hora es obligatoria";
  }

  if (!fields.category) errors.category = "Selecciona una categoría";
  if (!fields.type) errors.type = "Selecciona una modalidad";

  if (!fields.location.trim()) {
    errors.location = fields.type === "ONLINE" ? "El enlace es obligatorio" : "La dirección es obligatoria";
  } else if (fields.type === "ONLINE") {
    const urlPattern = /^(https?:\/\/)[^\s$.?#].[^\s]*$/;
    if (!urlPattern.test(fields.location.trim())) {
      errors.location = "URL inválida (usa http:// o https://)";
    }
  }
  if (fields.type === "PRESENCIAL") {
    if (!fields.city.trim()) errors.city = "La ciudad es obligatoria";
    if (!fields.country.trim()) errors.country = "El país es obligatorio";
  }
  if (!fields.maxAttendees) {
    errors.maxAttendees = "Indica el número de plazas";
  } else if (Number(fields.maxAttendees) <= 0) {
    errors.maxAttendees = "Debe haber al menos 1 plaza";
  } else if (Number(fields.maxAttendees) > 1000) {
    errors.maxAttendees = "Máximo 1000 plazas";
  }
  if (fields.price === "") {
    errors.price = "El precio es obligatorio (pon 0 si es gratis)";
  } else if (isNaN(Number(fields.price))) {
    errors.price = "Debe ser un número";
  } else if (Number(fields.price) < 0) {
    errors.price = "El precio no puede ser negativo";
  }
  if (!fields.description.trim()) {
    errors.description = "La descripción es obligatoria";
  } else if (fields.description.length < 10) {
    errors.description = "Descripción demasiado corta (mín. 10 carac.)";
  } else if (fields.description.length > 255) {
    errors.description = "Máximo 255 caracteres (límite del servidor)";
  }

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
  city: "",
  country: "",
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
        city: event.location?.city ?? "",
        country: event.location?.country ?? "",
        price: event.price != null ? String(event.price) : "",
      });
      setImagePreview(event.imageUrl ?? null);
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

    const allTouched = Object.fromEntries(
      Object.keys(fields).map((k) => [k, true]),
    );
    setTouched(allTouched);

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
            address: fields.location.trim(),
            city: fields.type === "PRESENCIAL" ? fields.city.trim() : "Online",
            country:
              fields.type === "PRESENCIAL" ? fields.country.trim() : "Online",
            zipCode: "00000",
            latitude: 0,
            longitude: 0,
          });
          locationId = locRes.data.id;
        } catch (locErr) {
          console.warn("Error en locationsApi:", locErr);
        }
      }

      const payload = {
        title: fields.title.trim(),
        description: fields.description.trim() || "",
        category: fields.type,
        type: fields.category,
        date: fields.date,
        time: fields.time || "00:00",
        maxAttendees: fields.maxAttendees ? Number(fields.maxAttendees) : 0,
        locationId: locationId,
        price: fields.price !== "" ? Number(fields.price) : 0,
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
          console.error("Error subiendo imagen:", imgError);
        }
      }

      onSaved(savedEvent, isEditing);
      onClose();
    } catch (error) {
      const status = error.response?.status;
      const data = error.response?.data;
      if (status === 400 && data) {
        setServerErrors(data);
      } else {
        setServerErrors({
          _global: `Error del servidor (${status}). Revisa que todos los campos sean correctos.`,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={styles.overlay}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className={styles.modal}>
        <h2 className={styles.title}>
          {isEditing ? "Editar evento" : "Información de evento"}
        </h2>

        {serverErrors._global && (
          <p className={styles.globalError}>{serverErrors._global}</p>
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
              onChange={handleChange}
              onBlur={handleBlur}
              error={getError("title")}
            />
            <FormField
              label={useDateText ? "Fecha (AAAA-MM-DD)" : "Fecha"}
              name="date"
              type={useDateText ? "text" : "date"}
              value={fields.date}
              onChange={handleChange}
              onBlur={handleBlur}
              error={getError("date")}
            />
            <FormField
              label="Hora"
              name="time"
              type="time"
              value={fields.time}
              onChange={handleChange}
              onBlur={handleBlur}
              error={getError("time")}
            />
            <FormField
              label="Máx. plazas"
              name="maxAttendees"
              type="number"
              value={fields.maxAttendees}
              onChange={handleChange}
              onBlur={handleBlur}
              error={getError("maxAttendees")}
            />

            <FormField
              label={fields.type === "ONLINE" ? "Enlace (URL)" : "Dirección"}
              name="location"
              value={fields.location}
              onChange={handleChange}
              onBlur={handleBlur}
              error={getError("location")}
            />

            {fields.type === "PRESENCIAL" && (
              <>
                <FormField
                  label="Ciudad"
                  name="city"
                  value={fields.city}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={getError("city")}
                />
                <FormField
                  label="País"
                  name="country"
                  value={fields.country}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={getError("country")}
                />
              </>
            )}

            <div className={styles.descriptionWrapper}>
              <FormField
                label="Descripción"
                name="description"
                value={fields.description}
                type="text"
                maxLength={255}
                placeholder="Describe el evento..."
                onChange={handleChange}
                onBlur={handleBlur}
                error={getError("description")}
              />
              <small
                className={
                  fields.description.length > 255
                    ? styles.charError
                    : styles.charCounter
                }
              >
                {fields.description.length}/255 caracteres
              </small>
            </div>
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
            <FormField
              label=""
              name="price"
              type="number"
              value={fields.price}
              onChange={handleChange}
              onBlur={handleBlur}
              error={getError("price")}
            />
          </div>

          <AvatarUpload
            preview={imagePreview}
            onFileSelect={handleImageSelect}
            onRemove={handleImageRemove}
            error={imageError}
            shape="square"
          />

          <div className={styles.actions}>
            <Button
              text={
                isLoading ? "Guardando..." : isEditing ? "Editar" : "Guardar"
              }
              BtnClass="neon"
              type="submit"
              disabled={isLoading}
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

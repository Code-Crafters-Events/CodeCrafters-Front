import { useState } from "react";
import styles from "./FilterPanel.module.css";
import RadioOption from "../../atoms/RadioOption/RadioOption";
import Button from "../../atoms/Button/Button";

const isTouchDevice = () =>
  typeof window !== "undefined" &&
  ("ontouchstart" in window || navigator.maxTouchPoints > 0);

const INITIAL_FILTERS = {
  category: "",
  gratis: false,
  priceMin: "",
  priceMax: "",
  title: "",
  authorAlias: "",
  dateFrom: "",
  dateTo: "",
  showPast: false,
};

const FilterPanel = ({ isOpen, onClose, onSearch }) => {
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const useDateText = isTouchDevice();

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
      ...(name === "gratis" && checked ? { priceMin: "", priceMax: "" } : {}),
    }));
  };

  const handleSearch = () => {
    const params = {
      category: filters.category || undefined,
      title: filters.title.trim() || undefined,
      authorAlias: filters.authorAlias.trim() || undefined,
      dateFrom: filters.dateFrom || undefined,
      dateTo: filters.dateTo || undefined,
      priceMin: filters.gratis ? "0" : filters.priceMin || undefined,
      priceMax: filters.gratis ? "0" : filters.priceMax || undefined,
      showPast: filters.showPast || undefined,
    };
    onSearch(params);
    onClose();
  };

  const handleReset = () => {
    setFilters(INITIAL_FILTERS);
    onSearch({});
    onClose();
  };

  return (
    <>
      <div className={styles.backdrop} onClick={onClose} aria-hidden="true" />

      <aside
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-label="Panel de filtros"
      >
        <div className={styles.group}>
          <p className={styles.groupLabel}>Categoría</p>
          <RadioOption
            name="category"
            value="PRESENCIAL"
            label="Presencial"
            checked={filters.category === "PRESENCIAL"}
            onChange={handleChange}
          />
          <RadioOption
            name="category"
            value="ONLINE"
            label="Online"
            checked={filters.category === "ONLINE"}
            onChange={handleChange}
          />
          {filters.category && (
            <button
              type="button"
              className={styles.clearBtn}
              onClick={() => setFilters((p) => ({ ...p, category: "" }))}
            >
              Limpiar selección
            </button>
          )}
        </div>

        <div className={styles.group}>
          <p className={styles.groupLabel}>Precio</p>

          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              name="gratis"
              checked={filters.gratis}
              onChange={handleChange}
              className={styles.checkbox}
            />
            Gratis
          </label>

          {!filters.gratis && (
            <div className={styles.priceRow}>
              <div className={styles.priceField}>
                <input
                  type="number"
                  name="priceMin"
                  value={filters.priceMin}
                  onChange={handleChange}
                  placeholder="0"
                  className={styles.input}
                  min="0"
                />
                <span className={styles.priceLabel}>Precio mínimo</span>
              </div>
              <div className={styles.priceField}>
                <input
                  type="number"
                  name="priceMax"
                  value={filters.priceMax}
                  onChange={handleChange}
                  placeholder="999"
                  className={styles.input}
                  min="0"
                />
                <span className={styles.priceLabel}>Precio máximo</span>
              </div>
            </div>
          )}
        </div>

        <div className={styles.group}>
          <p className={styles.groupLabel}>Nombre evento</p>
          <input
            type="text"
            name="title"
            value={filters.title}
            onChange={handleChange}
            placeholder="Buscar por título..."
            className={styles.input}
          />
        </div>

        <div className={styles.group}>
          <p className={styles.groupLabel}>Alias</p>
          <input
            type="text"
            name="authorAlias"
            value={filters.authorAlias}
            onChange={handleChange}
            placeholder="Buscar por alias..."
            className={styles.input}
          />
        </div>

        <div className={styles.group}>
          <p className={styles.groupLabel}>Fecha</p>

          <div className={styles.dateField}>
            <input
              type={useDateText ? "text" : "date"}
              name="dateFrom"
              value={filters.dateFrom}
              onChange={handleChange}
              placeholder={useDateText ? "AAAA-MM-DD" : undefined}
              className={styles.input}
            />
            <span className={styles.priceLabel}>Fecha inicio</span>
          </div>

          <div className={styles.dateField}>
            <input
              type={useDateText ? "text" : "date"}
              name="dateTo"
              value={filters.dateTo}
              onChange={handleChange}
              placeholder={useDateText ? "AAAA-MM-DD" : undefined}
              className={styles.input}
            />
            <span className={styles.priceLabel}>Fecha final</span>
          </div>
        </div>

        <div className={styles.group}>
          <p className={styles.groupLabel}>Opciones de visualización</p>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              name="showPast"
              checked={filters.showPast}
              onChange={handleChange}
              className={styles.checkbox}
            />
            Mostrar eventos pasados
          </label>
        </div>
        <div className={styles.actions}>
          <Button
            text="Buscar"
            BtnClass="neon"
            type="button"
            onClick={handleSearch}
          />
          <Button
            text="Volver"
            BtnClass="cancel"
            type="button"
            onClick={handleReset}
          />
        </div>
      </aside>
    </>
  );
};

export default FilterPanel;

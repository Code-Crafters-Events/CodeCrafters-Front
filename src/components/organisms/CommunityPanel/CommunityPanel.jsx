import { useState, useEffect } from "react";
import styles from "./CommunityPanel.module.css";
import EventCard from "../../molecules/EventCard/EventCard";
import Button from "../../atoms/Button/Button";
import FilterPanel from "../../molecules/FilterPanel/FilterPanel";
import { eventsApi } from "../../../services/eventsApi";
import ScrollToTop from "../../atoms/ScrollToTop/ScrollToTop";

const PAGE_SIZE = 15;

const CommunityPanel = () => {
  const [events, setEvents] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilters, setActiveFilters] = useState({
    showPast: false,
  });
  const [filterOpen, setFilterOpen] = useState(false);
  const isFiltered = Object.keys(activeFilters).some(
    (key) => activeFilters[key] !== false && activeFilters[key] !== undefined,
  );

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    const searchParams = {
      ...activeFilters,
      showPast: activeFilters.showPast ?? false,
    };

    const call = isFiltered
      ? eventsApi.search(searchParams, page, PAGE_SIZE)
      : eventsApi.search(searchParams, page, PAGE_SIZE);

    call
      .then((res) => {
        const data = res.data;
        setEvents(data.content ?? data);
        setTotalPages(data.totalPages ?? 1);

        window.scrollTo({ top: 0, behavior: "smooth" });
      })
      .catch(() => setError("No se pudieron cargar los eventos."))
      .finally(() => setIsLoading(false));
  }, [page, activeFilters, isFiltered]);

  const handleSearch = (filters) => {
    const filtersWithDefault = {
      ...filters,
      showPast: filters.showPast ?? false,
    };
    setActiveFilters(filtersWithDefault);
    setPage(0);
  };

  const handleClearFilters = () => {
    setActiveFilters({
      showPast: false,
    });
    setPage(0);
  };

  return (
    <section className={styles.container}>
      <div className={styles.header}>
        <Button
          text="FILTRAR"
          BtnClass="filter"
          type="button"
          onClick={() => setFilterOpen(true)}
        />

        {isFiltered && (
          <button
            className={styles.clearFilters}
            onClick={handleClearFilters}
            type="button"
          >
            ✕ Limpiar filtros
          </button>
        )}
      </div>
      <h1 className={styles.title}>
        {activeFilters.showPast
          ? "Archivo Histórico de Eventos"
          : "Próximos Eventos en Comunidad"}
      </h1>
      {isLoading && <p className={styles.message}>Cargando eventos...</p>}

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}

      {!isLoading && !error && events.length === 0 && (
        <p className={styles.message}>
          {isFiltered
            ? "No hay eventos que coincidan con los filtros seleccionados."
            : "No hay eventos disponibles."}
        </p>
      )}

      {!isLoading && !error && events.length > 0 && (
        <div className={styles.grid}>
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className={styles.pagination}>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              className={`${styles.dot} ${i === page ? styles.dotActive : ""}`}
              onClick={() => setPage(i)}
              aria-label={`Página ${i + 1}`}
              aria-current={i === page ? "page" : undefined}
            />
          ))}
        </div>
      )}

      <FilterPanel
        isOpen={filterOpen}
        onClose={() => setFilterOpen(false)}
        onSearch={handleSearch}
      />

      <ScrollToTop />
    </section>
  );
};

export default CommunityPanel;

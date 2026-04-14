import { useState, useEffect } from "react";
import StatCard from "../../atoms/StatCard/StatCard";
import styles from "./StatsStrip.module.css";
import { eventsApi } from "../../../services/eventsApi";
import { usersApi } from "../../../services/usersApi";

const BASE_STATS = [
  { label: "Usuarios activos", color: "var(--c)", key: "users" },
  { label: "Eventos en vivo", color: "var(--c2)", key: "events" },
  { label: "Tickets emitidos", color: "var(--c3)", key: "tickets" },
  { label: "Categorías tech", color: "var(--c5)", key: "categories" },
];

export default function StatsStrip() {
  const [statsData, setStatsData] = useState({
    users: 0,
    events: 0,
    tickets: 340,
    categories: 4,
  });

  const [widths, setWidths] = useState({
    users: "0%",
    events: "0%",
    tickets: "0%",
    categories: "0%",
  });

  useEffect(() => {
    Promise.all([
      usersApi.getAll().catch(() => ({ data: { length: 0 } })),
      eventsApi.getAll(0, 1).catch(() => ({ data: { totalElements: 0 } })),
    ]).then(([usersRes, eventsRes]) => {
      const countUsers =
        usersRes.data?.length ?? usersRes.data?.totalElements ?? 0;
      const countEvents =
        eventsRes.data?.totalElements ?? eventsRes.data?.length ?? 0;

      const newValues = {
        users: countUsers,
        events: countEvents,
        tickets: 340,
        categories: 4,
      };

      const max = Math.max(...Object.values(newValues));

      setStatsData(newValues);

      if (max > 0) {
        setWidths({
          users: `${Math.round((newValues.users / max) * 100)}%`,
          events: `${Math.round((newValues.events / max) * 100)}%`,
          tickets: `${Math.round((newValues.tickets / max) * 100)}%`,
          categories: `${Math.round((newValues.categories / max) * 100)}%`,
        });
      }
    });
  }, []);

  return (
    <section aria-label="Estadísticas" className={styles.strip}>
      {BASE_STATS.map((base) => (
        <StatCard
          key={base.label}
          label={base.label}
          color={base.color}
          number={String(statsData[base.key])}
          barWidth={widths[base.key]}
        />
      ))}
    </section>
  );
}

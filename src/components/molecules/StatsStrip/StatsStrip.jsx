import { useState, useEffect } from "react";
import StatCard from "../../atoms/StatCard/StatCard";
import styles from "./StatsStrip.module.css";
import { eventsApi } from "../../../services/eventsApi";
import { usersApi } from "../../../services/usersApi";
import { ticketsApi } from "../../../services/ticketsApi";

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
    tickets: 0,
    categories: 4,
  });

  const [widths, setWidths] = useState({
    users: "0%",
    events: "0%",
    tickets: "0%",
    categories: "0%",
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [usersRes, eventsRes, ticketsRes] = await Promise.all([
          usersApi.getAll().catch(() => ({ data: [] })),
          eventsApi.getAll(0, 1).catch(() => ({ data: { totalElements: 0 } })),
          ticketsApi.getCount().catch(() => ({ data: 0 })),
        ]);

        let countUsers = 0;

        if (Array.isArray(usersRes.data)) {
          countUsers = usersRes.data.length;
        } else if (Array.isArray(usersRes.data?.content)) {
          countUsers = usersRes.data.content.length;
        } else if (usersRes.data?.totalElements !== undefined) {
          countUsers = usersRes.data.totalElements;
        }

        const countEvents = eventsRes.data?.totalElements ?? 0;

        const countTickets =
          typeof ticketsRes.data === "number"
            ? ticketsRes.data
            : (ticketsRes.data?.count ?? 0);

        const newValues = {
          users: countUsers,
          events: countEvents,
          tickets: countTickets,
          categories: 4,
        };

        const max = Math.max(...Object.values(newValues), 1);

        setStatsData(newValues);

        setWidths({
          users: `${Math.round((newValues.users / max) * 100)}%`,
          events: `${Math.round((newValues.events / max) * 100)}%`,
          tickets: `${Math.round((newValues.tickets / max) * 100)}%`,
          categories: `${Math.round((newValues.categories / max) * 100)}%`,
        });
      } catch (error) {
        console.error("Error cargando estadísticas:", error);
      }
    };

    loadStats();
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

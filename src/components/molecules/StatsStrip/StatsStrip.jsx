import StatCard from "../../atoms/StatCard/StatCard";
import styles from "./StatsStrip.module.css";

const STATS = [
  {
    number: "1.2K",
    label: "Usuarios activos",
    color: "var(--c)",
    barWidth: "78%",
  },
  {
    number: "87",
    label: "Eventos en vivo",
    color: "var(--c2)",
    barWidth: "55%",
  },
  {
    number: "340",
    label: "Tickets emitidos",
    color: "var(--c3)",
    barWidth: "90%",
  },
  {
    number: "24",
    label: "Categorías tech",
    color: "var(--c5)",
    barWidth: "40%",
  },
];

export default function StatsStrip() {
  return (
    <section aria-label="Estadísticas" className={styles.strip}>
      {STATS.map((stat) => (
        <StatCard key={stat.label} {...stat} />
      ))}
    </section>
  );
}

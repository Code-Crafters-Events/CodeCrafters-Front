import SectionLabel from "../../atoms/SectionLabel/SectionLabel";
import EventCard from "../../molecules/EventCard/EventCard";
import styles from "./EventsSection.module.css";

const EVENTS = [
  {
    id: "EVT-001",
    type: "// masterclass",
    typeColor: "var(--c)",
    name: "Spring Boot + JWT — de cero a producción",
    date: "19 ABR 2025 · 18:00h GMT+2",
    author: "@techmaster_sara",
    capacity: 50,
    place: "Enlace Zoom",
    tagLabel: "Online",
    tagColor: "var(--c3)",
    price: "FREE",
    priceColor: "var(--c3)",
    accentColor: "var(--c)",
  },
  {
    id: "EVT-002",
    type: "// hackathon",
    typeColor: "var(--c2)",
    name: "HackBCN Web3 — 48h de código sin parar",
    date: "22 ABR 2025 · 09:00h GMT+2",
    author: "@hackbcn",
    capacity: 200,
    place: "C/ Maresme Bajo 250, BCN",
    tagLabel: "Presencial",
    tagColor: "var(--c5)",
    price: "€15",
    priceColor: "var(--c2)",
    accentColor: "var(--c2)",
  },
  {
    id: "EVT-003",
    type: "// taller",
    typeColor: "var(--c3)",
    name: "React + Atomic Design — UI que escala",
    date: "25 ABR 2025 · 17:00h GMT+2",
    author: "@femcoders_bcn",
    capacity: 30,
    place: "Enlace Microsoft Teams",
    tagLabel: "Online",
    tagColor: "var(--c3)",
    price: "€8",
    priceColor: "var(--c3)",
    accentColor: "var(--c3)",
  },
];

export default function EventsSection({ onEventClick }) {
  return (
    <section aria-label="Próximos eventos">
      <SectionLabel
        tag="// feed de eventos — tiempo real"
        title="Próximos eventos"
      />
      <div className={styles.grid}>
        {EVENTS.map((event) => (
          <EventCard
            key={event.id}
            {...event}
            onClick={() => onEventClick?.(event.id)}
          />
        ))}
      </div>
    </section>
  );
}

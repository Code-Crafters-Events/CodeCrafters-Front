import { useState, useEffect } from "react";
import SectionLabel from "../../atoms/SectionLabel/SectionLabel";
import EventCard from "../../molecules/EventCard/EventCard";
import styles from "./EventsSection.module.css";
import { eventsApi } from "../../../services/eventsApi";

export default function EventsSection() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    eventsApi
      .getAll(0, 3)
      .then((res) => setEvents(res.data.content ?? res.data))
      .catch(() => setEvents([]));
  }, []);

  if (events.length === 0) return null;

  return (
    <section aria-label="Próximos eventos">
      <SectionLabel
        tag="// feed de eventos — tiempo real"
        title="Próximos eventos"
      />
      <div className={styles.grid}>
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </section>
  );
}

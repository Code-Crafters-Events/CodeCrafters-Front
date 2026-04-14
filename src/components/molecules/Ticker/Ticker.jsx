import { useState, useEffect } from "react";
import TickerItem from "../../atoms/TickerItem/TickerItem";
import styles from "./Ticker.module.css";
import { eventsApi } from "../../../services/eventsApi";

const FALLBACK = [
  { separator: "►", text: "eventos tech en vivo" },
  { separator: "►", text: "masterclasses exclusivas" },
  { separator: "►", text: "hackathons presenciales" },
  { separator: "►", text: "talleres online" },
  { separator: "►", text: "networking global" },
  { separator: "►", text: "comunidad femcoders" },
];

export default function Ticker() {
  const [items, setItems] = useState(FALLBACK);

  useEffect(() => {
    eventsApi
      .getAll(0, 10)
      .then((res) => {
        const events = res.data.content ?? res.data;
        if (events.length > 0) {
          setItems(events.map((e) => ({ separator: "►", text: e.title })));
        }
      })
      .catch(() => {});
  }, []);

  const doubled = [...items, ...items];

  return (
    <section aria-label="Novedades" className={styles.ticker}>
      <div className={styles.track} aria-hidden="true">
        {doubled.map((item, i) => (
          <TickerItem key={i} separator={item.separator} text={item.text} />
        ))}
      </div>
    </section>
  );
}

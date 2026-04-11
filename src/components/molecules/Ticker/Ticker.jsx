import TickerItem from "../../atoms/TickerItem/TickerItem";
import styles from "./Ticker.module.css";

const ITEMS = [
  { separator: "►", text: "eventos tech en vivo" },
  { separator: "►", text: "masterclasses exclusivas" },
  { separator: "►", text: "hackathons presenciales" },
  { separator: "►", text: "talleres online" },
  { separator: "►", text: "networking global" },
  { separator: "►", text: "comunidad femcoders" },
];

export default function Ticker() {
  const doubled = [...ITEMS, ...ITEMS];

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

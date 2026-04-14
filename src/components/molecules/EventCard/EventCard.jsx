import { useNavigate } from "react-router-dom";
import styles from "./EventCard.module.css";
import CategoryTag from "../../atoms/CategoryTag/CategoryTag";
import PriceTag from "../../atoms/PriceTag/PriceTag";
import EventTag from "../../atoms/EventTag/EventTag";

const formatDate = (dateStr, timeStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const day = date.getDate().toString().padStart(2, "0");
  const month = date.toLocaleString("es-ES", { month: "short" }).toUpperCase();
  const year = date.getFullYear();
  const time = timeStr ? ` · ${timeStr.slice(0, 5)}h GMT+2` : "";
  return `${day} ${month} ${year}${time}`;
};

const EventCard = ({ event }) => {
  const navigate = useNavigate();
  const getTagStyles = () => {
    const type = String(event.type || "")
      .toLowerCase()
      .trim();
    const category = String(event.category || "")
      .toLowerCase()
      .trim();
    if (type === "online" || category === "online") {
      return { color: "#00FF9D", borderColor: "#00FF9D" };
    }
    if (type === "presencial" || category === "presencial") {
      return { color: "#FFB800", borderColor: "#FFB800" };
    }
    return { color: "#A0A0A0", borderColor: "#A0A0A0" };
  };

  const { color, borderColor } = getTagStyles();

  const handleClick = () => navigate(`/home/info/${event.id}`);

  const getDisplayUser = () => {
    if (event.authorAlias) return event.authorAlias;
    return event.authorName?.toLowerCase() ?? "usuario";
  };

  return (
    <article
      className={styles.card}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && handleClick()}
      aria-label={`Ver detalles de ${event.title}`}
    >
      {event.imageUrl && (
        <div className={styles.imageWrapper}>
          <img
            src={event.imageUrl.replace(
              "http://localhost:5173",
              "http://localhost:8080",
            )}
            alt={event.title}
            className={styles.image}
          />
        </div>
      )}

      <div className={styles.body}>
        <CategoryTag category={event.type} />

        <h3 className={styles.title}>{event.title}</h3>

        {event.date && (
          <p className={styles.meta}>{formatDate(event.date, event.time)}</p>
        )}

        <p className={styles.meta}>@{getDisplayUser()}</p>

        {event.location && (
          <p className={styles.meta}>
            {event.location.venue ?? event.location.address ?? ""}
          </p>
        )}

        {event.maxAttendees && (
          <p className={styles.meta}>Máx. {event.maxAttendees} plazas</p>
        )}

        <div className={styles.footer}>
          <EventTag
            label={event.category}
            color={color}
            borderColor={borderColor}
          />
          <PriceTag price={event.price} />
        </div>
      </div>
    </article>
  );
};

export default EventCard;

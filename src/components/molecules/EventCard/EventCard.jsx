import EventTag from '../../atoms/EventTag/EventTag';
import styles from './EventCard.module.css';

export default function EventCard({
  type,
  typeColor,
  name,
  date,
  author,
  capacity,
  place,
  tagLabel,
  tagColor,
  price,
  priceColor,
  onClick,
}) {
  return (
    <article className={styles.card} onClick={onClick}>
      <p className={styles.type} style={{ color: typeColor }}>
        {type}
      </p>

      <h3 className={styles.name}>{name}</h3>

      <p className={styles.info}>{date}</p>
      <p className={styles.info}> {author} · Máx {capacity} plazas</p>
      <p className={styles.info}>{place}</p>

      <div className={styles.footer}>
        <EventTag label={tagLabel} color={tagColor} />
        <span className={styles.price} style={{ color: priceColor }}>
          {price}
        </span>
      </div>
    </article>
  );
}

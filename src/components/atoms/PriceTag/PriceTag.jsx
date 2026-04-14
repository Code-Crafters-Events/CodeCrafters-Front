import styles from "./PriceTag.module.css";

const PriceTag = ({ price }) => {
  const isFree = !price || Number(price) === 0;

  return (
    <span className={`${styles.tag} ${isFree ? styles.free : styles.paid}`}>
      {isFree ? "FREE" : `${Number(price)}€`}
    </span>
  );
};

export default PriceTag;

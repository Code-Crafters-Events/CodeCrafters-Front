import styles from "./AttendeesAvatar.module.css";

const AttendeeAvatar = ({ name, imageUrl, size = "sm" }) => {
  const initial = name ? name[0].toUpperCase() : "?";

  return (
    <div
      className={`${styles.avatar} ${styles[size]}`}
      title={name}
      aria-label={name}
    >
      {imageUrl ? (
        <img
          src={imageUrl.replace(
            "http://localhost:5173",
            "http://localhost:8080",
          )}
          alt={name}
          className={styles.img}
        />
      ) : (
        <span className={styles.initial}>{initial}</span>
      )}
    </div>
  );
};

export default AttendeeAvatar;

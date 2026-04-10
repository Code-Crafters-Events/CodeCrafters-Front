import styles from "./LogLine.module.css";

export default function LogLine({
  text,
  visible = false,
  isPrompt = false,
  showCursor = false,
}) {
  return (
    <span className={`${styles.line} ${visible ? styles.visible : ""}`}>
      {isPrompt ? (
        <>
          <span className={styles.prompt}>cc@system:~$</span> {text}
        </>
      ) : (
        <>
          <span className={styles.ok}>✓</span> {text.replace(/^✓\s*/, "")}
        </>
      )}
      {showCursor && <span className={styles.cursor}>_</span>}
    </span>
  );
}

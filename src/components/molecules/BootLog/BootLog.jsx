import LogLine from "../../atoms/LogLine/LogLine";
import styles from "./BootLog.module.css";

export default function BootLog({ lines = [], visibleCount = 0 }) {
  return (
    <div className={styles.terminal}>
      <LogLine text="./init.sh" isPrompt visible={visibleCount >= 0} />
      {lines.map((text, i) => (
        <LogLine
          key={i}
          text={text}
          visible={visibleCount > i}
          showCursor={i === lines.length - 1 && visibleCount > i}
        />
      ))}
    </div>
  );
}

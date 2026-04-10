import { useState, useEffect } from "react";
import Logo from "../../atoms/Logo/Logo";
import Spinner from "../../atoms/Spinner/Spinner";
import CornerBrackets from "../../atoms/CornerBrackets/CornerBrackets";
import ProgressTracker from "../../molecules/ProgressTracker/ProgressTracker";
import BootLog from "../../molecules/BootLog/BootLog";

import { BOOT_STEPS, STEP_DELAY_MS } from "../../../constants/bootSteps";
import styles from "./LoadingScreen.module.css";

const LOG_LINES = BOOT_STEPS.filter((s) => s.log !== null).map((s) => s.log);

export default function LoadingScreen({ onEnter }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [pct, setPct] = useState(0);
  const [label, setLabel] = useState(BOOT_STEPS[0].label);
  const [visibleLogs, setVisibleLogs] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (stepIndex >= BOOT_STEPS.length) return;

    const step = BOOT_STEPS[stepIndex];
    setPct(step.pct);
    setLabel(step.label);
    if (step.log) setVisibleLogs((v) => v + 1);
    if (step.pct === 100) {
      setDone(true);
      return;
    }

    const timer = setTimeout(
      () => setStepIndex((i) => i + 1),
      STEP_DELAY_MS + Math.random() * 300,
    );
    return () => clearTimeout(timer);
  }, [stepIndex]);

  return (
    <div className={styles.screen}>
      <div className={styles.scanlines} />
      <div className={styles.hexGrid} />
      <div className={styles.glowRing} />
      <CornerBrackets />

      <div className={styles.content}>
        <Logo />
        <Spinner pct={pct} />
        <ProgressTracker pct={pct} label={label} />
        <BootLog lines={LOG_LINES} visibleCount={visibleLogs} />

        <button
          className={`${styles.enterBtn} ${done ? styles.visible : ""}`}
          onClick={onEnter}
        >
          ENTRAR AL SISTEMA →
        </button>
      </div>
    </div>
  );
}

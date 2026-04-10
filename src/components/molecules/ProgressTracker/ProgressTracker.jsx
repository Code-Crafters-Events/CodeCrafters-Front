import StatusLabel from '../../atoms/StatusLabel/StatusLabel';
import ProgressBar from '../../atoms/ProgressBar/ProgressBar';
import styles from './ProgressTracker.module.css';

export default function ProgressTracker({ pct = 0, label = '' }) {
  return (
    <div className={styles.wrapper}>
      <StatusLabel text={label} />
      <ProgressBar pct={pct} />
    </div>
  );
}

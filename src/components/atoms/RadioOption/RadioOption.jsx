import styles from "./RadioOption.module.css";

const RadioOption = ({ name, value, label, checked, onChange }) => {
  return (
    <label className={styles.label}>
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        className={styles.input}
      />
      <span className={styles.custom} aria-hidden="true" />
      {label}
    </label>
  );
};

export default RadioOption;

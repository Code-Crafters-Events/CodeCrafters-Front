import styles from "./FormField.module.css";
import Label from "../../atoms/Label/Label";
import Input from "../../atoms/Input/Input";

const FormField = ({
  label,
  type,
  placeholder,
  name,
  value,
  onChange,
  onBlur,
  error,
  ...inputProps
}) => {
  return (
    <div className={styles.fieldContainer}>
      <Label className={styles.label} htmlFor={name}>
        {label}
      </Label>
      <Input
        id={name}
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        className={styles.mainInput}
        {...inputProps}
      />
      <div className={styles.error}>{error || ""}</div>
    </div>
  );
};
export default FormField;

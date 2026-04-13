import styles from "./Input.module.css";

const Input = ({ type = "text", placeholder, className, id, ...props }) => {
  return (
    <input
      id={id}
      type={type}
      placeholder={placeholder}
      className={`${styles.input} ${className || ""}`}
      {...props}
    />
  );
};

export default Input;
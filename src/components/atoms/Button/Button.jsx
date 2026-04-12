import styles from "./Button.module.css";
import { useNavigate } from "react-router";
import React from "react";

const Button = ({
  text,
  BtnClass,
  path,
  type = "button",
  onClick,
  disabled,
}) => {
  const navigate = useNavigate();

  const handleClick = (e) => {
    if (onClick) {
      onClick(e);
    } else if (path) {
      navigate(path);
    }
  };
  return (
    <button
      type={type}
      className={styles[BtnClass]}
      onClick={handleClick}
      disabled={disabled}
    >
      {text}
    </button>
  );
};

export default Button;

import styles from "./ButtonConnect.module.css";
import { useNavigate } from "react-router-dom";
import React from "react";

const Button = ({ text, BtnClass, path, onClick }) => {
  const navigate = useNavigate();

  const handleClick = (e) => {
    if (onClick) {
      onClick(e);
    } else if (path) {
      navigate(path);
    }
  };

  return (
    <button className={styles[BtnClass]} onClick={handleClick}>
      {text}
    </button>
  );
};

export default Button;

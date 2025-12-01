import React from "react";
import "../styles/Button.scss";

const Button = ({
  children,
  className = "",
  type = "button",
  disabled = false,
  variant = "primary",
  ...rest
}) => {
  const variantClass = variant === "secondary" ? "outline-button" : "red-button";
  const classes = [variantClass, className].filter(Boolean).join(" ");

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled}
      {...rest}
    >
      {children}
    </button>
  );
};

export default Button;

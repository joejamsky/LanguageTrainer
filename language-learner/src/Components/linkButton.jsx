import React from "react";
import { useNavigate } from "react-router-dom";
import Button from "./button";

const LinkButton = ({
  to,
  children,
  onClick,
  ...rest
}) => {
  const navigate = useNavigate();

  const handleClick = (event) => {
    if (onClick) {
      onClick(event);
    }
    if (!event.defaultPrevented && to) {
      navigate(to);
    }
  };

  return (
    <Button type="button" onClick={handleClick} {...rest}>
      {children}
    </Button>
  );
};

export default LinkButton;


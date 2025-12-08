import React from "react";

const GuidedPathNode = ({
  as = "div",
  className = "",
  label,
  innerRef,
  ...rest
}) => {
  const Element = as;
  return (
    <Element ref={innerRef} className={className} {...rest}>
      <span className="guided-node-ring" />
      <span className="guided-node-index">{label}</span>
    </Element>
  );
};

export default GuidedPathNode;


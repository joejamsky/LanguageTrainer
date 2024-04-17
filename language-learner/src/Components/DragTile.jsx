import React, { useState, useRef } from "react";
import "../Styles/DragTile.scss";

const DragTile = ({ character, index, setStart }) => {
  const [dragging, setDragging] = useState(false);
  const dragRef = useRef(null);  // Create a ref for the draggable element

  const onDragStart = (e) => {
    setDragging(true);
    setStart(true);
    e.dataTransfer.setData("id", dragRef.current.id);  // Use ref to access the element ID
  };

  const onDragEnd = (e) => {
    setDragging(false);
  };

  return (
    <div
      ref={dragRef}  // Attach the ref to your draggable div
      id={`draggable-${character.hiragana}`}
      className={`bot-grid-item ${dragging ? 'dragging' : ''}`}
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      data-letter={character.hiragana}
      data-index={index}
    >
      {character.hiragana}
    </div>
  );
};

export default DragTile;

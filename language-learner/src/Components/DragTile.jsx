import React, { useState, useRef } from "react";
import "../Styles/DragTile.scss";

const DragTile = ({ character, index, setStart }) => {
  const [dragging, setDragging] = useState(false);
  const dragRef = useRef(null);  // Create a ref for the draggable element

  const onDragStart = (e) => {
    setDragging(true);
    setStart(true);
    e.dataTransfer.clearData();
    e.dataTransfer.setData("character", dragRef.current.getAttribute("data-character"));
    e.dataTransfer.setData("index", dragRef.current.getAttribute("data-index"));
  };

  const onDragEnd = (e) => {
    setDragging(false);
  };
  
  return (
    <div
      ref={dragRef}
      key={`bot-grid-item-${index}`}
      id={`draggable-${character.hiragana}`}
      className={`
          bot-grid-item 
          ${dragging ? 'dragging' : ''} 
          ${character.placeholder || character.filled ? 'hide' : ''} 
        `}
      draggable={!character.placeholder && !character.filled} 
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      data-character={character.hiragana}
      data-index={index}
    >
      {character.hiragana}
    </div>
  );
};

export default DragTile;

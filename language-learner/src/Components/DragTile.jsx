import React, { useState, useRef } from "react";
import "../Styles/DragTile.scss";

const DragTile = ({ character, index, options, setStart }) => {
  const [dragging, setDragging] = useState(false);
  const dragRef = useRef(null);  // Create a ref for the draggable element

  const onDragStart = (e) => {
    setDragging(true);
    setStart(true);
    e.dataTransfer.clearData();
    e.dataTransfer.setData("id", dragRef.current.getAttribute("data-id"));
    e.dataTransfer.setData("index", dragRef.current.getAttribute("data-index"));
  };

  const onDragEnd = (e) => {
    setDragging(false);
  };
  
  const renderCharacterContainers = () => {
    return Object.keys(options.characters).map(key => {
      if (options.characters[key].activeBot) {
        return <div key={`char-container-${character[key]}`} className="char-container">{character[key]}</div>;
      }
      return null;
    });
  };

  return (
    <div
      ref={dragRef}
      key={`drag-tile-${character.id}`}
      id={`draggable-${character.id}`}
      className={`
          bot-grid-item
          ${dragging ? 'dragging' : ''}
          ${character.placeholder || character.filled ? 'hide' : ''} 
        `}
      draggable={!character.placeholder && !character.filled} 
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      data-id={character.id}
      data-index={index}
    >
      {renderCharacterContainers()}
    </div>
  );
};

export default DragTile;

import React, { useRef } from "react";
import "../Styles/DragTile.scss";
import { useGameState } from "../Contexts/GameStateContext";

const DragTile = ({ characterObj, index }) => {
  const dragRef = useRef(null);
  const { game, setGame, selectedTile, setSelectedTile, screenSize } = useGameState();

  const onTouchEnd = () => {
    setSelectedTile({
      id: null,
      index: null,
    });
  };

  const onTouchStart = () => {
    if (selectedTile.id === characterObj.id) {
      setSelectedTile({
        id: null,
        index: null,
      });
    } else {
      setSelectedTile({
        id: characterObj.id,
        index: index,
      });
    }

    if (!game.start) {
      setGame((prevGame) => ({
        ...prevGame,
        start: true,
      }));
    }
  };

  return (
    <div
      ref={dragRef}
      key={`drag-tile-${characterObj.id}`}
      id={`draggable-${characterObj.id}`}
      className={`
          bot-grid-item
          ${selectedTile.id === characterObj.id ? "dragging" : ""}
          ${characterObj.placeholder || characterObj.completed ? "hide" : ""} 
        `}
      draggable={!characterObj.placeholder && !characterObj.completed}
      onDragStart={onTouchStart}
      onDragEnd={onTouchEnd}
      onTouchStart={screenSize === "mobile" || screenSize === "tablet" ? onTouchStart : undefined}
      onClick={onTouchStart}
    >
      <div className="char-container">
        <div className={`char-content char-${characterObj.type}`}>
          {characterObj.character}
        </div>
      </div>
    </div>
  );
};

export default DragTile;

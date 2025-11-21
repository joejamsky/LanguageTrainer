import React, { useRef } from "react";
import "../Styles/DragTile.scss";
import { useGameState } from "../Contexts/GameStateContext";
import { dictionaryKanaToRomaji } from "../Misc/Utils";

const DragTile = ({
  characterObj,
  index,
  columnPosition,
  extraClassName = '',
  styleOverrides = null,
  isActive = false,
}) => {
  const dragRef = useRef(null);
  const { game, setGame, selectedTile, setSelectedTile, screenSize, options } = useGameState();
  const isDesktop = screenSize === "laptop" || screenSize === "desktop";
  const wantsRomaji = screenSize === "tablet" || screenSize === "mobile";
  const isKanaTile = characterObj.type === "hiragana" || characterObj.type === "katakana";
  const shouldShowRomaji = wantsRomaji && isKanaTile;
  const displayCharacter = shouldShowRomaji
    ? dictionaryKanaToRomaji[characterObj.character] || characterObj.character
    : characterObj.character;
  const baseStyle = columnPosition ? { gridColumn: columnPosition } : undefined;
  const tileStyle = styleOverrides ? { ...baseStyle, ...styleOverrides } : baseStyle;

  const resetSelection = () => {
    setSelectedTile({
      id: null,
      index: null,
    });
  };

  const beginSelection = () => {
    if (selectedTile.id === characterObj.id) {
      resetSelection();
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
          ${characterObj.completed ? "hide" : ""}
          ${options.hints ? `column-${Number(characterObj.parentId.split('-')[0]) % 5}` : ''}
          ${extraClassName}
        `}
      style={tileStyle}
      draggable={isDesktop && !characterObj.completed}
      onDragStart={isDesktop ? beginSelection : undefined}
      onDragEnd={isDesktop ? resetSelection : undefined}
      onTouchStart={
        !isDesktop
          ? (event) => {
              event.preventDefault();
              beginSelection();
            }
          : undefined
      }
      onTouchEnd={
        !isDesktop
          ? (event) => {
              event.preventDefault();
              resetSelection();
            }
          : undefined
      }
      onClick={beginSelection}
    >
      <div className={`active-tile-indicator ${isActive ? 'visible' : ''}`} />
      <div className="char-container">
        <div className={`char-content char-${characterObj.type}`}>
          {displayCharacter}
        </div>
      </div>
    </div>
  );
};

export default DragTile;

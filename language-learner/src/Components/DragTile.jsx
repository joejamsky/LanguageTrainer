import React, { useRef } from "react";
import "../Styles/DragTile.scss";
import { useGameState } from "../Contexts/GameStateContext";
import { dictionaryKanaToRomaji } from "../Misc/Utils";

const DragTile = ({ characterObj, index }) => {
  const dragRef = useRef(null);
  const { game, setGame, selectedTile, setSelectedTile, screenSize, options } = useGameState();
  const isDesktop = screenSize === "laptop" || screenSize === "desktop";
  const wantsRomaji = screenSize === "tablet" || screenSize === "mobile";
  const isKanaTile = characterObj.type === "hiragana" || characterObj.type === "katakana";
  const shouldShowRomaji = wantsRomaji && isKanaTile;
  const displayCharacter = shouldShowRomaji
    ? dictionaryKanaToRomaji[characterObj.character] || characterObj.character
    : characterObj.character;

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
          ${characterObj.placeholder || characterObj.completed ? "hide" : ""}
          ${options.hints ? `column-${Number(characterObj.parentId.split('-')[0]) % 5}` : ''}
        `}
      draggable={isDesktop && !characterObj.placeholder && !characterObj.completed}
      onDragStart={isDesktop ? beginSelection : undefined}
      onDragEnd={isDesktop ? resetSelection : undefined}
      onTouchStart={!isDesktop ? beginSelection : undefined}
      onTouchEnd={!isDesktop ? resetSelection : undefined}
      onClick={beginSelection}
    >
      <div className="char-container">
        <div className={`char-content char-${characterObj.type}`}>
          {displayCharacter}
        </div>
      </div>
    </div>
  );
};

export default DragTile;

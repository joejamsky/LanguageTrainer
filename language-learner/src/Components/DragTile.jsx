import React, { useRef } from "react";
import "../Styles/DragTile.scss";
import { useGameState } from "../Contexts/GameStateContext"; 

const DragTile = ({ character, index }) => {
  const dragRef = useRef(null);
  const {game, setGame, selectedTile, setSelectedTile, screenSize, options} = useGameState();

  const onTouchEnd = (e) => {
    setSelectedTile({
      id: null,
      index: null
    });
  };

  const onTouchStart = (e) => {

    if(selectedTile.id === character.id){
      setSelectedTile({
        id: null, 
        index: null
      });
    } else {
      setSelectedTile({
        id: character.id, 
        index: index
      });
    }

    if(!game.start){
      setGame(prevGame => ({
        ...prevGame,
        start: true
      }));
    }
    
  };

  const renderCharacterContainers = () => {
    return Object.keys(options.characterTypes).map(key => {
      if (options.characterTypes[key].activeBot) {
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
          ${selectedTile.id === character.id ? 'dragging' : ''}
          ${character.placeholder || character.filled ? 'hide' : ''} 
        `}
      draggable={!character.placeholder && !character.filled}
      onDragStart={onTouchStart}
      onDragEnd={onTouchEnd}
      onTouchStart={screenSize === 'mobile' || 'tablet' ? onTouchStart : undefined}
      onClick={onTouchStart}
    >
      {character.placeholder === false ? renderCharacterContainers() : null}
    </div>
  );
};

export default DragTile;

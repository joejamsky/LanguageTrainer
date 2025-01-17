import React, { useRef } from "react";
import "../Styles/DragTile.scss";
import { useGameState } from "../Contexts/GameStateContext"; 

const DragTile = ({ characterObj, index }) => {
  const dragRef = useRef(null);
  const {game, setGame, selectedTile, setSelectedTile, screenSize} = useGameState();

  const onTouchEnd = (e) => {
    setSelectedTile({
      id: null,
      index: null
    });
  };

  const onTouchStart = (e) => {

    if(selectedTile.id === characterObj.matchId){
      setSelectedTile({
        id: null, 
        index: null
      });
    } else {
      setSelectedTile({
        id: characterObj.matchId, 
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
    return (
        <div className="bot-grid-item">
          <div className="char-container">
            <div>{characterObj.character}</div>
          </div>
        </div>
    );
  };

  return (
    <div
      ref={dragRef}
      key={`drag-tile-${characterObj.matchId}`}
      id={`draggable-${characterObj.matchId}`}
      className={`
          bot-grid-item
          ${selectedTile.id === characterObj.matchId ? 'dragging' : ''}
          ${characterObj.placeholder || characterObj.completed ? 'hide' : ''} 
        `}
      draggable={!characterObj.placeholder && !characterObj.completed}
      onDragStart={onTouchStart}
      onDragEnd={onTouchEnd}
      onTouchStart={screenSize === 'mobile' || 'tablet' ? onTouchStart : undefined}
      onClick={onTouchStart}
    >
      {characterObj.placeholder === false ? renderCharacterContainers() : null}
    </div>
  );
};

export default DragTile;

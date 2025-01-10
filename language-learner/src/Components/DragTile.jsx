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
    return (
        <div className="top-grid-phonetic">
            {/* Romaji on the top */}
            <div className={`grid-item-top ${options.characterTypes.romaji.activeBot ? 'visible' : 'hidden'}`}>
                <div className={`
                    phonetic-romaji
                    ${character.completed ? 'filled' : ''}
                    `}>
                    {character.characters[2].character}
                </div>
            </div>
            
            <div className={`${(options.characterTypes.hiragana.activeBot || options.characterTypes.katakana.activeBot) && options.characterTypes.romaji.activeBot? 'UI-divider-container' : 'd-none'}`}>
                <div className="UI-divider"></div>
            </div>

            <div className={`grid-item-bot ${options.characterTypes.hiragana.activeBot || options.characterTypes.katakana.activeBot ? 'visible' : 'hidden'}`}>
                {/* Hiragana on the left */}
                <div className={`
                    phonetic-hiragana 
                    ${options.characterTypes.hiragana.activeBot ? 'visible' : 'hidden'}
                    ${character.characters[0].filled ? 'filled' : ''}
                    `}>
                    {character.characters[0].character}
                </div>

                
                <div className={`${options.characterTypes.hiragana.activeBot && options.characterTypes.katakana.activeBot ? 'UI-divider-vertical' : 'd-none'}`}></div>
                
                
                {/* Katakana on the right */}
                <div className={`
                        phonetic-katakana 
                        ${options.characterTypes.katakana.activeBot ? 'visible' : 'hidden'}
                        ${character.characters[1].filled ? 'filled' : ''}
                        ${character.placeholder ? 'hide' : ''}
                        `}>
                    {character.characters[1].character}
                </div>
            </div>
        </div>
    );
  };

  return (
    <div
      ref={dragRef}
      key={`drag-tile-${character.id}`}
      id={`draggable-${character.id}`}
      className={`
          bot-grid-item
          ${selectedTile.id === character.id ? 'dragging' : ''}
          ${character.placeholder || character.completed ? 'hide' : ''} 
        `}
      draggable={!character.placeholder && !character.completed}
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

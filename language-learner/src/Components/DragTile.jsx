import React, { useRef } from "react";
import "../Styles/DragTile.scss";
import { useGameState } from "../Contexts/GameStateContext"; 

const DragTile = ({ characterObj, index }) => {
  const dragRef = useRef(null);
  const {game, setGame, selectedTile, setSelectedTile, screenSize, options} = useGameState();

  const onTouchEnd = (e) => {
    setSelectedTile({
      id: null,
      index: null
    });
  };

  const onTouchStart = (e) => {

    if(selectedTile.id === characterObj.id){
      setSelectedTile({
        id: null, 
        index: null
      });
    } else {
      setSelectedTile({
        id: characterObj.id, 
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
                    ${characterObj.completed ? 'filled' : ''}
                    `}>
                    {characterObj.characters.romaji.character}
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
                    ${characterObj.characters.hiragana.filled ? 'filled' : ''}
                    `}>
                    {characterObj.characters.hiragana.character}
                </div>

                
                <div className={`${options.characterTypes.hiragana.activeBot && options.characterTypes.katakana.activeBot ? 'UI-divider-vertical' : 'd-none'}`}></div>
                
                
                {/* Katakana on the right */}
                <div className={`
                        phonetic-katakana 
                        ${options.characterTypes.katakana.activeBot ? 'visible' : 'hidden'}
                        ${characterObj.characters.katakana.filled ? 'filled' : ''}
                        ${characterObj.placeholder ? 'hide' : ''}
                        `}>
                    {characterObj.characters.katakana.character}
                </div>
            </div>
        </div>
    );
  };

  return (
    <div
      ref={dragRef}
      key={`drag-tile-${characterObj.id}`}
      id={`draggable-${characterObj.id}`}
      className={`
          bot-grid-item
          ${selectedTile.id === characterObj.id ? 'dragging' : ''}
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

import React, { useState } from "react";
import "../Styles/DropTile.scss";
import { useGameState } from "../Contexts/GameStateContext"; 


const DropTile = ({ characterObj, index }) => {

    const [dragHover, setDragHover] = useState(false);
    const {handleDrop, options} = useGameState(); 

    const active = !characterObj.placeholder && !characterObj.completed;
    
    const onDragOver = (e) => {
        e.preventDefault();
        setDragHover(true);
    };

    const onDragLeave = (e) => {
        setDragHover(false);
    };


    const renderCharacterContainers = () => {
        return (
            <div className="top-grid-phonetic">
                {/* Romaji on the top */}
                <div className={`grid-item-top ${(options.characterTypes.romaji || options.hints) ? 'visible' : 'hidden'}`}>
                    <div className={`
                        phonetic-romaji
                        ${characterObj.characters.romaji.filled ? 'filled' : ''}
                        `}>
                        {characterObj.characters.romaji.character}
                    </div>
                </div>
                
                <div className={`${(options.characterTypes.hiragana || options.characterTypes.katakana) && options.characterTypes.romaji? 'UI-divider-container' : 'd-none'}`}>
                    <div className="UI-divider"></div>
                </div>

                <div className={`grid-item-top ${options.characterTypes.hiragana || options.characterTypes.katakana ? 'visible' : 'hidden'}`}>
                    {/* Hiragana on the left */}
                    <div className={`
                        phonetic-hiragana 
                        ${options.characterTypes.hiragana ? 'visible' : 'hidden'}
                        ${characterObj.characters.hiragana.filled ? 'filled' : ''}
                        `}>
                        {characterObj.characters.hiragana.character}
                    </div>

                    
                    <div className={`${options.characterTypes.hiragana && options.characterTypes.katakana ? 'UI-divider-vertical' : 'd-none'}`}></div>
                    
                    
                    {/* Katakana on the right */}
                    <div className={`
                            phonetic-katakana 
                            ${options.characterTypes.katakana ? 'visible' : 'hidden'}
                            ${characterObj.characters.katakana.filled ? 'filled' : ''}
                            ${characterObj.placeholder ? 'hide' : ''}
                            `}>
                        {characterObj.characters.katakana.character}
                    </div>
                </div>
            </div>
        );
    };
    

    const onTouchEnd = (e) => {
        handleDrop(characterObj.id, index)
        setDragHover(false);
    }


    return (
        <div
            key={`drop-tile-${characterObj.id}`}
            className={`
                top-grid-item 
                ${characterObj.placeholder ? 'hide' : ''}
                ${characterObj.completed ? 'filled' : ''}
                ${dragHover ? 'drag-proximity-hover' : ''}
            `}
            onDrop={active ? onTouchEnd : undefined} 
            onDragOver={active ? onDragOver : undefined}
            onDragLeave={active ? onDragLeave : undefined}
            onTouchEnd={active ? onTouchEnd : undefined}
            onClick={active ? onTouchEnd : undefined}
        >
            
            {characterObj.placeholder === false && renderCharacterContainers()}
            
        </div>
    );
      
};

export default DropTile;

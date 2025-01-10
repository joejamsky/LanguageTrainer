import React, { useState } from "react";
import "../Styles/DropTile.scss";
import { useGameState } from "../Contexts/GameStateContext"; 


const DropTile = ({ character, index }) => {

    const [dragHover, setDragHover] = useState(false);
    const {handleDrop, options} = useGameState(); 

    const active = !character.placeholder && !character.completed;
    
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
                <div className={`grid-item-top ${options.characterTypes.romaji.activeTop ? 'visible' : 'hidden'}`}>
                    <div className={`
                        phonetic-romaji
                        ${character.completed ? 'filled' : ''}
                        `}>
                        {character.characters[2].character}
                    </div>
                </div>
                
                <div className={`${(options.characterTypes.hiragana.activeTop || options.characterTypes.katakana.activeTop) && options.characterTypes.romaji.activeTop? 'UI-divider-container' : 'd-none'}`}>
                    <div className="UI-divider"></div>
                </div>

                <div className={`grid-item-bot ${options.characterTypes.hiragana.activeTop || options.characterTypes.katakana.activeTop ? 'visible' : 'hidden'}`}>
                    {/* Hiragana on the left */}
                    <div className={`
                        phonetic-hiragana 
                        ${options.characterTypes.hiragana.activeTop ? 'visible' : 'hidden'}
                        ${character.characters[0].filled ? 'filled' : ''}
                        `}>
                        {character.characters[0].character}
                    </div>

                    
                    <div className={`${options.characterTypes.hiragana.activeTop && options.characterTypes.katakana.activeTop ? 'UI-divider-vertical' : 'd-none'}`}></div>
                    
                    
                    {/* Katakana on the right */}
                    <div className={`
                            phonetic-katakana 
                            ${options.characterTypes.katakana.activeTop ? 'visible' : 'hidden'}
                            ${character.characters[1].filled ? 'filled' : ''}
                            ${character.placeholder ? 'hide' : ''}
                            `}>
                        {character.characters[1].character}
                    </div>
                </div>
            </div>
        );
    };
    

    const onTouchEnd = (e) => {
        handleDrop(character.id, index)
        setDragHover(false);
    }


    return (
        <div
            key={`drop-tile-${character.id}`}
            className={`
                top-grid-item 
                ${character.placeholder ? 'hide' : ''}
                ${character.completed ? 'filled' : ''}
                ${dragHover ? 'drag-proximity-hover' : ''}
            `}
            onDrop={active ? onTouchEnd : undefined} 
            onDragOver={active ? onDragOver : undefined}
            onDragLeave={active ? onDragLeave : undefined}
            onTouchEnd={active ? onTouchEnd : undefined}
            onClick={active ? onTouchEnd : undefined}
        >
            
            {character.placeholder === false && renderCharacterContainers()}
            
        </div>
    );
      
};

export default DropTile;

import React, { useState } from "react";
import "../Styles/DropTile.scss";
import { useGameState } from "../Contexts/GameStateContext";
import { getGridCoordinatesForTile } from "../Contexts/utils/characterUtils";


const DropTile = ({ characterObj, index }) => {

    const [dragHover, setDragHover] = useState(false);
    const {handleDrop, filters, options, screenSize} = useGameState(); 

    const active = !characterObj.completed;
    const isDesktop = screenSize === "laptop" || screenSize === "desktop";
    const gridPosition = getGridCoordinatesForTile(characterObj);
    const tileStyle = gridPosition
        ? { gridColumn: gridPosition.column, gridRow: gridPosition.row }
        : undefined;
    
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
                <div className={`grid-item-top ${(filters.characterTypes.romaji || options.hints) ? 'visible' : 'hidden'}`}>
                    <div className={`
                        phonetic-romaji
                        ${characterObj.scripts.romaji.filled ? 'filled' : ''}
                        `}>
                        {characterObj.scripts.romaji.character}
                    </div>
                </div>
                
                <div className={`${(filters.characterTypes.hiragana || filters.characterTypes.katakana) && filters.characterTypes.romaji? 'UI-divider-container' : 'd-none'}`}>
                    <div className="UI-divider"></div>
                </div>

                <div className={`grid-item-top ${filters.characterTypes.hiragana || filters.characterTypes.katakana ? 'visible' : 'hidden'}`}>
                    {/* Hiragana on the left */}
                    <div className={`
                        phonetic-hiragana 
                        ${filters.characterTypes.hiragana ? 'visible' : 'hidden'}
                        ${characterObj.scripts.hiragana.filled ? 'filled' : ''}
                        `}>
                        {characterObj.scripts.hiragana.character}
                    </div>

                    
                    <div className={`${filters.characterTypes.hiragana && filters.characterTypes.katakana ? 'UI-divider-vertical' : 'd-none'}`}></div>
                    
                    
                    {/* Katakana on the right */}
                    <div className={`
                            phonetic-katakana 
                            ${filters.characterTypes.katakana ? 'visible' : 'hidden'}
                            ${characterObj.scripts.katakana.filled ? 'filled' : ''}
                            `}>
                        {characterObj.scripts.katakana.character}
                    </div>
                </div>
            </div>
        );
    };
    

    const completeDrop = () => {
        handleDrop(characterObj.id, index);
        setDragHover(false);
    };


    return (
        <div
            id={`drop-tile-${characterObj.id}`}
            key={`drop-tile-${characterObj.id}`}
            className={`
                top-grid-item 
                ${characterObj.completed ? 'filled' : ''}
                ${dragHover ? 'drag-proximity-hover' : ''}
            `}
            style={tileStyle}
            onDrop={active && isDesktop ? completeDrop : undefined} 
            onDragOver={active && isDesktop ? onDragOver : undefined}
            onDragLeave={active && isDesktop ? onDragLeave : undefined}
            onTouchEnd={active ? completeDrop : undefined}
            onClick={active ? completeDrop : undefined}
        >
            {renderCharacterContainers()}
            
        </div>
    );
      
};

export default DropTile;

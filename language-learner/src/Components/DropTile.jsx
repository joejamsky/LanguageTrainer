import React, { useState, useEffect } from "react";
import "../Styles/DropTile.scss";


const DropTile = ({ character, setCharacters, characters, index, setGame, options }) => {


    const [dragHover, setDragHover] = useState(false);
    const active = !character.placeholder && !character.filled;

    const onDragOver = (e) => {
        e.preventDefault();
        setDragHover(true);
    };

    const onDragLeave = (e) => {
        setDragHover(false);
    };

    const getCurrentRow = (characters) => {
        const firstRenderedIndex = characters.findIndex(char => char.render);
        const currentRow = Math.floor(firstRenderedIndex / 5);
        return currentRow;
    };
    
    const onDrop = (e) => {
        e.preventDefault();
        setDragHover(false);
    
        const droppedCharacter = e.dataTransfer.getData("character");
        const droppedIndex = e.dataTransfer.getData("index");

        const targetSlot = e.target.closest('.top-grid-item')
        const targetCharacter = targetSlot.dataset.character;
        const targetIndex = targetSlot.dataset.index;
        targetSlot.classList.remove("drag-proximity-hover");

        if (droppedCharacter === targetCharacter) {
            const tempTopChars = [...characters.topCharacters];
            tempTopChars[targetIndex].filled = true;
    
            console.log('droppedIndex', droppedIndex)
            const currentRow = getCurrentRow(characters.botCharacters);
            const startIdx = currentRow * 5;
            const endIdx = startIdx + 5;
    
            const tempBotChars = [...characters.botCharacters]
            tempBotChars[droppedIndex].filled = true;
            const row = tempBotChars.slice(startIdx, endIdx);
            const allFilled = row.every(char => char.filled);
    
            if (allFilled) {
                row.forEach(char => char.render = false); // Hide the filled row
            }

            if (allFilled && (currentRow + 1) === (tempBotChars.length / 5) ){
                setGame((prevGame) => ({
                    ...prevGame,
                    gameover: true
                }))
            }
    
            setCharacters({
                topCharacters: tempTopChars,
                botCharacters: tempBotChars
            });
        }
    };
    

    return (
        <div
            key={`drop-tile-${index}`}
            className={`
                top-grid-item 
                ${character.placeholder ? 'hide' : ''}
                ${character.filled ? 'filled' : ''}
                ${dragHover ? 'drag-proximity-hover' : ''}
            `}
            onDrop={active ? onDrop : undefined} 
            onDragOver={active ? onDragOver : undefined}
            onDragLeave={active ? onDragLeave : undefined}
            data-character={character.hiragana}
            data-index={index}
        >
            <div className="top-grid-phonetic">
                {options.characters.hiragana.activeTop ? `${character.hiragana}` : ''}
                {options.characters.katakana.activeTop ? `${character.katakana}` : ''}
                {options.characters.romaji.activeTop ? `${character.romaji}` : ''}
            </div>
        </div>
    );
      
};

export default DropTile;

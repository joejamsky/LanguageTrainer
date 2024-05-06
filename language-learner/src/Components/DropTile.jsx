import React, { useState, useMemo } from "react";
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
    
        const droppedID = e.dataTransfer.getData("id");
        const droppedIndex = e.dataTransfer.getData("index");

        const targetSlot = e.target.closest('.top-grid-item')
        const targetID = targetSlot.dataset.id;
        const targetIndex = targetSlot.dataset.index;
        targetSlot.classList.remove("drag-proximity-hover");


        if (droppedID === targetID) {
            const tempTopChars = [...characters.topCharacters];
            tempTopChars[targetIndex].filled = true;
    
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

    const renderCharacterContainers = () => {
        return Object.keys(options.characters).map(key => {
            if (options.characters[key].activeTop) {
                return <div key={`char-container-${character[key]}`} className="char-container">{character[key]}</div>;
            }
            return null;
        });
    };



    return (
        <div
            key={`drop-tile-${character.id}`}
            className={`
                top-grid-item 
                ${character.placeholder ? 'hide' : ''}
                ${character.filled ? 'filled' : ''}
                ${dragHover ? 'drag-proximity-hover' : ''}
            `}
            onDrop={active ? onDrop : undefined} 
            onDragOver={active ? onDragOver : undefined}
            onDragLeave={active ? onDragLeave : undefined}
            data-id={character.id}
            data-index={index}
        >
            <div className="top-grid-phonetic">
                {renderCharacterContainers()}
            </div>
        </div>
    );
      
};

export default DropTile;

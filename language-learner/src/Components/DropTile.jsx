import React, { useState } from "react";
import "../Styles/DropTile.scss";
import { useGameState } from "../Contexts/GameStateContext"; 


const DropTile = ({ character, index, options }) => {

    const [dragHover, setDragHover] = useState(false);
    const {handleDrop} = useGameState(); 

    const active = !character.placeholder && !character.filled;

    const onDragOver = (e) => {
        e.preventDefault();
        setDragHover(true);
    };

    const onDragLeave = (e) => {
        setDragHover(false);
    };


    const renderCharacterContainers = () => {
        return Object.keys(options.characterTypes).map(key => {
            if (options.characterTypes[key].activeTop) {
                return <div key={`char-container-${character[key]}`} className={`char-container`}>{character[key]}</div>;
            }
            return null;
        });
    };

    const onTouchEnd = (e) => {
        handleDrop(character.id, index)
    }


    return (
        <div
            key={`drop-tile-${character.id}`}
            className={`
                top-grid-item 
                ${character.placeholder ? 'hide' : ''}
                ${character.filled ? 'filled' : ''}
                ${dragHover ? 'drag-proximity-hover' : ''}
            `}
            onDrop={active ? onTouchEnd : undefined} 
            onDragOver={active ? onDragOver : undefined}
            onDragLeave={active ? onDragLeave : undefined}
            onTouchEnd={active ? onTouchEnd : undefined}
            onClick={active ? onTouchEnd : undefined}
        >
            <div className="top-grid-phonetic">
                {character.placeholder === false ? renderCharacterContainers() : null}
            </div>
        </div>
    );
      
};

export default DropTile;

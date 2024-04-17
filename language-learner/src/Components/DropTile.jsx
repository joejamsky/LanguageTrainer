import React, { useState, useRef } from "react";
import "../Styles/DropTile.scss";


const DropTile = ({ characterObj, index, topCharacters, setTopCharacters, botCharacters, setBotCharacters, options }) => {


    const [dragHover, setDragHover] = useState(false);

    const onDragOver = (e) => {
        e.preventDefault();
        setDragHover(true);
    };

    const onDragLeave = (e) => {
        setDragHover(false);
    };

    const onDrop = (e, targetLetter) => {
        e.preventDefault();
        setDragHover(false);

        const droppedID = e.dataTransfer.getData("id");
        const droppedElement = document.getElementById(droppedID);
        const droppedLetter = droppedElement.getAttribute("data-letter");
        const droppedIndex = parseInt(droppedElement.getAttribute("data-index"));

        // Ensure there's a target slot and the dropped letter matches the intended slot letter
        if (droppedLetter === targetLetter) {
            // targetSlot.appendChild(droppedElement);

            let tempTop = [...topCharacters]
            let tempBot = [...botCharacters]

            tempTop[droppedIndex].filled = true
            tempBot[droppedIndex] = null

            setTopCharacters(tempTop)
            setBotCharacters(tempBot)

            const targetSlot = e.target.closest('.top-grid-item');

            targetSlot.classList.remove("drag-proximity-hover");

        }

    };

    return (
        characterObj.filled ? (
            <div 
                key={`drop-tile-${index}`} 
                className={`top-grid-item filled`} 
            >
                {/* <div className={`top-grid-hint-container ${false || false ? "" : "d-none"}`}>
                    <div className={`top-grid-hint ${ false ? "" : "d-none"}`}>
                        {characterObj.hiragana}
                    </div>
                    <div className={`top-grid-hint ${false ? "" : "d-none"}`}>
                        {characterObj.katakana}
                    </div>
                    
                </div> */}

{/* [options, setOptions] = useState({
    characters: {
      hiragana: { activeTop: true, activeBot: false },
      katakana: { activeTop: false, activeBot: false },
      romaji: { activeTop: false, activeBot: false }
    }, */}
                
                <div className="top-grid-phonetic">
                    {options.characters.hiragana.activeTop ? `${characterObj.hiragana}`: ''}
                    {options.characters.katakana.activeTop ? `${characterObj.katakana}`: ''}
                    {options.characters.romaji.activeTop ? `${characterObj.romaji}`: ''}
                </div>
            </div>
        ) : (
            <div 
                key={`drop-tile-${index}`} 
                className={`top-grid-item ${dragHover ? 'drag-proximity-hover' : ''}`} 
                onDrop={(e) => onDrop(e, characterObj.hiragana)} 
                onDragOver={onDragOver} 
                onDragLeave={onDragLeave}
            >

                <div className="top-grid-phonetic">
                    {options.characters.hiragana.activeTop ? `${characterObj.hiragana}`: ''}
                    {options.characters.katakana.activeTop ? `${characterObj.katakana}`: ''}
                    {options.characters.romaji.activeTop ? `${characterObj.romaji}`: ''}

                </div>
                {/* <div className={`top-grid-hint-container ${false || false ? "" : "d-none"}`}>
                    <div className={`top-grid-hint ${ false ? "" : "d-none"}`}>
                        {characterObj.hiragana}
                    </div>
                    <div className={`top-grid-hint ${false ? "" : "d-none"}`}>
                        {characterObj.katakana}
                    </div>
                    
                </div>
            
                <div className="top-grid-phonetic">{characterObj.romaji}</div> */}
            </div>
        )
    );
};

export default DropTile;

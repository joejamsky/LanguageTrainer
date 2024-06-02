import React, { useState } from 'react';
import { useGameState } from "../Contexts/GameStateContext.js";

function ShuffleSlider() {
    const {characters, setCharacters } = useGameState();
    const [shuffleLevel, setShuffleLevel] = useState(0)

    const shuffleArray = (intensity) => {
        if (intensity === 0) { 
            return [...characters.defaultCharacters];       //If shuffle is 0 return unshuffled array
        }
    
        const elementsToShuffle = intensity * 5;
        let mutableChars = [...characters.botCharacters];
    
        const partToShuffle = mutableChars.slice(0, elementsToShuffle);
        for (let i = partToShuffle.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [partToShuffle[i], partToShuffle[j]] = [partToShuffle[j], partToShuffle[i]];
        }
        mutableChars = [...partToShuffle, ...mutableChars.slice(elementsToShuffle)];
    
        return mutableChars;
    };
    
    

    const onChange = (num) => {
        const shuffledCharacters = shuffleArray(num);
        setShuffleLevel(num);
        setCharacters(prevChars => ({
            ...prevChars,
            botCharacters: shuffledCharacters
        }));
    };

    const maxShuffleLevel = Math.floor(characters.botCharacters.length / 5);

    return (
        <div>
            <div>Shuffle level</div>
            <div className="difficulty-container">
                <i className="fa-solid fa-shuffle"></i>
                <input
                    type="range"
                    min="0"
                    max={maxShuffleLevel}
                    value={shuffleLevel}
                    className="difficulty-slider"
                    onChange={(e) => onChange(Number(e.target.value))}
                />
                {shuffleLevel}
            </div>
        </div>
    );
}

export default ShuffleSlider;

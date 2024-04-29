import React from 'react';

function ShuffleSlider({ characters, setCharacters, options, setOptions }) {

    const onChange = (num) => {
        setOptions({
            ...options, // Spread the existing options to maintain other properties
            botRowShuffleLevel: num // Update botRowShuffleLevel
        });
    };


    return (
        <div>
            <div>
                Shuffle level 
            </div>
            <div className="difficulty-container">
                <i className="fa-solid fa-shuffle"></i>
                <input
                type="range"
                min="0"
                max="10"
                value={options.botRowShuffleLevel}
                className="difficulty-slider"
                onChange={(e) => onChange(Number(e.target.value))}
                />
            </div>
        </div>
    );
}

export default ShuffleSlider;

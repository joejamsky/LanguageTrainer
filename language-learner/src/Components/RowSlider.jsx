import React from 'react';

function RowSlider({ options, setOptions }) {

    const onChange = (num) => {
        setOptions({
            ...options, // Spread the existing options to maintain other properties
            topRowLevels: num // Update botRowShuffleLevel
        });
    };


    return (
        <div>
            <div>
                Number of Rows
            </div>
            <div className="difficulty-container">
                <i className="fa-solid fa-table"></i>
                <input
                type="range"
                min="0"
                max="10"
                value={options.topRowLevels}
                className="difficulty-slider"
                onChange={(e) => onChange(Number(e.target.value))}
                />
            </div>
        </div>
    );
}

export default RowSlider;

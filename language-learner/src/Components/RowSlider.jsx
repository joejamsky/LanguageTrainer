import React from 'react';

function RowSlider({ options, setOptions }) {

    const onChange = (num) => {
        setOptions({
            ...options, // Spread the existing options to maintain other properties
            topRowLevels: num // Update botRowShuffleLevel
        });
    };


    return (
        <div className="ui-component-container">
            <div className="ui-label">
                <i className="fa-solid fa-table"></i>
            </div>

            <div className="ui-input-container ui-slider-container">
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

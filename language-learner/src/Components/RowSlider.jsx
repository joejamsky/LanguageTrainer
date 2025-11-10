import React from 'react';

function RowSlider({ options, setOptions }) {

    const onChange = (num) => {
        setOptions({
            ...options,
            rowLevel: num,
            rowRange: {
                start: options.rowRange?.start || 1,
                end: num,
            },
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
                value={options.rowLevel}
                className="difficulty-slider"
                onChange={(e) => onChange(Number(e.target.value))}
                />
            </div>

        </div>
    );
}

export default RowSlider;

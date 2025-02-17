// ShuffleToggles.jsx
import React from 'react';
import { useGameState } from "../Contexts/GameStateContext.js";
import '../Styles/ShuffleToggle.scss';

function ShuffleToggles() {
    const { options, setOptions } = useGameState();

    const handleRowToggle = (e) => {
        setOptions(prev => ({
        ...prev,
        sorting: {
            ...prev.sorting,
            rowShuffle: e.target.checked,
        },
        }));
    };

    const handleColumnToggle = (e) => {
        setOptions(prev => ({
        ...prev,
        sorting: {
            ...prev.sorting,
            columnShuffle: e.target.checked,
        },
        }));
    };

    return (
        <div className="ui-component-container">
            <div className="ui-label">
                <i className="fa-solid fa-shuffle"></i>
            </div>

            <div className="shuffle-toggle-container">
                <label className="switch">
                    <input
                        type="checkbox"
                        checked={options.sorting.rowShuffle || false}
                        onChange={handleRowToggle}
                    />
                    <span className="check-slider"></span>
                    <span className="check-slider-label">
                        <i className="fa-solid fa-arrow-right"></i>
                    </span>
                </label>

                <label className="switch">
                    <input
                        type="checkbox"
                        checked={options.sorting.columnShuffle || false}
                        onChange={handleColumnToggle}
                    />
                    <span className="check-slider"></span>
                    <span className="check-slider-label">
                        <i className="fa-solid fa-arrow-down"></i>
                    </span>
                </label>
            </div>

        </div>
    );
}

export default ShuffleToggles;

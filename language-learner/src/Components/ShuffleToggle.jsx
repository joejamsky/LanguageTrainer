// ShuffleToggles.jsx
import React from 'react';
import { useGameState } from "../Contexts/GameStateContext.js";
import '../Styles/ShuffleToggle.scss';

function ShuffleToggles() {
    const { options, setOptions } = useGameState();

    const resolveShuffleLevel = (rowShuffle, columnShuffle) => {
        if (rowShuffle && columnShuffle) return 2;
        if (rowShuffle) return 1;
        if (columnShuffle) return 2;
        return 0;
    };

    const handleRowToggle = (e) => {
        const nextRowShuffle = e.target.checked;
        const nextColumnShuffle = options.sorting.columnShuffle;
        setOptions(prev => ({
        ...prev,
        sorting: {
            ...prev.sorting,
            rowShuffle: nextRowShuffle,
            columnShuffle: nextColumnShuffle,
            shuffleLevel: resolveShuffleLevel(nextRowShuffle, nextColumnShuffle),
        },
        }));
    };

    const handleColumnToggle = (e) => {
        const toggledOn = e.target.checked;
        const nextRowShuffle = toggledOn ? true : options.sorting.rowShuffle;
        setOptions(prev => ({
        ...prev,
        sorting: {
            ...prev.sorting,
            rowShuffle: nextRowShuffle,
            columnShuffle: toggledOn,
            shuffleLevel: resolveShuffleLevel(nextRowShuffle, toggledOn),
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

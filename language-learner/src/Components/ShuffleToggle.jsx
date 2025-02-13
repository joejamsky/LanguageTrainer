// ShuffleToggles.jsx
import React from 'react';
import { useGameState } from "../Contexts/GameStateContext.js";

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
        <div>
            <label>
                <input
                type="checkbox"
                checked={options.sorting.rowShuffle || false}
                onChange={handleRowToggle}
                />
                Shuffle by Row
            </label>
            <label>
                <input
                type="checkbox"
                checked={options.sorting.columnShuffle || false}
                onChange={handleColumnToggle}
                />
                Shuffle by Column
            </label>
        </div>
    );
}

export default ShuffleToggles;

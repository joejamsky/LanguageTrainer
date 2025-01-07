import React from 'react';
import { useGameState } from "../Contexts/GameStateContext.js";

function SortBy() {
    const {options, setOptions, } = useGameState();

    // This function determines the correct icon class and prefix text based on the current sort method
    const getIconDetails = (currentMethod) => {
        switch (currentMethod) {
            case 'sound':
                return { iconClass: 'fa-solid fa-music', prefix: '' };
            case 'h-shape':
                return { iconClass: 'fa-solid fa-shapes', prefix: 'あ' };
            case 'k-shape':
                return { iconClass: 'fa-solid fa-shapes', prefix: 'ア' };
            case 'missed':
                return { iconClass: 'fa-solid fa-chart-simple', prefix: '' };
            default:
                return { iconClass: '', prefix: '' };
        }
    };

    const handleSliderChange = (event) => {
        const methodIndex = parseInt(event.target.value, 10);

        setOptions(prevOptions => ({
            ...prevOptions,
            gameMode: {
                ...prevOptions.gameMode,
                current: methodIndex
            }
        }));
    };

    // Determine icon details based on the current method
    const { iconClass, prefix } = getIconDetails(options.gameMode.methods[options.gameMode.current]);

    return (
        <div className="ui-component-container">

            <div className="ui-label">
                Sort by 
                <div>
                    <span className="icon-prefix">{prefix}</span><i className={iconClass}></i>
                </div>
            </div>

            <div className="ui-input-container ui-slider-container">
                <input
                    type="range"
                    min="0"
                    max={options.gameMode.methods.length - 1}
                    value={options.gameMode.current}
                    onChange={handleSliderChange}
                />
            </div>

        </div>
    );
}

export default SortBy;

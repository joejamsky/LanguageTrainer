import React from 'react';
import { useGameState } from "../Contexts/GameStateContext.js";
import ShuffleToggle from './ShuffleToggle';
import '../Styles/SortBy.scss';

// This helper returns icon details based on the sort method.
const getIconDetails = (method) => {
  switch (method) {
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

function SortBy() {
  const { options, setOptions } = useGameState();
  
  // Handler to switch the sort method based on tab click.
  const handleTabClick = (index) => {
    setOptions(prevOptions => ({
      ...prevOptions,
      gameMode: {
        ...prevOptions.gameMode,
        current: index
      }
    }));
  };

  // Get the current method and its icon details.
  const currentMethod = options.gameMode.methods[options.gameMode.current];

  return (
    <div className="ui-component-container">

        <div className="ui-label">
            <i className="fa-solid fa-arrow-down-wide-short"></i>
            <i className="fa-solid fa-layer-group"></i>
        </div>

        <div className="ui-input-container sort-by-container">
            <div className="sort-select-btns">
                {options.gameMode.methods.map((method, index) => {
                const { iconClass, prefix } = getIconDetails(method);
                const isActive = index === options.gameMode.current;
                return (
                    <button
                        key={method}
                        onClick={() => handleTabClick(index)}
                        className={`tab-button ${isActive ? 'active' : ''}`}
                    >
                        <span className="icon-prefix">{prefix}</span>
                        <i className={iconClass}></i>
                    </button>
                );
                })}
            </div>

            {/* Only show shuffle toggle if the sort method is 'sound' */}
            {(currentMethod === 'sound' || currentMethod === 'h-shape' || currentMethod === 'k-shape') && (
                <div className="shuffle-toggle-container">
                <ShuffleToggle />
                </div>
            )}
        </div>

    </div>
  );
}

export default SortBy;

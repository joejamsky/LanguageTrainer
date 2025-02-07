import React from 'react';
import { useGameState } from "../Contexts/GameStateContext.js";

function ShuffleSlider() {
  // Assuming you've moved shuffleLevel into your context
  const { options, setOptions, characters } = useGameState();

  // Use the master bot list length here so that the max is independent of any current shuffling
//   const maxShuffleLevel = Math.floor(characters.masterBotCharacters.length / 5);
  const botShuffleLevel = Math.floor(characters.botCharacters.length / 5);

  const handleChange = (e) => {

    setOptions((prevOptions) => ({
        ...prevOptions, 
        sorting: {
          ...(prevOptions.sorting || {}), 
          shuffleLevel: Number(e.target.value),
        },
      }));
        
  };

  return (
    <div className="ui-component-container">
      <div className="ui-label">
        <i className="fa-solid fa-shuffle"></i>
        <span>{options.sorting.shuffleLevel}</span>
      </div>
      <div className="ui-input-container ui-slider-container">
        <input
          type="range"
          min="0"
          max={botShuffleLevel}
          value={options.sorting.shuffleLevel}
          className="difficulty-slider"
          onChange={handleChange}
        />
      </div>
    </div>
  );
}

export default ShuffleSlider;

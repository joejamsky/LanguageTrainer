import React from 'react';
import '../Styles/HintToggle.scss'
import { useGameState } from "../Contexts/GameStateContext.js";

function HintToggle() {
  const { options, setOptions} = useGameState();
  
  const handleToggle = () => {
    setOptions((prev) => ({
        ...prev, // Spread the previous state
        hints: !prev.hints, // Toggle the `hints` value
    }));
  };

  return (
    <div className="ui-component-container">
        <div className="ui-label">Hints:</div>

        <div className="ui-input-container">
            <div className="hint-toggle-container">
                <label className="switch">
                    <input
                    type="checkbox"
                    checked={options.hints}
                    onChange={handleToggle}
                    />
                    <span className="slider"></span>
                    <span className="check-slider-label"><i className="fa-regular fa-lightbulb"></i></span>
                </label>
            </div>
        </div>
    </div>
  );
}

export default HintToggle;
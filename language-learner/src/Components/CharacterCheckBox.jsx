import React from 'react';
import '../Styles/Checkbox.scss';

function CharacterCheckBox({ options, setOptions }) {
  const kanaRef = {
    hiragana: "あ",
    katakana: "ア",
    romaji: "A",
    dakuten: "゛",
    handakuten: "゜"
  };

  const handleChange = (character) => {
    setOptions((prevOptions) => {
      const activeCount = Object.values(prevOptions.characterTypes).filter(Boolean).length;

      // If trying to uncheck the last checked checkbox, prevent it
      if (prevOptions.characterTypes[character] && activeCount <= 1) {
        return prevOptions; // Return the current state unchanged
      }

      return {
        ...prevOptions,
        characterTypes: {
          ...prevOptions.characterTypes,
          [character]: !prevOptions.characterTypes[character], // Toggle the boolean
        }
      };
    });
  };

  return (
    <div className="ui-component-container">
      <div className="ui-label">
        <i className="fa-solid fa-square-check"></i>
      </div>

      <div className="ui-input-container">
        {Object.keys(options.characterTypes).map((character) => (
          <label className="switch" key={character}>
            <input
              type="checkbox"
              checked={options.characterTypes[character]}
              onChange={() => handleChange(character)}
            />
            <span className="check-slider"></span>
            <span className="check-slider-label">{kanaRef[character]}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

export default CharacterCheckBox;

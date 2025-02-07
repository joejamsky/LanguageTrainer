import React from 'react';
import '../Styles/Checkbox.scss';

function CharacterCheckBox({ options, setOptions }) {
  // Mapping for labels
  const kanaRef = {
    hiragana: "あ",
    katakana: "ア",
    romaji: "A",
    dakuten: "゛",
    handakuten: "゜"
  };

  // Unified handleChange function that accepts the group key
  const handleChange = (group, key) => {
    setOptions((prevOptions) => {
      // For base types, enforce that at least one remains checked.
      if (group === "characterTypes") {
        const activeCount = Object.values(prevOptions.characterTypes).filter(Boolean).length;
        if (prevOptions.characterTypes[key] && activeCount <= 1) {
          return prevOptions; // Prevent unchecking the last base option.
        }
      }

      return {
        ...prevOptions,
        [group]: {
          ...prevOptions[group],
          [key]: !prevOptions[group][key]
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
        {/* Base Character Types */}
        <div className="checkbox-group base-types">
          {Object.keys(options.characterTypes).map((character) => (
            <label className="switch" key={`base-${character}`}>
              <input
                type="checkbox"
                checked={options.characterTypes[character]}
                onChange={() => handleChange("characterTypes", character)}
              />
              <span className="check-slider"></span>
              <span className="check-slider-label">{kanaRef[character]}</span>
            </label>
          ))}
        </div>

        {/* Modifier Group */}
        <div className="checkbox-group modifier-group">
          {Object.keys(options.modifierGroup).map((character) => (
            <label className="switch" key={`modifier-${character}`}>
              <input
                type="checkbox"
                checked={options.modifierGroup[character]}
                onChange={() => handleChange("modifierGroup", character)}
              />
              <span className="check-slider"></span>
              <span className="check-slider-label">{kanaRef[character]}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CharacterCheckBox;

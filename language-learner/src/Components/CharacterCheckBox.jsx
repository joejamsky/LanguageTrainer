import React from 'react';
import '../Styles/Checkbox.scss';

function CharacterCheckBox({ filters, setFilters }) {
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
    setFilters((prevFilters) => {
      // For base types, enforce that at least one remains checked.
      if (group === "characterTypes") {
        const activeCount = Object.values(prevFilters.characterTypes).filter(Boolean).length;
        if (prevFilters.characterTypes[key] && activeCount <= 1) {
          return prevFilters; // Prevent unchecking the last base option.
        }
      }

      return {
        ...prevFilters,
        [group]: {
          ...prevFilters[group],
          [key]: !prevFilters[group][key]
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
          {Object.keys(filters.characterTypes).map((character) => (
            <label className="switch" key={`base-${character}`}>
              <input
                type="checkbox"
                checked={filters.characterTypes[character]}
                onChange={() => handleChange("characterTypes", character)}
              />
              <span className="check-slider"></span>
              <span className="check-slider-label">{kanaRef[character]}</span>
            </label>
          ))}
        </div>

        {/* Modifier Group */}
        <div className="checkbox-group modifier-group">
          {Object.keys(filters.modifierGroup).map((character) => (
            <label className="switch" key={`modifier-${character}`}>
              <input
                type="checkbox"
                checked={filters.modifierGroup[character]}
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

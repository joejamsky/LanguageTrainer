import React from 'react';
import '../Styles/Checkbox.scss'

function CharacterCheckBox({ options, setOptions, sectionType }) {

  const handleChange = (character) => {
    setOptions(prevOptions => {
      const currentSectionActive = prevOptions.characterTypes[character][sectionType];
      const activeCount = Object.values(prevOptions.characterTypes).filter(c => c[sectionType]).length;

      // If trying to uncheck the last checked checkbox, prevent it
      if (currentSectionActive && activeCount <= 1) {
        return prevOptions; // Return the current state unchanged
      }

      return {
        ...prevOptions,
        characterTypes: {
          ...prevOptions.characterTypes,
          [character]: {
            ...prevOptions.characterTypes[character],
            [sectionType]: !currentSectionActive
          }
        }
      };
    });
  };

  return (
    <div className="ui-component-container">

      <div className="ui-label">
        <i className={`${sectionType === 'activeTop' ? 'fa-solid fa-square-caret-up' : 'fa-solid fa-square-caret-down'}`}></i>
      </div>

      <div className="ui-input-container">
        {Object.keys(options.characterTypes).map(character => (
          <label className="switch" key={character + '-' + sectionType}>
            <input
              type="checkbox"
              checked={options.characterTypes[character][sectionType]}
              onChange={() => handleChange(character)}
            />
            <span className="slider">{character}</span>
            
          </label>
        ))}
      </div>

    </div>
  );
}

export default CharacterCheckBox;

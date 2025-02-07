import React from 'react';

function DragCharacterRadio({ filters, setFilters }) {

  const handleChange = (character) => {
    // Set only the selected character to true for activeBot and others to false
    setFilters(prevFilters => ({
      ...prevFilters,
      characterTypes: Object.keys(prevFilters.characterTypes).reduce((acc, key) => {
        acc[key] = {
          ...prevFilters.characterTypes[key],
          activeBot: key === character
        };
        return acc;
      }, {})
    }));
  };



  return (
    <div className="ui-component-container">

      <div className="ui-label">
        <i className="fa-solid fa-square-caret-down"></i>
      </div>

      <div className="ui-input-container ui-radio-container">  
        {Object.keys(filters.characterTypes).map(character => (
          <label key={character + '-bot'}>
            <input
              type="radio"
              name="characterSelect"
              checked={filters.characterTypes[character].activeBot}
              onChange={() => handleChange(character)}
            />
            {character} 
          </label>
        ))}
      </div>

    </div>
  );
}

export default DragCharacterRadio;

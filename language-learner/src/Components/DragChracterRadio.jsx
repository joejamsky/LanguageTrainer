import React from 'react';

function DragCharacterRadio({ options, setOptions }) {

  const handleChange = (character) => {
    // Set only the selected character to true for activeBot and others to false
    setOptions(prevOptions => ({
      ...prevOptions,
      characterTypes: Object.keys(prevOptions.characterTypes).reduce((acc, key) => {
        acc[key] = {
          ...prevOptions.characterTypes[key],
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
        {Object.keys(options.characterTypes).map(character => (
          <label key={character + '-bot'}>
            <input
              type="radio"
              name="characterSelect"
              checked={options.characterTypes[character].activeBot}
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

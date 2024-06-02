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
    <div>

      <div>
        <i className="fa-solid fa-square-caret-down"></i>
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

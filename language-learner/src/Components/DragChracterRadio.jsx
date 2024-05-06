import React from 'react';

function DragCharacterRadio({ options, setOptions }) {

  const handleChange = (character) => {
    // Set only the selected character to true for activeBot and others to false
    setOptions(prevOptions => ({
      ...prevOptions,
      characters: Object.keys(prevOptions.characters).reduce((acc, key) => {
        acc[key] = {
          ...prevOptions.characters[key],
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
        {Object.keys(options.characters).map(character => (
          <label key={character + '-bot'}>
            <input
              type="radio"
              name="characterSelect"
              checked={options.characters[character].activeBot}
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

import React from 'react';

function DragCharacterRadio({ options, setOptions }) {

  const handleRadioChange = (character) => {
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

  const handleCheckboxChange = (character) => {
    // Toggle the activeTop for the selected character
    setOptions(prevOptions => {
      const currentCharacterActive = prevOptions.characters[character].activeTop;
      const activeCount = Object.values(prevOptions.characters).filter(c => c.activeTop).length;

      // If trying to uncheck the last checked checkbox, prevent it
      if (currentCharacterActive && activeCount <= 1) {
        return prevOptions; // Return the current state unchanged
      }

      return {
        ...prevOptions,
        characters: {
          ...prevOptions.characters,
          [character]: {
            ...prevOptions.characters[character],
            activeTop: !currentCharacterActive
          }
        }
      };
    });
  };

  return (
    <div>
      <div>
        {Object.keys(options.characters).map(character => (
          <label key={character + '-top'}>
            <input
              type="checkbox"
              checked={options.characters[character].activeTop}
              onChange={() => handleCheckboxChange(character)}
            />
            {character} (Top)
          </label>
        ))}
      </div>
      <div>
        {Object.keys(options.characters).map(character => (
          <label key={character + '-bot'}>
            <input
              type="radio"
              name="characterSelect"
              checked={options.characters[character].activeBot}
              onChange={() => handleRadioChange(character)}
            />
            {character} (Bot)
          </label>
        ))}
      </div>
    </div>
  );
}

export default DragCharacterRadio;

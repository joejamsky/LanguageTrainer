import React from 'react';

function CharacterCheckBox({ options, setOptions, sectionType }) {

  const handleChange = (character) => {
    setOptions(prevOptions => {
      const currentSectionActive = prevOptions.characters[character][sectionType];
      const activeCount = Object.values(prevOptions.characters).filter(c => c[sectionType]).length;

      // If trying to uncheck the last checked checkbox, prevent it
      if (currentSectionActive && activeCount <= 1) {
        return prevOptions; // Return the current state unchanged
      }

      return {
        ...prevOptions,
        characters: {
          ...prevOptions.characters,
          [character]: {
            ...prevOptions.characters[character],
            [sectionType]: !currentSectionActive
          }
        }
      };
    });
  };

  return (
    <div>
      <i className={`${sectionType === 'activeTop' ? 'fa-solid fa-square-caret-up' : 'fa-solid fa-square-caret-down'}`}></i>
      {Object.keys(options.characters).map(character => (
        <label key={character + '-' + sectionType}>
          <input
            type="checkbox"
            checked={options.characters[character][sectionType]}
            onChange={() => handleChange(character)}
          />
          {character}
        </label>
      ))}
    </div>
  );
}

export default CharacterCheckBox;

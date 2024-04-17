import React from 'react';

function CharacterCheckBox({options, setOptions}) {

  const handleChange = (character) => (event) => {
    setOptions(prevOptions => ({
      ...prevOptions,
      topCharacters: {
        ...prevOptions.topCharacters,
        [character]: !prevOptions.topCharacters[character]
      }
    }));
  };

  return (
    <div>
      <label>
        <input
          type="checkbox"
          checked={options.hiragana}
          onChange={handleChange('hiragana')}
        />
        hiragana
      </label>
      <label>
        <input
          type="checkbox"
          checked={options.katakana}
          onChange={handleChange('katakana')}
        />
        katakana
      </label>
      <label>
        <input
          type="checkbox"
          checked={options.romaji}
          onChange={handleChange('romaji')}
        />
        romaji
      </label>
    </div>
  );
}

export default CharacterCheckBox;

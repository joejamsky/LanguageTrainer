import React from 'react';
import '../Styles/UIControls.scss'
import CharacterCheckBox from './CharacterCheckBox';
import DragChracterRadio from './DragChracterRadio';


function UIControls({ options, setOptions}) {


  return (
    <div className="ui">

      {/* <CharacterCheckBox 
        options={options.topCharacters}
        setOptions={setOptions}
      /> */}

      <DragChracterRadio 
        options={options}
        setOptions={setOptions}
      />
      
      <div>
        bottom, radial button for hirigana, katakan, or romaji
      </div>

      {/* <button
        className="hint-btn"
        onClick={() => setShowPlaceholders(!showPlaceholders)}
      >
        {showPlaceholders ? (
          <span>
            Hint: <i className="fa-regular fa-eye"></i>
          </span>
        ) : (
          <span>
            Hint: <i className="fa-regular fa-eye-slash"></i>
          </span>
        )}
      </button> */}

      {/* <div className="difficulty-container">
        <i className="fa-solid fa-shuffle"></i>
        <input
          type="range"
          min="0"
          max="5"
          value={shuffleIntensity}
          className="difficulty-slider"
          onChange={(e) => setShuffleIntensity(Number(e.target.value))}
        />
      </div> */}

      <div>
        Shuffle level 
      </div>

      <div>
        Sort by shape vs sort by sound
      </div>

      <div>
        only include frequently missed
      </div>

      <div>
        turn off columns on top
      </div>

      <div>
        fastest time and difficult completed
      </div>

      <div>
        sound
      </div>

      <div>
        reset data
      </div>
    </div>
  );
}

export default UIControls;

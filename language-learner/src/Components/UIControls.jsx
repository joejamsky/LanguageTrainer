import React from 'react';
import '../Styles/UIControls.scss'
// import CharacterCheckBox from './CharacterCheckBox';
import DragChracterRadio from './DragChracterRadio';
import CharacterCheckBox from './CharacterCheckBox';
import ShuffleSlider from './ShuffleSlider';
import SortBy from './SortBy';
import RowSlider from './RowSlider';
import { useGameState } from "../Contexts/GameStateContext.js";

function UIControls() {
  const { options, setOptions} = useGameState();
  
  return (
    <div className="ui">

      <div>
        Mode
        <div>By Consenant (standard)</div>
        <div>By Vowel</div>
        <div>By Shape</div>
      </div>

      <CharacterCheckBox 
        options={options}
        setOptions={setOptions}
        sectionType="activeTop"
      />

      <CharacterCheckBox 
        options={options}
        setOptions={setOptions}
        sectionType="activeBot"
      />


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


      <ShuffleSlider/>

      <SortBy/>

      <RowSlider
        options={options}
        setOptions={setOptions}
      />
      


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

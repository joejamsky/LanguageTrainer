import React from 'react';
import '../Styles/UIControls.scss'
import CharacterCheckBox from './CharacterCheckBox';
import DragChracterRadio from './DragChracterRadio';
import ShuffleSlider from './ShuffleSlider';
import SortBy from './SortBy';
import RowSlider from './RowSlider';

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

      <ShuffleSlider
        options={options}
        setOptions={setOptions}
      />

      <SortBy 
        options={options}
        setOptions={setOptions}
      />

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

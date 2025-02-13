import React from 'react';
import '../Styles/UIControls.scss'
// import CharacterCheckBox from './CharacterCheckBox';
// import DragChracterRadio from './DragChracterRadio';
import CharacterCheckBox from './CharacterCheckBox';
// import ShuffleSlider from './ShuffleSlider';
import SortBy from './SortBy';
import RowSlider from './RowSlider';
import ShuffleToggle from './ShuffleToggle';
// import HintToggle from './HintToggle';
import { useGameState } from "../Contexts/GameStateContext.js";

function UIControls() {
  const { options, setOptions, filters, setFilters} = useGameState();
  
  return (
    <div className="ui">


        <CharacterCheckBox 
          filters={filters}
          setFilters={setFilters}
        />

        {/* <ShuffleSlider/> */}
        <ShuffleToggle/>

        <SortBy/>

        <RowSlider
          options={options}
          setOptions={setOptions}
        />
    
      
        {/* <HintToggle/> */}
      

      {/* <div>
        sound
      </div>
      <div>
        reset data
      </div>

      <div>
        <h5>Stats:</h5>
        <p>Fastest completion</p>
        <p>Highest difficulty</p>
      </div> */}
      
    </div>
  );
}

export default UIControls;

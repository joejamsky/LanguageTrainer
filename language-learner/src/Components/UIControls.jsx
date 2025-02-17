import React from 'react';
import '../Styles/UIControls.scss'
import CharacterCheckBox from './CharacterCheckBox';
import SortBy from './SortBy';
// import HintToggle from './HintToggle';
import { useGameState } from "../Contexts/GameStateContext.js";

function UIControls() {
  const { filters, setFilters } = useGameState();
  
  return (
    <div className="ui">


        <CharacterCheckBox 
          filters={filters}
          setFilters={setFilters}
        />


        <SortBy/>

    
      
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

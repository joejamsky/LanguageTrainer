import React, { useState } from "react";
import "../Styles/TopGrid.scss";
import DropTile from "./DropTile";


const TopGrid = ({ characterData, topCharacters, setTopCharacters, botCharacters, setBotCharacters }) => {

  return (
    <div className="top-grid-container">

      <div className={`grid dropgrid ${true ? 'vertical' : 'horizontal'}`}>

        {characterData && characterData.map((characterObj, index) => (
          Object.keys(characterObj).length > 1 ? (
            <DropTile
              key={`top-grid-item-${index}`}
              characterObj={characterObj}
              index={index}
              characterData={characterData} 
              topCharacters={topCharacters}
              setTopCharacters={setTopCharacters}
              botCharacters={botCharacters}
              setBotCharacters={setBotCharacters}
            />
          ) : (
            <div key={`top-grid-item-${index}`} className="top-grid-item hide"></div>
          )
        ))}
      </div>
    </div>
  );
};

export default TopGrid;

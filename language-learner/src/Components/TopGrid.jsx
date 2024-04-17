import React, { useState } from "react";
import "../Styles/TopGrid.scss";
import DropTile from "./DropTile";


const TopGrid = ({ topCharacters, setTopCharacters, botCharacters, setBotCharacters, options}) => {

  return (
    <div className="top-grid-container">

      <div className={`grid dropgrid ${true ? 'vertical' : 'horizontal'}`}>

        {topCharacters && topCharacters.map((characterObj, index) => (
          Object.keys(characterObj).length > 1 ? (
            <DropTile
              key={`top-grid-item-${index}`}
              characterObj={characterObj}
              index={index}
              topCharacters={topCharacters}
              setTopCharacters={setTopCharacters}
              botCharacters={botCharacters}
              setBotCharacters={setBotCharacters}
              options={options}
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

import React from "react";
import "../Styles/TopGrid.scss";
import DropTile from "./DropTile";


const TopGrid = ({ characters, setCharacters, options, setGame}) => {
  
  return (
    <div className="top-grid-container">

      <div className={`grid dropgrid ${true ? 'vertical' : 'horizontal'}`}>

        {characters && characters.topCharacters.map((character, index) => (
            <DropTile
              key={`top-grid-item-${index}`}
              character={character}
              index={index}
              characters={characters}
              setCharacters={setCharacters}
              setGame={setGame}
              options={options}
            />
        ))}
      </div>
    </div>
  );
};

export default TopGrid;

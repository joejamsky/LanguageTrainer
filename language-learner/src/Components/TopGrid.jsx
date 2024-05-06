import React from "react";
import "../Styles/TopGrid.scss";
import DropTile from "./DropTile";
import { useGameState } from "../Contexts/GameStateContext.js";

const TopGrid = () => {
  const { characters, setCharacters, options, setGame} = useGameState();

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

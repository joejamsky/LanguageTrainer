import React from "react";
import "../Styles/TopGrid.scss";
import DropTile from "./DropTile";
import { useGameState } from "../Contexts/GameStateContext.js";

const TopGrid = () => {
  const { characters, options } = useGameState();

  return (
    <div className="top-grid-container">

      <div className={`grid dropgrid ${true ? 'vertical' : 'horizontal'}`}>

      {characters && characters.topCharacters.map((character, index) => {
        if (
          (character.dakuten === true && options.characterTypes.dakuten.activeTop === false) ||
          (character.handakuten === true && options.characterTypes.handakuten.activeTop === false)
        ) {
          return null; // Render nothing
        } else {
          return (
            <DropTile
              key={`top-grid-item-${index}`}
              characterObj={character}
              index={index}
            />
          );
        }
      })}

      </div>
    </div>
  );
};

export default TopGrid;

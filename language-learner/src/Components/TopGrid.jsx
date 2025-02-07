import React from "react";
import "../Styles/TopGrid.scss";
import DropTile from "./DropTile";
import { useGameState } from "../Contexts/GameStateContext.js";

const TopGrid = () => {
  const { characters, filters } = useGameState();

  return (
    <div className="top-grid-container">

      <div className={`grid dropgrid ${true ? 'vertical' : 'horizontal'}`}>

      {characters &&
        characters.masterTopCharacters.map((character, index) => {
          if (
            (character.modifierGroup === "dakuten" && !filters.modifierGroup.dakuten) ||
            (character.modifierGroup === "handakuten" && !filters.modifierGroup.handakuten)
          ) {
            return null;
          }
          return (
            <DropTile
              key={`top-grid-item-${index}`}
              characterObj={character}
              index={index}
            />
          );
        })
      }

      </div>
    </div>
  );
};

export default TopGrid;

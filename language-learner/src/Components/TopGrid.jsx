import React from "react";
import "../Styles/TopGrid.scss";
import DropTile from "./DropTile";
import { useGameState } from "../Contexts/GameStateContext.js";

const TopGrid = () => {
  const { characters, filters, options } = useGameState();
  const rowLevel = options.rowLevel || 1;

  const isWithinRowLevel = (identifier) => {
    if (!identifier) return true;
    const numericPortion = parseInt(identifier, 10);
    if (Number.isNaN(numericPortion)) return true;
    return Math.floor(numericPortion / 5) < rowLevel;
  };

  return (
    <div className="top-grid-container">

      <div className={`grid dropgrid ${true ? 'vertical' : 'horizontal'}`}>

      {characters &&
        characters.masterTopCharacters.map((character, index) => {
          if (!isWithinRowLevel(character.id)) {
            return null;
          }
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

import React from "react";
import "../Styles/TopGrid.scss";
import DropTile from "./DropTile";
import { useGameState } from "../Contexts/GameStateContext.js";
import { PROGRESSION_MODES } from "../Misc/levelUtils";

const TopGrid = () => {
  const { characters, filters, options } = useGameState();
  const rowRange = options.rowRange || { start: 1, end: options.rowLevel || 1 };
  const studyMode = options.studyMode || PROGRESSION_MODES.LINEAR;
  const vowelHeaders = ["a", "i", "u", "e", "o"];

  const isWithinRowRange = (identifier) => {
    if (!identifier) return true;
    const numericPortion = parseInt(identifier, 10);
    if (Number.isNaN(numericPortion)) return true;
    const rowNumber = Math.floor(numericPortion / 5) + 1;
    return rowNumber >= (rowRange?.start || 1) && rowNumber <= (rowRange?.end || 1);
  };

  const shouldRenderTile = (character) => {
    if (!character) return false;
    if (studyMode === PROGRESSION_MODES.SHAPES || studyMode === PROGRESSION_MODES.ADAPTIVE) {
      return true;
    }
    return isWithinRowRange(character.id);
  };

  return (
    <div className="top-grid-container">
      <div className="top-grid-legend">
        {vowelHeaders.map((letter) => (
          <span key={letter} className="top-grid-legend-item">
            {letter.toUpperCase()}
          </span>
        ))}
      </div>
      <div className={`grid dropgrid ${true ? 'vertical' : 'horizontal'}`}>

      {characters &&
        characters.topCharacters.map((character, index) => {
          if (!shouldRenderTile(character)) {
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

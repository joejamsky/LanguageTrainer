import React, { useMemo } from "react";
import "../../../styles/TopGrid.scss";
import DropTile from "./dropTile";
import { useCharacters } from "../../../contexts/gameStateContext.js";
import { getRowNumberForTileId } from "../../../data/kanaGroups";

const BASE_ROW_LABELS = {
  1: "V",
  2: "K",
  3: "S",
  4: "T",
  5: "N",
  6: "H",
  7: "M",
  8: "Y",
  9: "R",
  10: "W",
};

const DAKUTEN_ROW_LABELS = {
  2: "G",
  3: "Z",
  4: "D",
  6: "B",
};

const HANDAKUTEN_ROW_LABELS = {
  6: "P",
};

const TopGrid = () => {
  const { characters } = useCharacters();
  const vowelHeaders = ["a", "i", "u", "e", "o"];

  const rowLabels = useMemo(() => {
    if (!characters?.topCharacters) {
      return [];
    }
    const seen = new Set();
    const labels = [];
    characters.topCharacters.forEach((character) => {
      const rowNumber = getRowNumberForTileId(character.id);
      const modifierGroup = character.modifierGroup || "base";
      const rowKey = `${modifierGroup}-${rowNumber}`;
      if (!rowNumber || seen.has(rowKey)) {
        return;
      }
      seen.add(rowKey);
      let label = "";
      if (modifierGroup === "dakuten") {
        label = DAKUTEN_ROW_LABELS[rowNumber] || BASE_ROW_LABELS[rowNumber] || "";
      } else if (modifierGroup === "handakuten") {
        label = HANDAKUTEN_ROW_LABELS[rowNumber] || BASE_ROW_LABELS[rowNumber] || "";
      } else {
        label = BASE_ROW_LABELS[rowNumber] || "";
      }
      labels.push({
        rowNumber,
        modifierGroup,
        label,
      });
    });
    return labels;
  }, [characters?.topCharacters]);

  return (
    <div className="top-grid-container">
      <div className="top-grid-layout">
        <div className="top-grid-rail" aria-hidden>
          <div className="top-grid-rail-header" />
          <div className="top-grid-rail-body">
            {rowLabels.map(({ rowNumber, label }) => (
              <span key={`left-rail-${rowNumber}`} className="top-grid-rail-label">
                {label || "\u00A0"}
              </span>
            ))}
          </div>
        </div>

        <div className="top-grid-center">
          <div className="board-grid top-grid-legend">
            {vowelHeaders.map((letter) => (
              <span key={letter} className="top-grid-legend-item">
                {letter.toUpperCase()}
              </span>
            ))}
          </div>

          <div className="board-grid board-grid--squares">
            {characters &&
              characters.topCharacters.map((character, index) => (
                <DropTile
                  key={`top-grid-item-${index}`}
                  characterObj={character}
                  index={index}
                />
              ))}
          </div>
        </div>

        <div className="top-grid-rail" aria-hidden>
          <div className="top-grid-rail-header" />
          <div className="top-grid-rail-body">
            {rowLabels.map(({ rowNumber, label }) => (
              <span key={`right-rail-${rowNumber}`} className="top-grid-rail-label">
                {label || "\u00A0"}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopGrid;

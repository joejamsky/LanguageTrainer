// BotGrid.jsx
import React from 'react';
import "../Styles/BotGrid.scss";
import DragTile from './DragTile';
import TextInput from './TextInput';
import { useGameState } from "../Contexts/GameStateContext.js";
import { getGridCoordinatesForTile } from "../Contexts/utils/characterUtils";

const BotGrid = () => {
  const { characters, screenSize } = useGameState();

  const rawTiles = characters.botCharacters || [];

  const currentRowNumber = (() => {
    if (!rawTiles.length) return null;
    const coords = getGridCoordinatesForTile(rawTiles[0]);
    return coords?.row ?? null;
  })();

  const visibleFullRow = currentRowNumber
    ? rawTiles
        .filter((tile) => (getGridCoordinatesForTile(tile)?.row ?? null) === currentRowNumber)
        .sort((a, b) => {
          const aCol = getGridCoordinatesForTile(a)?.column ?? 0;
          const bCol = getGridCoordinatesForTile(b)?.column ?? 0;
          return aCol - bCol;
        })
    : [];

  const paddedTiles = Array.from({ length: 5 }, (_, idx) => visibleFullRow[idx] || null);

  return (
    <div className="bot-grid-container">
      {(screenSize === 'laptop' || screenSize === 'desktop') && (
        <div>
          <TextInput />
        </div>
      )}

      <div id="draggrid" className={`grid draggrid ${true ? 'vertical' : 'horizontal'}`}>
        {paddedTiles.map((script, columnIndex) => {
          if (!script) {
            return (
              <div
                key={`bot-grid-placeholder-${columnIndex}`}
                className="bot-grid-item placeholder"
                style={{ gridColumn: columnIndex + 1 }}
                aria-hidden
              />
            );
          }
          return (
            <DragTile
              key={`bot-grid-item-${script.id}`}
              index={columnIndex}
              columnPosition={columnIndex + 1}
              characterObj={script}
            />
          );
        })}
      </div>

      {/* <div className='shadow-gradient'></div> */}
    </div>
  );
};

export default BotGrid;

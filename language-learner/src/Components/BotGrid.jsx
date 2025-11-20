// BotGrid.jsx
import React from 'react';
import "../Styles/BotGrid.scss";
import DragTile from './DragTile';
import TextInput from './TextInput';
import { useGameState } from "../Contexts/GameStateContext.js";
import { getGridCoordinatesForTile } from "../Contexts/utils/characterUtils";

const BotGrid = () => {
  const { characters, screenSize, options } = useGameState();

  const rawTiles = characters.botCharacters || [];
  const columnShuffleEnabled = options?.sorting?.columnShuffle;

  const currentRowNumber = (() => {
    if (!rawTiles.length || columnShuffleEnabled) return null;
    const coords = getGridCoordinatesForTile(rawTiles[0]);
    return coords?.row ?? null;
  })();

  const visibleFullRow = currentRowNumber
    ? rawTiles
        .map((tile, rawIndex) => ({
          tile,
          rawIndex,
          coords: getGridCoordinatesForTile(tile),
        }))
        .filter(({ coords }) => (coords?.row ?? null) === currentRowNumber)
    : [];

  const queueEntries = columnShuffleEnabled
    ? rawTiles.slice(0, 5).map((tile, rawIndex) => ({
        tile,
        rawIndex,
      }))
    : [];

  const activeEntries = columnShuffleEnabled ? queueEntries : visibleFullRow;
  const paddedTiles = Array.from({ length: 5 }, (_, idx) => activeEntries[idx] || null);
  const targetTileId = paddedTiles[0]?.tile?.id ?? null;

  return (
    <div className="bot-grid-container">
      {(screenSize === 'laptop' || screenSize === 'desktop') && <TextInput />}

      <div id="draggrid" className={`grid draggrid ${true ? 'vertical' : 'horizontal'}`}>
        {paddedTiles.map((entry, columnIndex) => {
          if (!entry) {
            return (
              <div
                key={`bot-grid-placeholder-${columnIndex}`}
                className="bot-grid-item placeholder"
                style={{ gridColumn: columnIndex + 1 }}
                aria-hidden
              />
            );
          }
          const { tile, rawIndex } = entry;
          return (
            <DragTile
              key={`bot-grid-item-${tile.id}`}
              index={rawIndex}
              columnPosition={columnIndex + 1}
              characterObj={tile}
            />
          );
        })}
      </div>

      {/* <div className='shadow-gradient'></div> */}
    </div>
  );
};

export default BotGrid;

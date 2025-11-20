// BotGrid.jsx
import React, { useEffect, useRef, useState } from 'react';
import "../Styles/BotGrid.scss";
import DragTile from './DragTile';
import TextInput from './TextInput';
import { useGameState } from "../Contexts/GameStateContext.js";
import { getGridCoordinatesForTile } from "../Contexts/utils/characterUtils";

const SLIDE_DURATION_MS = 100;

const BotGrid = () => {
  const { characters, screenSize, options } = useGameState();

  const rawTiles = characters.botCharacters || [];
  const [firstTileSliding, setFirstTileSliding] = useState(false);
  const [secondTileSliding, setSecondTileSliding] = useState(false);
  const firstSlideTimeoutRef = useRef(null);
  const secondSlideTimeoutRef = useRef(null);
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

  useEffect(() => {
    return () => {
      if (firstSlideTimeoutRef.current) {
        clearTimeout(firstSlideTimeoutRef.current);
        firstSlideTimeoutRef.current = null;
      }
      if (secondSlideTimeoutRef.current) {
        clearTimeout(secondSlideTimeoutRef.current);
        secondSlideTimeoutRef.current = null;
      }
    };
  }, []);

  const triggerFirstTileSlide = (completedTileId) => {
    if (!completedTileId || completedTileId !== targetTileId) return;
    if (firstSlideTimeoutRef.current) {
      clearTimeout(firstSlideTimeoutRef.current);
    }
    setFirstTileSliding(true);
    firstSlideTimeoutRef.current = setTimeout(() => {
      setFirstTileSliding(false);
      firstSlideTimeoutRef.current = null;
    }, SLIDE_DURATION_MS);

    if (secondSlideTimeoutRef.current) {
      clearTimeout(secondSlideTimeoutRef.current);
    }
    setSecondTileSliding(true);
    secondSlideTimeoutRef.current = setTimeout(() => {
      setSecondTileSliding(false);
      secondSlideTimeoutRef.current = null;
    }, SLIDE_DURATION_MS);
  };

  return (
    <div className="bot-grid-container">
      
      {(screenSize === 'laptop' || screenSize === 'desktop') && (
        <div className='text-input-container'>
          <TextInput
            targetTileId={targetTileId}
            onCorrectAnswer={triggerFirstTileSlide}
            completionDelayMs={SLIDE_DURATION_MS}
          />
          <div className='kana-portal'></div>
        </div>
      )}

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
          const isFirstTile = columnIndex === 0;
          const isSecondTile = columnIndex === 1;
          const extraClassName = [
            isFirstTile && firstTileSliding ? 'slide-vertical' : '',
            isSecondTile && secondTileSliding ? 'slide-horizontal' : '',
          ]
            .filter(Boolean)
            .join(' ');
          return (
            <DragTile
              key={`bot-grid-item-${tile.id}`}
              index={rawIndex}
              columnPosition={columnIndex + 1}
              characterObj={tile}
              extraClassName={extraClassName}
            />
          );
        })}
      </div>
      {/* <div className='shadow-gradient'></div> */}
    </div>
  );
};

export default BotGrid;

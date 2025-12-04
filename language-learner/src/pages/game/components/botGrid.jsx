// BotGrid.jsx
import React, { useEffect, useMemo, useState } from 'react';
import "../../../styles/BotGrid.scss";
import DragTile from './dragTile';
import TextInput from './textInput';
import { useCharacters, useSettings } from "../../../contexts/gameStateContext.js";
import { getGridCoordinatesForTile } from "../../../contexts/utils/characterUtils";
import { TILE_COMPLETION_ANIMATION_MS } from "../../../core/constants/animation";
import { useTileCompletionAnimation } from "../hooks/useTileCompletionAnimation";

const TRAY_SLOT_COUNT = 5;

const buildEmptySlots = () => Array(TRAY_SLOT_COUNT).fill(null);

const BotGrid = () => {
  const { characters, registerTileCompletionListener } = useCharacters();
  const { screenSize } = useSettings();

  const rawTiles = useMemo(() => characters.botCharacters || [], [characters.botCharacters]);
  const isDesktopView = screenSize === 'laptop' || screenSize === 'desktop';
  const tileLookupById = useMemo(() => {
    const map = new Map();
    rawTiles.forEach((tile, rawIndex) => {
      map.set(tile.id, { tile, rawIndex });
    });
    return map;
  }, [rawTiles]);

  const trayQueue = useMemo(() => {
    if (!rawTiles.length) return [];
    const entries = [];
    let currentRowNumber = null;
    let currentSlots = buildEmptySlots();
    rawTiles.forEach((tile) => {
      const coords = getGridCoordinatesForTile(tile);
      const rowNumber = coords?.row ?? null;
      if (currentRowNumber === null) {
        currentRowNumber = rowNumber;
      } else if (rowNumber !== currentRowNumber) {
        entries.push({
          key: `row-${currentRowNumber}`,
          rowNumber: currentRowNumber,
          slots: currentSlots,
        });
        currentRowNumber = rowNumber;
        currentSlots = buildEmptySlots();
      }
      const columnIndex =
        coords?.column && coords.column >= 1 && coords.column <= TRAY_SLOT_COUNT
          ? coords.column - 1
          : currentSlots.findIndex((slot) => slot === null);
      if (columnIndex >= 0) {
        currentSlots[columnIndex] = tile.id;
      }
    });
    if (currentRowNumber !== null) {
      entries.push({
        key: `row-${currentRowNumber}`,
        rowNumber: currentRowNumber,
        slots: currentSlots,
      });
    }
    return entries;
  }, [rawTiles]);

  const [chunkSlots, setChunkSlots] = useState(() => buildEmptySlots());
  const [currentTrayKey, setCurrentTrayKey] = useState(null);

  useEffect(() => {
    setChunkSlots((prev) => {
      let changed = false;
      const next = prev.map((tileId) => {
        if (!tileId) return null;
        if (tileLookupById.has(tileId)) return tileId;
        changed = true;
        return null;
      });
      return changed ? next : prev;
    });
  }, [tileLookupById]);

  useEffect(() => {
    if (!trayQueue.length) {
      if (currentTrayKey !== null || chunkSlots.some(Boolean)) {
        setChunkSlots(buildEmptySlots());
        setCurrentTrayKey(null);
      }
      return;
    }

    if (!currentTrayKey) {
      setChunkSlots(trayQueue[0].slots);
      setCurrentTrayKey(trayQueue[0].key);
      return;
    }

    const currentIndex = trayQueue.findIndex((entry) => entry.key === currentTrayKey);
    if (currentIndex === -1) {
      setChunkSlots(trayQueue[0].slots);
      setCurrentTrayKey(trayQueue[0].key);
      return;
    }

    if (chunkSlots.every((slot) => slot === null)) {
      const nextEntry = trayQueue[currentIndex + 1];
      if (nextEntry) {
        setChunkSlots(nextEntry.slots);
        setCurrentTrayKey(nextEntry.key);
      } else {
        setCurrentTrayKey(null);
      }
    }
  }, [chunkSlots, currentTrayKey, trayQueue]);

  const { activeTileId, getTileAnimationProps } = useTileCompletionAnimation({
    chunkSlots,
    tileLookupById,
    registerTileCompletionListener,
  });

  const targetTileId = activeTileId;

  const slotEntries = chunkSlots.map((tileId, slotIndex) => {
    if (!tileId) {
      return {
        slotIndex,
        tile: null,
        rawIndex: null,
      };
    }
    const lookup = tileLookupById.get(tileId);
    return {
      slotIndex,
      tile: lookup?.tile ?? null,
      rawIndex: lookup?.rawIndex ?? null,
    };
  });

  return (
    <div className="bot-grid-container">
      <div id="draggrid" className="board-grid">
        {slotEntries.map(({ slotIndex, tile, rawIndex }) => {
          if (!tile) {
            return (
              <div
                key={`bot-grid-placeholder-${currentTrayKey ?? 'tray'}-${slotIndex}`}
                className="bot-grid-item placeholder"
                style={{ gridColumn: slotIndex + 1 }}
                aria-hidden
              />
            );
          }
          const { styleOverrides, extraClassName } = getTileAnimationProps(tile.id);
          const isActive = isDesktopView && tile.id === activeTileId;
          return (
            <DragTile
              key={`bot-grid-item-${tile.id}`}
              index={rawIndex}
              columnPosition={slotIndex + 1}
              characterObj={tile}
              extraClassName={extraClassName}
              styleOverrides={styleOverrides}
              isActive={isActive}
            />
          );
        })}
      </div>

      {(screenSize === 'laptop' || screenSize === 'desktop') && (
        <div className="text-input-container">
          <TextInput
            targetTileId={targetTileId}
            completionDelayMs={TILE_COMPLETION_ANIMATION_MS}
          />
        </div>
      )}
    </div>
  );
};

export default BotGrid;

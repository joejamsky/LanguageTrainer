// BotGrid.jsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import "../../../styles/BotGrid.scss";
import DragTile from './dragTile';
import TextInput from './textInput';
import { useGameState } from "../../../contexts/gameStateContext.js";
import { getGridCoordinatesForTile } from "../../../contexts/utils/characterUtils";
import { TILE_COMPLETION_ANIMATION_MS } from "../../../constants/animation";

const TRAY_SLOT_COUNT = 5;

const buildEmptySlots = () => Array(TRAY_SLOT_COUNT).fill(null);

const BotGrid = () => {
  const { characters, screenSize, registerTileCompletionListener } = useGameState();

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
  const [activeAnimation, setActiveAnimation] = useState(null);
  const [pendingClears, setPendingClears] = useState(() => new Set());
  const animationTimeoutRef = useRef(null);

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

  useEffect(() => {
    setPendingClears((prev) => {
      if (!prev.size) {
        return prev;
      }
      let changed = false;
      const next = new Set();
      prev.forEach((id) => {
        if (tileLookupById.has(id)) {
          next.add(id);
        } else {
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, [tileLookupById]);

  useEffect(() => {
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
        animationTimeoutRef.current = null;
      }
    };
  }, []);

  const activeTileId = useMemo(() => {
    for (const tileId of chunkSlots) {
      if (!tileId) continue;
      if (pendingClears.has(tileId)) continue;
      if (tileLookupById.has(tileId)) {
        return tileId;
      }
    }
    return null;
  }, [chunkSlots, pendingClears, tileLookupById]);

  const targetTileId = activeTileId;

  const triggerCompletionAnimation = useCallback(
    (completedTileId) => {
      if (!completedTileId) return;
      const tileEntry = tileLookupById.get(completedTileId);
      if (!tileEntry) {
        return;
      }
      const botTileElement = document.getElementById(`draggable-${completedTileId}`);
      const targetTileElement = document.getElementById(`drop-tile-${tileEntry.tile.parentId}`);
      if (!botTileElement || !targetTileElement) {
        return;
      }

      const botRect = botTileElement.getBoundingClientRect();
      const targetRect = targetTileElement.getBoundingClientRect();
      const translateX =
        targetRect.left + targetRect.width / 2 - (botRect.left + botRect.width / 2);
      const translateY =
        targetRect.top + targetRect.height / 2 - (botRect.top + botRect.height / 2);

      setPendingClears((prev) => {
        if (prev.has(completedTileId)) {
          return prev;
        }
        const next = new Set(prev);
        next.add(completedTileId);
        return next;
      });

      setActiveAnimation({
        tileId: completedTileId,
        tile: tileEntry.tile,
        translateX,
        translateY,
        key: `${completedTileId}-${Date.now()}`,
      });

      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
      animationTimeoutRef.current = setTimeout(() => {
        setActiveAnimation(null);
        animationTimeoutRef.current = null;
      }, TILE_COMPLETION_ANIMATION_MS);
    },
    [tileLookupById]
  );

  useEffect(() => {
    if (!registerTileCompletionListener) return undefined;
    const unsubscribe = registerTileCompletionListener(triggerCompletionAnimation);
    return unsubscribe;
  }, [registerTileCompletionListener, triggerCompletionAnimation]);

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
          const isCompleting = activeAnimation?.tileId === tile.id;
          const animationStyle = isCompleting
            ? {
                transform: `translate(${activeAnimation.translateX}px, ${activeAnimation.translateY}px)`,
                transition: `transform ${TILE_COMPLETION_ANIMATION_MS}ms ease-in-out`,
              }
            : undefined;
          const extraClassName = isCompleting ? 'completing' : '';
          const isActive = isDesktopView && tile.id === activeTileId;
          return (
            <DragTile
              key={`bot-grid-item-${tile.id}`}
              index={rawIndex}
              columnPosition={slotIndex + 1}
              characterObj={tile}
              extraClassName={extraClassName}
              styleOverrides={animationStyle}
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

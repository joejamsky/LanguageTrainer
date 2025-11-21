// BotGrid.jsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import "../Styles/BotGrid.scss";
import DragTile from './DragTile';
import TextInput from './TextInput';
import { useGameState } from "../Contexts/GameStateContext.js";
import { getGridCoordinatesForTile } from "../Contexts/utils/characterUtils";
import { TILE_COMPLETION_ANIMATION_MS } from "../Constants/animation";

const TRAY_SLOT_COUNT = 5;

const buildSlotSnapshot = (tiles = []) =>
  Array.from({ length: TRAY_SLOT_COUNT }, (_, idx) => tiles[idx]?.id ?? null);

const BotGrid = () => {
  const { characters, screenSize, options, registerTileCompletionListener } = useGameState();

  const rawTiles = useMemo(() => characters.botCharacters || [], [characters.botCharacters]);
  const columnShuffleEnabled = options?.sorting?.columnShuffle;
  const tileLookupById = useMemo(() => {
    const map = new Map();
    rawTiles.forEach((tile, rawIndex) => {
      map.set(tile.id, { tile, rawIndex });
    });
    return map;
  }, [rawTiles]);

  const currentRowNumber = useMemo(() => {
    if (!rawTiles.length || columnShuffleEnabled) return null;
    const coords = getGridCoordinatesForTile(rawTiles[0]);
    return coords?.row ?? null;
  }, [rawTiles, columnShuffleEnabled]);

  const rowTiles = useMemo(() => {
    if (!currentRowNumber) return [];
    return rawTiles.filter((tile) => {
      const coords = getGridCoordinatesForTile(tile);
      return (coords?.row ?? null) === currentRowNumber;
    });
  }, [rawTiles, currentRowNumber]);

  const activeTilePool = useMemo(() => {
    if (columnShuffleEnabled) {
      return rawTiles.slice(0, TRAY_SLOT_COUNT);
    }
    return rowTiles.slice(0, TRAY_SLOT_COUNT);
  }, [columnShuffleEnabled, rawTiles, rowTiles]);

  const [chunkSlots, setChunkSlots] = useState(() => buildSlotSnapshot(activeTilePool));
  const [activeAnimation, setActiveAnimation] = useState(null);
  const [pendingClears, setPendingClears] = useState(() => new Set());
  const animationTimeoutRef = useRef(null);

  useEffect(() => {
    setChunkSlots((prevSlots) => {
      if (!prevSlots.length) {
        return buildSlotSnapshot(activeTilePool);
      }
      const availableIds = new Set(activeTilePool.map((tile) => tile.id));
      let changed = false;
      const nextSlots = prevSlots.map((tileId) => {
        const nextId = tileId && availableIds.has(tileId) ? tileId : null;
        if (nextId !== tileId) {
          changed = true;
        }
        return nextId;
      });
      const hasActiveSlot = nextSlots.some((id) => id);
      if (!hasActiveSlot && activeTilePool.length > 0) {
        return buildSlotSnapshot(activeTilePool);
      }
      return changed ? nextSlots : prevSlots;
    });
  }, [activeTilePool]);

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
      <div id="draggrid" className="grid draggrid vertical">
        {slotEntries.map(({ slotIndex, tile, rawIndex }) => {
          if (!tile) {
            return (
              <div
                key={`bot-grid-placeholder-${slotIndex}`}
                className="bot-grid-item placeholder"
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
          const isActive = tile.id === activeTileId;
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

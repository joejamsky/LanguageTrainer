import { useCallback, useEffect, useState } from "react";
import { getGridCoordinatesForTile } from "../../utils/characterUtils";

const INITIAL_ATTEMPT = {
  tileId: null,
  startedAt: null,
  misses: 0,
};

const getNextPlayableTile = (botTiles = []) => {
  if (!botTiles.length) {
    return null;
  }

  const firstTile = botTiles[0];
  const firstCoords = getGridCoordinatesForTile(firstTile);
  const currentRowNumber = firstCoords?.row ?? null;

  if (currentRowNumber === null) {
    return firstTile;
  }

  const rowTiles = botTiles.filter(
    (tile) => (getGridCoordinatesForTile(tile)?.row ?? null) === currentRowNumber
  );

  return rowTiles[0] ?? firstTile;
};

export const useActiveAttempt = (botCharacters) => {
  const [activeAttempt, setActiveAttempt] = useState(INITIAL_ATTEMPT);

  const resetActiveAttempt = useCallback(() => {
    setActiveAttempt(INITIAL_ATTEMPT);
  }, []);

  const registerMissForTile = useCallback((tileId) => {
    if (!tileId) return;
    setActiveAttempt((prev) => {
      if (prev.tileId !== tileId) return prev;
      return {
        ...prev,
        misses: prev.misses + 1,
      };
    });
  }, []);

  useEffect(() => {
    const nextPlayableTile = getNextPlayableTile(botCharacters || []);
    if (!nextPlayableTile) {
      setActiveAttempt((prev) =>
        prev.tileId === null ? prev : INITIAL_ATTEMPT
      );
      return;
    }
    setActiveAttempt((prev) => {
      if (prev.tileId === nextPlayableTile.id) return prev;
      return {
        tileId: nextPlayableTile.id,
        startedAt: Date.now(),
        misses: 0,
      };
    });
  }, [botCharacters]);

  return {
    activeAttempt,
    resetActiveAttempt,
    registerMissForTile,
  };
};

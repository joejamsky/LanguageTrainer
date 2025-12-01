import { useCallback, useRef } from "react";
import { TILE_COMPLETION_ANIMATION_MS } from "../../../constants/animation";
import { defaultState } from "../../../core/utils";
import { getRemainingPlayableTiles } from "../../utils/characterUtils";
import { saveCharactersToLocalStorage } from "./characterStorage";

export const useTileCompletionManager = ({
  characters,
  setCharacters,
  selectedTile,
  setSelectedTile,
  setGame,
}) => {
  const completionTimeoutsRef = useRef({});
  const completionListenersRef = useRef(new Set());
  const botCharacters = characters?.botCharacters || [];

  const clearCompletionTimeout = useCallback((tileId) => {
    if (!tileId) return;
    const timeoutId = completionTimeoutsRef.current[tileId];
    if (!timeoutId) return;
    clearTimeout(timeoutId);
    delete completionTimeoutsRef.current[tileId];
  }, []);

  const clearAllCompletionTimeouts = useCallback(() => {
    Object.values(completionTimeoutsRef.current).forEach((timeoutId) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    });
    completionTimeoutsRef.current = {};
  }, []);

  const registerTileCompletionListener = useCallback((listener) => {
    if (typeof listener !== "function") {
      return () => {};
    }
    completionListenersRef.current.add(listener);
    return () => {
      completionListenersRef.current.delete(listener);
    };
  }, []);

  const notifyTileCompletionListeners = useCallback((tileId) => {
    if (!tileId) return;
    completionListenersRef.current.forEach((listener) => {
      listener(tileId);
    });
  }, []);

  const completeTileAtIndex = useCallback(
    (tileTarget) => {
      let didComplete = false;

      setCharacters((prevChars) => {
        const tempBotChars = [...(prevChars.botCharacters || [])];
        const tempTopChars = [...(prevChars.topCharacters || [])];
        let tileIndex =
          typeof tileTarget === "number"
            ? tileTarget
            : tempBotChars.findIndex((tile) => tile?.id === tileTarget);

        if (tileIndex < 0) {
          return prevChars;
        }

        const currentTile = tempBotChars[tileIndex];
        if (!currentTile) {
          return prevChars;
        }

        const topTile = tempTopChars.find(
          (tile) => tile.id === currentTile.parentId
        );
        if (topTile?.scripts) {
          Object.values(topTile.scripts).forEach((script) => {
            if (script.id === currentTile.id) {
              script.filled = true;
            }
          });
        }

        tempBotChars.splice(tileIndex, 1);
        clearCompletionTimeout(currentTile.id);

        const remainingTiles = getRemainingPlayableTiles(tempBotChars);
        const updatedState = {
          ...prevChars,
          topCharacters: tempTopChars,
          botCharacters: tempBotChars,
        };

        saveCharactersToLocalStorage(updatedState);
        didComplete = true;

        if (remainingTiles === 0) {
          setGame((prevGame) =>
            prevGame.gameover ? prevGame : { ...prevGame, gameover: true }
          );
        }

        return updatedState;
      });

      return didComplete;
    },
    [clearCompletionTimeout, setCharacters, setGame]
  );

  const scheduleTileCompletion = useCallback(
    (tileId, delayMs) => {
      if (!tileId || delayMs <= 0) return;
      clearCompletionTimeout(tileId);
      completionTimeoutsRef.current[tileId] = setTimeout(() => {
        completeTileAtIndex(tileId);
      }, delayMs);
    },
    [clearCompletionTimeout, completeTileAtIndex]
  );

  const handleDrop = useCallback(
    (targetId, _targetIndex) => {
      if (selectedTile.index === null || selectedTile.index === undefined)
        return;
      const draggedTile = botCharacters[selectedTile.index];
      if (!draggedTile || draggedTile.parentId !== targetId) {
        return;
      }

      notifyTileCompletionListeners(draggedTile.id);

      if (TILE_COMPLETION_ANIMATION_MS > 0) {
        scheduleTileCompletion(draggedTile.id, TILE_COMPLETION_ANIMATION_MS);
        setSelectedTile(defaultState.selectedTile);
        return;
      }

      const completed = completeTileAtIndex(selectedTile.index);
      if (completed) {
        setSelectedTile(defaultState.selectedTile);
      }
    },
    [
      botCharacters,
      completeTileAtIndex,
      notifyTileCompletionListeners,
      scheduleTileCompletion,
      selectedTile.index,
      setSelectedTile,
    ]
  );

  return {
    registerTileCompletionListener,
    notifyTileCompletionListeners,
    scheduleTileCompletion,
    clearAllCompletionTimeouts,
    completeTileAtIndex,
    handleDrop,
  };
};

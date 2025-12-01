import { useCallback, useEffect, useMemo, useState } from "react";
import { defaultState } from "../../core/utils";
import {
  applyAttemptToTilePerformance,
  applyMissToTilePerformance,
} from "../../core/statUtils";
import {
  buildTileFilterState,
  cloneTopCharacters,
  getInitialCharacters,
  matchInput,
  tilePassesFilter,
  updateMissedTile,
} from "../utils/characterUtils";
import { useActiveAttempt } from "./characters/useActiveAttempt";
import { useTileCompletionManager } from "./characters/useTileCompletionManager";
import { saveCharactersToLocalStorage } from "./characters/characterStorage";

const getSoundOrderedTiles = (tiles = []) => [...tiles];

export const useCharactersState = ({
  filters,
  options,
  tileStats,
  setTileStats,
  setStats,
  game,
  setGame,
}) => {
  const [characters, setCharacters] = useState(() =>
    getInitialCharacters(filters, options, tileStats)
  );
  const [selectedTile, setSelectedTile] = useState(defaultState.selectedTile);
  const [inputFocusKey, setInputFocusKey] = useState(0);
  const { activeAttempt, resetActiveAttempt, registerMissForTile } = useActiveAttempt(
    characters?.botCharacters
  );
  const {
    registerTileCompletionListener,
    notifyTileCompletionListeners,
    scheduleTileCompletion,
    clearAllCompletionTimeouts,
    completeTileAtIndex,
    handleDrop,
  } = useTileCompletionManager({
    characters,
    setCharacters,
    selectedTile,
    setSelectedTile,
    setGame,
  });

  const reset = useCallback(
    (overrideFilters, overrideOptions) => {
      const sourceFilters = overrideFilters || filters;
      const sourceOptions = overrideOptions || options;
      clearAllCompletionTimeouts();
      setGame(defaultState.game);
      setSelectedTile(defaultState.selectedTile);
      setCharacters(getInitialCharacters(sourceFilters, sourceOptions, tileStats));
      resetActiveAttempt();
    },
    [
      clearAllCompletionTimeouts,
      filters,
      options,
      tileStats,
      resetActiveAttempt,
      setGame,
    ]
  );

  const tileFilterState = useMemo(
    () => buildTileFilterState(filters, options),
    [filters, options]
  );

  useEffect(() => {
    setCharacters((prevChars) => {
      if (!prevChars) return prevChars;
      const filteredBot = prevChars.masterBotCharacters.filter((item) =>
        tilePassesFilter(item, tileFilterState)
      );
      const updatedBotCharacters = getSoundOrderedTiles(filteredBot);

      return {
        ...prevChars,
        botCharacters: updatedBotCharacters,
        topCharacters: cloneTopCharacters(),
      };
    });
  }, [tileFilterState]);

  const handleTextSubmit = useCallback(
    (submittedChar, targetTileId = null, submissionOptions = {}) => {
      const { delayCompletionMs = 0 } = submissionOptions;
      const tempBotChars = [...characters.botCharacters];
      if (!tempBotChars.length) {
        return;
      }

      let tileIndex = 0;
      if (targetTileId) {
        const locatedIndex = tempBotChars.findIndex((tile) => tile?.id === targetTileId);
        if (locatedIndex !== -1) {
          tileIndex = locatedIndex;
        }
      }

      const currentTile = tempBotChars[tileIndex];
      if (!currentTile) {
        return;
      }

      if (!game.start) {
        setGame((prevGame) => ({ ...prevGame, start: true }));
      }

      if (!matchInput(currentTile, submittedChar)) {
        const newState = updateMissedTile(currentTile, characters);
        setCharacters(newState);
        saveCharactersToLocalStorage(newState);
        setTileStats((prev) => applyMissToTilePerformance(prev, currentTile.id));
        setStats((prevStats) => {
          if ((prevStats.kanaStreak || 0) === 0) {
            return prevStats;
          }
          return {
            ...prevStats,
            kanaStreak: 0,
          };
        });
        registerMissForTile(currentTile.id);
        return -1;
      }
      const missesBeforeSuccess =
        activeAttempt.tileId === currentTile.id ? activeAttempt.misses : 0;
      const durationSeconds =
        activeAttempt.tileId === currentTile.id && activeAttempt.startedAt
          ? (Date.now() - activeAttempt.startedAt) / 1000
          : null;

      setTileStats((prev) =>
        applyAttemptToTilePerformance(prev, currentTile.id, {
          durationSeconds,
          missesBeforeSuccess,
        })
      );

      if (missesBeforeSuccess === 0) {
        setStats((prevStats) => {
          const nextCurrent = (prevStats.kanaStreak || 0) + 1;
          const nextBest = Math.max(prevStats.bestKanaStreak || 0, nextCurrent);
          return {
            ...prevStats,
            kanaStreak: nextCurrent,
            bestKanaStreak: nextBest,
          };
        });
      }

      resetActiveAttempt();
      notifyTileCompletionListeners(currentTile.id);
      if (delayCompletionMs > 0) {
        scheduleTileCompletion(currentTile.id, delayCompletionMs);
      } else {
        completeTileAtIndex(tileIndex);
      }
      return currentTile.id;
    },
    [
      activeAttempt,
      characters,
      completeTileAtIndex,
      notifyTileCompletionListeners,
      game.start,
      registerMissForTile,
      resetActiveAttempt,
      scheduleTileCompletion,
      setGame,
      setStats,
      setTileStats,
    ]
  );

  useEffect(() => {
    return () => {
      clearAllCompletionTimeouts();
    };
  }, [clearAllCompletionTimeouts]);

  const bumpInputFocusKey = useCallback(() => {
    setInputFocusKey((prev) => prev + 1);
  }, []);

  return {
    characters,
    setCharacters,
    selectedTile,
    setSelectedTile,
    reset,
    handleDrop,
    handleTextSubmit,
    inputFocusKey,
    bumpInputFocusKey,
    registerTileCompletionListener,
  };
};

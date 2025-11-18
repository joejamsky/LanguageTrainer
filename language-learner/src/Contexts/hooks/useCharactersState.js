import { useCallback, useEffect, useMemo, useState } from "react";
import { defaultState } from "../../Misc/Utils";
import { getSoundSorted, shuffleByShapeGroup } from "../../Misc/ShuffleSort";
import { PROGRESSION_MODES } from "../../Misc/levelUtils";
import {
  applyAttemptToTilePerformance,
  applyMissToTilePerformance,
} from "../../Misc/statUtils";
import {
  clampRowRange,
  getRowCountFromRange,
  resolveStudyMode,
  resolveShapeGroup,
} from "../utils/optionsUtils";
import {
  cloneTopCharacters,
  getInitialCharacters,
  getGridCoordinatesForTile,
  getRemainingPlayableTiles,
  handleCharRenderToggles,
  matchInput,
  updateMissedTile,
} from "../utils/characterUtils";
import { isBrowser } from "../utils/storageUtils";

const saveCharactersToLocalStorage = (state) => {
  if (!isBrowser) return;
  try {
    localStorage.setItem("characters", JSON.stringify(state));
  } catch (error) {
    console.warn("Failed to persist characters state:", error);
  }
};

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
  const [activeAttempt, setActiveAttempt] = useState({
    tileId: null,
    startedAt: null,
    misses: 0,
  });

  const reset = useCallback(
    (overrideFilters, overrideOptions) => {
      const sourceFilters = overrideFilters || filters;
      const sourceOptions = overrideOptions || options;
      setGame(defaultState.game);
      setSelectedTile(defaultState.selectedTile);
      setCharacters(getInitialCharacters(sourceFilters, sourceOptions, tileStats));
      setActiveAttempt({
        tileId: null,
        startedAt: null,
        misses: 0,
      });
    },
    [filters, options, tileStats, setGame]
  );

  const { rowShuffle, columnShuffle } = options.sorting;
  const { current, methods } = options.gameMode;

  const resolvedShapeGroup = useMemo(
    () => resolveShapeGroup({ shapeGroup: options.shapeGroup }, filters),
    [options.shapeGroup, filters]
  );

  const filteringOptions = useMemo(
    () => ({
      rowRange: options.rowRange,
      studyMode: options.studyMode,
      shapeGroup: resolvedShapeGroup,
      accuracyThreshold: options.accuracyThreshold,
    }),
    [options.rowRange, options.studyMode, resolvedShapeGroup, options.accuracyThreshold]
  );

  useEffect(() => {
    setCharacters((prevChars) => {
      if (!prevChars) return prevChars;
      const filteredBot = prevChars.masterBotCharacters.filter((item) =>
        handleCharRenderToggles(item, filters, filteringOptions)
      );
      const rowRange = clampRowRange(filteringOptions.rowRange);
      const rowCount = getRowCountFromRange(rowRange);
      const studyMode = resolveStudyMode(filteringOptions);
      const shouldDisableShuffle = studyMode === PROGRESSION_MODES.ADAPTIVE;
      const effectiveColumnShuffle =
        !shouldDisableShuffle && rowCount > 1 ? columnShuffle : false;
      const effectiveRowShuffle = shouldDisableShuffle ? false : rowShuffle;

      let updatedBotCharacters;
      switch (methods[current]) {
        case "sound":
          updatedBotCharacters = getSoundSorted(
            filteredBot,
            effectiveRowShuffle,
            effectiveColumnShuffle
          );
          break;
        case "h-shape":
          updatedBotCharacters = shuffleByShapeGroup(
            filteredBot,
            "hiragana",
            effectiveRowShuffle,
            effectiveColumnShuffle
          );
          break;
        case "k-shape":
          updatedBotCharacters = shuffleByShapeGroup(
            filteredBot,
            "katakana",
            effectiveRowShuffle,
            effectiveColumnShuffle
          );
          break;
        case "missed":
          updatedBotCharacters = filteredBot.sort((a, b) => b.missed - a.missed);
          break;
        default:
          updatedBotCharacters = filteredBot;
      }

      return {
        ...prevChars,
        botCharacters: updatedBotCharacters,
        topCharacters: cloneTopCharacters(),
      };
    });
  }, [
    filters,
    filteringOptions,
    rowShuffle,
    columnShuffle,
    current,
    methods,
  ]);

  useEffect(() => {
    const botTiles = characters?.botCharacters || [];
    let nextPlayableTile = botTiles[0] ?? null;

    if (botTiles.length && !columnShuffle) {
      const firstCoords = getGridCoordinatesForTile(botTiles[0]);
      const currentRowNumber = firstCoords?.row ?? null;
      if (currentRowNumber !== null) {
        const rowTiles = botTiles.filter(
          (tile) => (getGridCoordinatesForTile(tile)?.row ?? null) === currentRowNumber
        );
        if (rowTiles.length) {
          nextPlayableTile = rowTiles[0];
        }
      }
    }

    const nextTileId = nextPlayableTile?.id ?? null;
    setActiveAttempt((prev) => {
      if (prev.tileId === nextTileId) return prev;
      if (!nextTileId) {
        return { tileId: null, startedAt: null, misses: 0 };
      }
      return {
        tileId: nextTileId,
        startedAt: Date.now(),
        misses: 0,
      };
    });
  }, [characters?.botCharacters, columnShuffle]);

  const completeTileAtIndex = useCallback(
    (tileIndex) => {
      let didComplete = false;

      setCharacters((prevChars) => {
        const tempBotChars = [...prevChars.botCharacters];
        const tempTopChars = [...prevChars.topCharacters];
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
    [setCharacters, setGame]
  );

  const handleDrop = useCallback(
    (targetId, _targetIndex) => {
      if (selectedTile.index === null || selectedTile.index === undefined) return;
      const draggedTile = characters.botCharacters[selectedTile.index];
      if (!draggedTile || draggedTile.parentId !== targetId) {
        return;
      }
      const completed = completeTileAtIndex(selectedTile.index);
      if (completed) {
        setSelectedTile(defaultState.selectedTile);
      }
    },
    [characters.botCharacters, completeTileAtIndex, selectedTile.index]
  );

  const handleTextSubmit = useCallback(
    (submittedChar, targetTileId = null) => {
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
        setActiveAttempt((prev) => {
          if (prev.tileId !== currentTile.id) return prev;
          return {
            ...prev,
            misses: prev.misses + 1,
          };
        });
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

      setActiveAttempt({
        tileId: null,
        startedAt: null,
        misses: 0,
      });
      completeTileAtIndex(tileIndex);
    },
    [
      activeAttempt,
      characters,
      completeTileAtIndex,
      game.start,
      setGame,
      setStats,
      setTileStats,
    ]
  );

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
  };
};

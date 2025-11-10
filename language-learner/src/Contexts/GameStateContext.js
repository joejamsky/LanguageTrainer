import React, { createContext, useState, useContext, useCallback, useEffect, useMemo, useRef } from 'react';
import {
  defaultState,
  breakpoints,
  dictionaryKanaToRomaji
} from '../Misc/Utils';
import { getSoundSorted, shuffleByShapeGroup } from '../Misc/ShuffleSort'
import japanese_characters_standard_bot from '../Data/japanese_characters_standard_bot.json'; 
import japanese_characters_standard_top from '../Data/japanese_characters_standard_top.json';
import {
  DEFAULT_LEVEL,
  persistStoredLevel,
  getScriptLevelFromFilters,
  getShuffleLevelFromSorting,
  getShuffleNodeByValue,
  buildLevelKey,
  getNextLevel,
  levelToScriptKey,
  loadLevelStats,
  persistLevelStats,
  clampShuffleLevelForRow,
} from '../Misc/levelUtils';
import {
  loadTilePerformance,
  persistTilePerformance,
  applyMissToTilePerformance,
  applyAttemptToTilePerformance,
} from '../Misc/statUtils';

/* =============================
   HELPER FUNCTIONS (Local)
   ============================= */

// Compares user's input with a script object's expected value.
const matchInput = (scriptObj, userInput) => {
  if (scriptObj.type === "romaji") {
    return scriptObj.character.toLowerCase() === userInput.toLowerCase();
  }
  const romaji = dictionaryKanaToRomaji[scriptObj.character] || "";
  return romaji.toLowerCase() === userInput.toLowerCase();
};

const SETTINGS_STORAGE_KEY = 'languageTrainerSettings';
const isBrowser = typeof window !== 'undefined';
const MS_PER_DAY = 24 * 60 * 60 * 1000;

const getDateKey = (date = new Date()) => {
  if (!date) return null;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const parseDateKey = (key) => {
  if (!key) return null;
  const [year, month, day] = key.split('-').map(Number);
  if ([year, month, day].some((value) => Number.isNaN(value))) {
    return null;
  }
  return new Date(year, (month || 1) - 1, day || 1);
};

const isPreviousCalendarDay = (previousKey, currentKey) => {
  const previousDate = parseDateKey(previousKey);
  const currentDate = parseDateKey(currentKey);
  if (!previousDate || !currentDate) return false;
  const diff = currentDate - previousDate;
  return Math.round(diff / MS_PER_DAY) === 1;
};

const mergeDeep = (target, source) => {
  const output = Array.isArray(target) ? [...target] : { ...target };
  if (!source || typeof source !== 'object') {
    return output;
  }

  Object.keys(source).forEach((key) => {
    const sourceValue = source[key];
    const targetValue = target ? target[key] : undefined;

    if (
      sourceValue &&
      typeof sourceValue === 'object' &&
      !Array.isArray(sourceValue)
    ) {
      output[key] = mergeDeep(
        targetValue && typeof targetValue === 'object' ? targetValue : {},
        sourceValue
      );
    } else {
      output[key] = sourceValue;
    }
  });

  return output;
};

const loadSettingsFromStorage = () => {
  if (!isBrowser) return null;
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (error) {
    console.warn('Failed to load settings from storage:', error);
    return null;
  }
};

const persistSettingsToStorage = (filters, options) => {
  if (!isBrowser) return;
  try {
    localStorage.setItem(
      SETTINGS_STORAGE_KEY,
      JSON.stringify({ filters, options })
    );
  } catch (error) {
    console.warn('Failed to persist settings to storage:', error);
  }
};

const getInitialStats = () => {
  const stored = loadLevelStats();
  const baseStats = {
    ...defaultState.stats,
    bestTimesByLevel: stored?.bestTimesByLevel || {},
  };
  if (!stored) {
    return baseStats;
  }
  const normalizedKanaStreak =
    stored.kanaStreak ?? stored.currentStreak ?? baseStats.kanaStreak;
  const normalizedBestKanaStreak =
    stored.bestKanaStreak ?? stored.bestStreak ?? baseStats.bestKanaStreak;

  return {
    ...baseStats,
    ...stored,
    kanaStreak: normalizedKanaStreak,
    bestKanaStreak: normalizedBestKanaStreak,
  };
};

const getRowIndexFromId = (identifier) => {
  if (!identifier) return null;
  const numericPortion = parseInt(identifier, 10);
  if (Number.isNaN(numericPortion)) return null;
  return Math.floor(numericPortion / 5);
};

const isWithinRowLevel = (item, rowLevel) => {
  if (!rowLevel || rowLevel < 1) return false;
  const sourceId = item.parentId || item.id;
  const rowIndex = getRowIndexFromId(sourceId);
  if (rowIndex === null) return false;
  return rowIndex < rowLevel;
};

const handleCharRenderToggles = (item, filters, rowLevel) => {
  const effectiveRowLevel = rowLevel || defaultState.options.rowLevel;
  let baseEnabled = false;
  if (item.type === "hiragana") baseEnabled = filters.characterTypes.hiragana;
  else if (item.type === "katakana") baseEnabled = filters.characterTypes.katakana;
  else if (item.type === "romaji") baseEnabled = filters.characterTypes.romaji;

  if (!baseEnabled) return false;
  if (!isWithinRowLevel(item, effectiveRowLevel)) return false;

  if (item.modifierGroup === "dakuten") {
    return baseEnabled && filters.modifierGroup.dakuten;
  } else if (item.modifierGroup === "handakuten") {
    return baseEnabled && filters.modifierGroup.handakuten;
  } else {
    return baseEnabled;
  }
};

// Initialize characters from defaults and stored stats.
const cloneTopCharacters = () =>
  japanese_characters_standard_top.map(tile => ({
    ...tile,
    completed: false,
    scripts: tile.scripts
      ? Object.fromEntries(
          Object.entries(tile.scripts).map(([key, script]) => [
            key,
            {
              ...script,
              filled: false,
            },
          ])
        )
      : tile.scripts,
  }));

const getInitialCharacters = (
  filters = defaultState.filters,
  options = defaultState.options,
  storedTileStats = {}
) => {
  const stats = storedTileStats || {};
  const defaultBot = japanese_characters_standard_bot.map(tile => ({
    ...tile,
    missed: stats[tile.id]?.misses ?? tile.missed,
    accuracy: stats[tile.id]?.accuracy ?? 1,
    averageTimeSeconds: stats[tile.id]?.averageTimeSeconds ?? null,
    memoryScore: stats[tile.id]?.memoryScore ?? 1,
    filled: false,
    render: false,
  }));
  const masterTopCharacters = cloneTopCharacters();
  return {
    masterTopCharacters,
    masterBotCharacters: defaultBot,
    topCharacters: cloneTopCharacters(),
    botCharacters: defaultBot.filter(item => handleCharRenderToggles(item, filters, options?.rowLevel)),
  };
};


/* =============================
   CONTEXT & PROVIDER
   ============================= */

const GameStateContext = createContext();

export const GameStateProvider = ({ children }) => {
  const storedSettings = loadSettingsFromStorage();
  const initialFilters = mergeDeep(defaultState.filters, storedSettings?.filters);
  const initialOptions = mergeDeep(defaultState.options, storedSettings?.options);

  const initialTileStats = useMemo(() => loadTilePerformance(), []);
  const [filters, setFilters] = useState(initialFilters);
  const [options, setOptions] = useState(initialOptions);
  const [tileStats, setTileStats] = useState(initialTileStats);
  const [characters, setCharacters] = useState(() =>
    getInitialCharacters(initialFilters, initialOptions, initialTileStats)
  );
  const [game, setGame] = useState(defaultState.game);
  const [stats, setStats] = useState(getInitialStats);
  const [selectedTile, setSelectedTile] = useState(defaultState.selectedTile);
  const [screenSize, setScreenSize] = useState('desktop');
  const [startMenuOpen, setStartMenuOpen] = useState(true);
  const [inputFocusKey, setInputFocusKey] = useState(0);
  const [activeAttempt, setActiveAttempt] = useState({
    tileId: null,
    startedAt: null,
    misses: 0,
  });
  const previousGameover = useRef(false);

  const registerDailyCompletion = useCallback(() => {
    setStats(prevStats => {
      const todayKey = getDateKey();
      const attemptsByDay = {
        ...(prevStats.dailyAttempts || {}),
      };
      attemptsByDay[todayKey] = (attemptsByDay[todayKey] || 0) + 1;

      let nextDailyStreak = prevStats.dailyStreak || 0;
      if (prevStats.lastActiveDate === todayKey) {
        nextDailyStreak = nextDailyStreak || 1;
      } else if (isPreviousCalendarDay(prevStats.lastActiveDate, todayKey)) {
        nextDailyStreak += 1;
      } else {
        nextDailyStreak = 1;
      }

      return {
        ...prevStats,
        dailyAttempts: attemptsByDay,
        lastActiveDate: todayKey,
        dailyStreak: nextDailyStreak,
      };
    });
  }, []);

  // Update screen size based on breakpoints.
  const updateScreenSize = useCallback(() => {
    const width = window.innerWidth;
    if (width <= breakpoints.mobile) setScreenSize('mobile');
    else if (width <= breakpoints.tablet) setScreenSize('tablet');
    else if (width <= breakpoints.laptop) setScreenSize('laptop');
    else setScreenSize('desktop');
  }, []);

  useEffect(() => {
    updateScreenSize();
    window.addEventListener('resize', updateScreenSize);
    return () => window.removeEventListener('resize', updateScreenSize);
  }, [updateScreenSize]);

  useEffect(() => {
    persistSettingsToStorage(filters, options);
  }, [filters, options]);

  useEffect(() => {
    persistLevelStats(stats);
  }, [stats]);

  useEffect(() => {
    persistTilePerformance(tileStats);
  }, [tileStats]);

  useEffect(() => {
    if (!previousGameover.current && game.gameover) {
      registerDailyCompletion();
    }
    previousGameover.current = game.gameover;
  }, [game.gameover, registerDailyCompletion]);

  // Destructure sorting and game mode options for clarity.
  const { rowShuffle, columnShuffle } = options.sorting;
  const { rowLevel = defaultState.options.rowLevel } = options;
  const { current, methods } = options.gameMode;
  const derivedScriptLevel = getScriptLevelFromFilters(filters.characterTypes);
  const derivedShuffleLevel = getShuffleLevelFromSorting(options.sorting);

  const currentLevel = useMemo(() => {
    const baseLevel = {
      rowLevel,
      scriptLevel: derivedScriptLevel,
      shuffleLevel: clampShuffleLevelForRow(rowLevel, derivedShuffleLevel),
    };
    return {
      ...baseLevel,
      key: buildLevelKey(baseLevel),
    };
  }, [rowLevel, derivedScriptLevel, derivedShuffleLevel]);

  useEffect(() => {
    setOptions(prevOptions => {
      const clampedShuffleLevel = clampShuffleLevelForRow(rowLevel, prevOptions.sorting.shuffleLevel);
      const shouldDisableColumns = rowLevel <= 1;
      const needsUpdate =
        prevOptions.sorting.shuffleLevel !== clampedShuffleLevel ||
        (shouldDisableColumns && prevOptions.sorting.columnShuffle);

      if (!needsUpdate) {
        return prevOptions;
      }

      const shuffleNode = getShuffleNodeByValue(clampedShuffleLevel);
      return {
        ...prevOptions,
        sorting: {
          ...prevOptions.sorting,
          rowShuffle: shuffleNode.rowShuffle,
          columnShuffle: shouldDisableColumns ? false : shuffleNode.columnShuffle,
          shuffleLevel: shuffleNode.value,
        },
      };
    });
  }, [rowLevel, setOptions]);

  // Re-sort botCharacters when filters, shuffling, or game mode change.
  useEffect(() => {
    setCharacters(prevChars => {
      const filteredBot = prevChars.masterBotCharacters.filter(item =>
        handleCharRenderToggles(item, filters, rowLevel)
      );
      const effectiveColumnShuffle = rowLevel > 1 ? columnShuffle : false;
      let updatedBotCharacters;
      switch (methods[current]) {
        case 'sound':
          updatedBotCharacters = getSoundSorted(filteredBot, rowShuffle, effectiveColumnShuffle);
          break;
        case 'h-shape':
          updatedBotCharacters = shuffleByShapeGroup(filteredBot, 'hiragana', rowShuffle, effectiveColumnShuffle);
          break;
        case 'k-shape':
          updatedBotCharacters = shuffleByShapeGroup(filteredBot, 'katakana', rowShuffle, effectiveColumnShuffle);
          break;
        case 'missed':
          updatedBotCharacters = filteredBot.filter(tile => !tile.placeholder)
            .sort((a, b) => b.missed - a.missed);
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
  }, [filters, rowShuffle, columnShuffle, current, methods, rowLevel]);

  useEffect(() => {
    const nextPlayableTile = (characters.botCharacters || []).find(tile => !tile.placeholder);
    const nextTileId = nextPlayableTile?.id ?? null;
    setActiveAttempt(prev => {
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
  }, [characters.botCharacters]);

  // Reset game and characters to initial state.
  const reset = (overrideFilters, overrideOptions) => {
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
  };

  const saveCharactersToLocalStorage = (state) => {
    localStorage.setItem('characters', JSON.stringify(state));
  };

  const applyLevelConfiguration = (targetLevel = DEFAULT_LEVEL) => {
    const scriptKey = levelToScriptKey(targetLevel.scriptLevel);
    const updatedFilters = {
      ...filters,
      characterTypes: {
        ...filters.characterTypes,
        hiragana: scriptKey === 'hiragana' || scriptKey === 'both',
        katakana: scriptKey === 'katakana' || scriptKey === 'both',
      },
    };

    const effectiveShuffleLevel = clampShuffleLevelForRow(targetLevel.rowLevel, targetLevel.shuffleLevel);
    const shuffleNode = getShuffleNodeByValue(effectiveShuffleLevel);
    const updatedOptions = {
      ...options,
      rowLevel: targetLevel.rowLevel,
      sorting: {
        ...options.sorting,
        rowShuffle: shuffleNode.rowShuffle,
        columnShuffle: targetLevel.rowLevel > 1 ? shuffleNode.columnShuffle : false,
        shuffleLevel: shuffleNode.value,
      },
    };

    setFilters(updatedFilters);
    setOptions(updatedOptions);
    persistStoredLevel({
      ...targetLevel,
      shuffleLevel: effectiveShuffleLevel,
    });
    reset(updatedFilters, updatedOptions);
    setInputFocusKey(prev => prev + 1);
  };

  const goToNextLevel = () => {
    const nextLevel = getNextLevel(currentLevel || DEFAULT_LEVEL);
    applyLevelConfiguration(nextLevel);
  };

const getRemainingPlayableTiles = (tiles = []) =>
  tiles.filter(tile => !tile.placeholder).length;

  const completeTileAtIndex = (tileIndex) => {
    let didComplete = false;

    setCharacters(prevChars => {
      const tempBotChars = [...prevChars.botCharacters];
      const tempTopChars = [...prevChars.topCharacters];
      const currentTile = tempBotChars[tileIndex];

      if (!currentTile) {
        return prevChars;
      }

      const topTile = tempTopChars.find(tile => tile.id === currentTile.parentId);
      if (topTile?.scripts) {
        Object.values(topTile.scripts).forEach(script => {
          if (script.id === currentTile.id) {
            script.filled = true;
          }
        });
      }

      tempBotChars.splice(tileIndex, 1);
      while (tempBotChars[0]?.placeholder) {
        tempBotChars.shift();
      }

      const remainingTiles = getRemainingPlayableTiles(tempBotChars);
      const updatedState = {
        ...prevChars,
        topCharacters: tempTopChars,
        botCharacters: tempBotChars,
      };

      saveCharactersToLocalStorage(updatedState);
      didComplete = true;

      if (remainingTiles === 0) {
        setGame(prevGame => (prevGame.gameover ? prevGame : { ...prevGame, gameover: true }));
      }

      return updatedState;
    });

    return didComplete;
  };

  const handleDrop = (targetId, _targetIndex) => {
    if (selectedTile.index === null || selectedTile.index === undefined) return;
    const draggedTile = characters.botCharacters[selectedTile.index];
    if (!draggedTile || draggedTile.parentId !== targetId) {
      return;
    }
    const completed = completeTileAtIndex(selectedTile.index);
    if (completed) {
      setSelectedTile(defaultState.selectedTile);
    }
  };


  const updateMissedTile = (currentTile, characters) => {
    return {
      ...characters,
      masterBotCharacters: characters.masterBotCharacters.map(tile =>
        tile.id === currentTile.id ? { ...tile, missed: tile.missed + 1 } : tile
      )
    };
  };

  const handleTextSubmit = (submittedChar) => {
    const tempBotChars = [...characters.botCharacters];
    const currentTile = tempBotChars[0];

    if (!game.start) {
      setGame(prevGame => ({ ...prevGame, start: true }));
    }
    if (tempBotChars.length === 0) {
      // console.log("No more tiles to match.");
      return;
    }
    if (!matchInput(currentTile, submittedChar)) {
      const newState = updateMissedTile(currentTile, characters);
      setCharacters(newState);
      saveCharactersToLocalStorage(newState);
      setTileStats(prev => applyMissToTilePerformance(prev, currentTile.id));
      setStats(prevStats => {
        if ((prevStats.kanaStreak || 0) === 0) {
          return prevStats;
        }
        return {
          ...prevStats,
          kanaStreak: 0,
        };
      });
      setActiveAttempt(prev => {
        if (prev.tileId !== currentTile.id) return prev;
        return {
          ...prev,
          misses: prev.misses + 1,
        };
      });
      return -1;
    }
    const missesBeforeSuccess = activeAttempt.tileId === currentTile.id ? activeAttempt.misses : 0;
    const durationSeconds =
      activeAttempt.tileId === currentTile.id && activeAttempt.startedAt
        ? (Date.now() - activeAttempt.startedAt) / 1000
        : null;

    setTileStats(prev =>
      applyAttemptToTilePerformance(prev, currentTile.id, {
        durationSeconds,
        missesBeforeSuccess,
      })
    );

    if (missesBeforeSuccess === 0) {
      setStats(prevStats => {
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
    completeTileAtIndex(0);
  };

  const handleCharacterSelect = (type) => {
    setCharacters(prevChars => ({
      ...prevChars,
      botCharacters: prevChars[`default${type}`] || [],
    }));
  };

  const value = {
    characters,
    setCharacters,
    filters,
    setFilters,
    options,
    setOptions,
    game,
    setGame,
    stats,
    setStats,
    reset,
    currentLevel,
    goToNextLevel,
    applyLevelConfiguration,
    screenSize,
    selectedTile,
    setSelectedTile,
    handleDrop,
    handleTextSubmit,
    startMenuOpen,
    setStartMenuOpen,
    handleCharacterSelect,
    inputFocusKey,
    tileStats,
  };

  return (
    <GameStateContext.Provider value={value}>
      {children}
    </GameStateContext.Provider>
  );
};

export const useGameState = () => {
  const context = useContext(GameStateContext);
  if (context === undefined) {
    throw new Error('useGameState must be used within a GameStateProvider');
  }
  return context;
};

export default GameStateContext;

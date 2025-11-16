import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { defaultState } from "../Misc/Utils";
import {
  DEFAULT_LEVEL,
  PROGRESSION_MODES,
  buildLevelKey,
  clampShuffleLevelForRow,
  getNextLevel,
  getScriptLevelFromFilters,
  getShuffleLevelFromSorting,
  getShuffleNodeByValue,
  levelToScriptKey,
  normalizeLevel,
  persistStoredLevel,
} from "../Misc/levelUtils";
import {
  clampRowRange,
  getRowCountFromRange,
  resolveAccuracyThreshold,
  resolveShapeGroup,
  resolveStudyMode,
} from "./utils/optionsUtils";
import { usePersistentSettings } from "./hooks/usePersistentSettings";
import { useScreenSize } from "./hooks/useScreenSize";
import { useStatsState } from "./hooks/useStatsState";
import { useTilePerformance } from "./hooks/useTilePerformance";
import { useCharactersState } from "./hooks/useCharactersState";

const GameStateContext = createContext();

export const GameStateProvider = ({ children }) => {
  const { filters, setFilters, options, setOptions } = usePersistentSettings();
  const screenSize = useScreenSize();
  const { stats, setStats, registerDailyCompletion } = useStatsState();
  const { tileStats, setTileStats } = useTilePerformance();
  const [game, setGame] = useState(defaultState.game);
  const [startMenuOpen, setStartMenuOpen] = useState(true);
  const [sessionType, setSessionType] = useState("freePlay");
  const previousGameover = useRef(false);

  const {
    characters,
    setCharacters,
    selectedTile,
    setSelectedTile,
    reset,
    handleDrop,
    handleTextSubmit,
    inputFocusKey,
    bumpInputFocusKey,
  } = useCharactersState({
    filters,
    options,
    tileStats,
    setTileStats,
    setStats,
    game,
    setGame,
  });

  const rowRange = useMemo(
    () => clampRowRange(options.rowRange),
    [options.rowRange]
  );
  const rowCount = getRowCountFromRange(rowRange);
  const studyMode = resolveStudyMode(options);
  const shapeGroup = resolveShapeGroup(options);
  const adaptiveThreshold = resolveAccuracyThreshold(options);
  const derivedScriptLevel = getScriptLevelFromFilters(filters.characterTypes);
  const derivedShuffleLevel = getShuffleLevelFromSorting(options.sorting);
  const effectiveShuffleLevel =
    studyMode === PROGRESSION_MODES.ADAPTIVE
      ? 0
      : clampShuffleLevelForRow(rowCount, derivedShuffleLevel);

  const currentLevel = useMemo(() => {
    const baseLevel = {
      mode: studyMode,
      rowStart: rowRange.start,
      rowEnd: rowRange.end,
      scriptLevel: derivedScriptLevel,
      shuffleLevel: effectiveShuffleLevel,
      shapeGroup,
      accuracyThreshold: adaptiveThreshold,
    };
    return {
      ...baseLevel,
      key: buildLevelKey(baseLevel),
    };
  }, [
    adaptiveThreshold,
    derivedScriptLevel,
    effectiveShuffleLevel,
    rowRange.end,
    rowRange.start,
    shapeGroup,
    studyMode,
  ]);

  useEffect(() => {
    setOptions((prevOptions) => {
      const prevRange = clampRowRange(prevOptions.rowRange);
      const prevRowCount = getRowCountFromRange(prevRange);
      const prevMode = resolveStudyMode(prevOptions);
      const forceOrdered = prevMode === PROGRESSION_MODES.ADAPTIVE;
      const clampedShuffleLevel = forceOrdered
        ? 0
        : clampShuffleLevelForRow(
            prevRowCount,
            prevOptions.sorting.shuffleLevel
          );
      const shouldDisableColumns = forceOrdered || prevRowCount <= 1;
      const needsUpdate =
        prevOptions.sorting.shuffleLevel !== clampedShuffleLevel ||
        (shouldDisableColumns && prevOptions.sorting.columnShuffle) ||
        (forceOrdered && prevOptions.sorting.rowShuffle);

      if (!needsUpdate) {
        return prevOptions;
      }

      const shuffleNode = getShuffleNodeByValue(clampedShuffleLevel);
      return {
        ...prevOptions,
        sorting: {
          ...prevOptions.sorting,
          rowShuffle: forceOrdered ? false : shuffleNode.rowShuffle,
          columnShuffle: shouldDisableColumns
            ? false
            : shuffleNode.columnShuffle,
          shuffleLevel: forceOrdered ? 0 : shuffleNode.value,
        },
      };
    });
  }, [options.rowRange, options.studyMode, setOptions]);

  useEffect(() => {
    if (!previousGameover.current && game.gameover) {
      registerDailyCompletion();
    }
    previousGameover.current = game.gameover;
  }, [game.gameover, registerDailyCompletion]);

  const applyLevelConfiguration = useCallback(
    (targetLevel = DEFAULT_LEVEL) => {
      const normalizedLevel = normalizeLevel(targetLevel);
      const scriptKey = levelToScriptKey(normalizedLevel.scriptLevel);
      const updatedFilters = {
        ...filters,
        characterTypes: {
          ...filters.characterTypes,
          hiragana: scriptKey === "hiragana" || scriptKey === "both",
          katakana: scriptKey === "katakana" || scriptKey === "both",
        },
      };
      const normalizedRange = clampRowRange({
        start: normalizedLevel.rowStart,
        end: normalizedLevel.rowEnd,
      });
      const rowCountForLevel = getRowCountFromRange(normalizedRange);
      const enforceOrdered = normalizedLevel.mode === PROGRESSION_MODES.ADAPTIVE;
      const effectiveShuffleLevelForLevel = enforceOrdered
        ? 0
        : clampShuffleLevelForRow(
            rowCountForLevel,
            normalizedLevel.shuffleLevel
          );
      const shuffleNode = getShuffleNodeByValue(
        effectiveShuffleLevelForLevel
      );
      const updatedOptions = {
        ...options,
        studyMode: normalizedLevel.mode,
        rowLevel: normalizedRange.end,
        rowRange: normalizedRange,
        shapeGroup: normalizedLevel.shapeGroup,
        accuracyThreshold: normalizedLevel.accuracyThreshold,
        sorting: {
          ...options.sorting,
          rowShuffle: enforceOrdered ? false : shuffleNode.rowShuffle,
          columnShuffle:
            enforceOrdered || rowCountForLevel <= 1
              ? false
              : shuffleNode.columnShuffle,
          shuffleLevel: enforceOrdered ? 0 : shuffleNode.value,
        },
      };

      setFilters(updatedFilters);
      setOptions(updatedOptions);
      persistStoredLevel({
        ...normalizedLevel,
        rowStart: normalizedRange.start,
        rowEnd: normalizedRange.end,
        shuffleLevel: effectiveShuffleLevelForLevel,
      });
      reset(updatedFilters, updatedOptions);
      bumpInputFocusKey();
    },
    [filters, options, reset, setFilters, setOptions, bumpInputFocusKey]
  );

  const goToNextLevel = useCallback(() => {
    const nextLevel = getNextLevel(currentLevel || DEFAULT_LEVEL);
    applyLevelConfiguration(nextLevel);
  }, [applyLevelConfiguration, currentLevel]);

  const handleCharacterSelect = useCallback(
    (type) => {
      setCharacters((prevChars) => ({
        ...prevChars,
        botCharacters: prevChars[`default${type}`] || [],
      }));
    },
    [setCharacters]
  );

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
    sessionType,
    setSessionType,
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
    throw new Error("useGameState must be used within a GameStateProvider");
  }
  return context;
};

export default GameStateContext;

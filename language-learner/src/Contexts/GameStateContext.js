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
  buildLevelKey,
  getNextLevel,
  getScriptLevelFromFilters,
  levelToScriptKey,
  normalizeLevel,
  persistStoredLevel,
} from "../Misc/levelUtils";
import {
  clampRowRange,
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
    registerTileCompletionListener,
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
  const studyMode = resolveStudyMode(options);
  const shapeGroup = resolveShapeGroup(options, filters);
  const adaptiveThreshold = resolveAccuracyThreshold(options);
  const derivedScriptLevel = getScriptLevelFromFilters(filters.characterTypes);
  const currentLevel = useMemo(() => {
    const baseLevel = {
      mode: studyMode,
      rowStart: rowRange.start,
      rowEnd: rowRange.end,
      scriptLevel: derivedScriptLevel,
      shuffleLevel: 0,
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
    rowRange.end,
    rowRange.start,
    shapeGroup,
    studyMode,
  ]);

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
      const updatedOptions = {
        ...options,
        studyMode: normalizedLevel.mode,
        rowLevel: normalizedRange.end,
        rowRange: normalizedRange,
        shapeGroup: normalizedLevel.shapeGroup,
        accuracyThreshold: normalizedLevel.accuracyThreshold,
      };

      setFilters(updatedFilters);
      setOptions(updatedOptions);
      persistStoredLevel({
        ...normalizedLevel,
        rowStart: normalizedRange.start,
        rowEnd: normalizedRange.end,
        shuffleLevel: 0,
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
    bumpInputFocusKey,
    tileStats,
    sessionType,
    setSessionType,
    registerTileCompletionListener,
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

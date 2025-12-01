import { createContext, useContext, useMemo, useCallback } from "react";
import { useCharactersState } from "./hooks/useCharactersState";
import { useSettings } from "./SettingsContext";
import { useStatsContext } from "./StatsContext";
import { useGame } from "./GameContext";
import {
  DEFAULT_LEVEL,
  clampRowRange,
  levelToScriptKey,
  normalizeLevel,
} from "../core/levelUtils";

const CharactersContext = createContext();

export const CharactersProvider = ({ children }) => {
  const { filters, setFilters, options, setOptions } = useSettings();
  const { stats, setStats, tileStats, setTileStats } = useStatsContext();
  const { game, setGame } = useGame();

  const characterState = useCharactersState({
    filters,
    options,
    tileStats,
    setTileStats,
    setStats,
    game,
    setGame,
  });

  const { reset, bumpInputFocusKey, setCharacters } = characterState;

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
      reset(updatedFilters, updatedOptions);
      bumpInputFocusKey();
    },
    [filters, options, reset, setFilters, setOptions, bumpInputFocusKey]
  );

  const handleCharacterSelect = useCallback(
    (type) => {
      setCharacters((prevChars) => ({
        ...prevChars,
        botCharacters: prevChars[`default${type}`] || [],
      }));
    },
    [setCharacters]
  );

  const value = useMemo(
    () => ({
      ...characterState,
      applyLevelConfiguration,
      handleCharacterSelect,
    }),
    [characterState, applyLevelConfiguration, handleCharacterSelect]
  );

  return (
    <CharactersContext.Provider value={value}>
      {children}
    </CharactersContext.Provider>
  );
};

export const useCharacters = () => {
  const context = useContext(CharactersContext);
  if (!context) {
    throw new Error("useCharacters must be used within a CharactersProvider");
  }
  return context;
};

import { createContext, useContext, useMemo } from "react";
import { usePersistentSettings } from "./hooks/usePersistentSettings";
import { useScreenSize } from "./hooks/useScreenSize";
import {
  DEFAULT_LEVEL,
  buildLevelKey,
  getScriptLevelFromFilters,
  normalizeLevel,
} from "../core/levelUtils";
import {
  clampRowRange,
  resolveAccuracyThreshold,
  resolveShapeGroup,
  resolveStudyMode,
} from "./utils/optionsUtils";

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const { filters, setFilters, options, setOptions } = usePersistentSettings();
  const screenSize = useScreenSize();

  const rowRange = useMemo(
    () => clampRowRange(options.rowRange),
    [options.rowRange]
  );
  const studyMode = resolveStudyMode(options);
  const shapeGroup = resolveShapeGroup(options, filters);
  const adaptiveThreshold = resolveAccuracyThreshold(options);
  const derivedScriptLevel = getScriptLevelFromFilters(filters.characterTypes);
  const shuffleMode = options.shuffleMode;
  const currentLevel = useMemo(() => {
    const baseLevel = {
      mode: studyMode,
      rowStart: rowRange.start,
      rowEnd: rowRange.end,
      scriptLevel: derivedScriptLevel,
      shapeGroup,
      accuracyThreshold: adaptiveThreshold,
      shuffleMode,
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
    shuffleMode,
  ]);

  const value = useMemo(
    () => ({
      filters,
      setFilters,
      options,
      setOptions,
      screenSize,
      currentLevel,
    }),
    [filters, setFilters, options, setOptions, screenSize, currentLevel]
  );

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};

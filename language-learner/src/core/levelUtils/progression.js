import {
  ACCURACY_THRESHOLDS,
  DEFAULT_LEVEL,
  LEVEL_TO_SCRIPT,
  PROGRESSION_MODES,
  SCRIPT_SEQUENCE,
  TOTAL_ROWS,
  WINDOW_SIZES,
  clampRowRange,
  clampShapeGroup,
  getDefaultShapeGroup,
  getShapeGroupListForScriptKey,
  normalizeLevelShape,
} from "./core";

const getInitialLevelForMode = (mode, scriptLevelOverride = SCRIPT_SEQUENCE[0]) => {
  switch (mode) {
    case PROGRESSION_MODES.RANGE:
      return {
        ...DEFAULT_LEVEL,
        mode,
        rowStart: 1,
        rowEnd: Math.min(WINDOW_SIZES[0] || 2, TOTAL_ROWS),
        scriptLevel: scriptLevelOverride,
      };
    case PROGRESSION_MODES.SHAPES:
      return {
        ...DEFAULT_LEVEL,
        mode,
        rowStart: 1,
        rowEnd: TOTAL_ROWS,
        scriptLevel: scriptLevelOverride,
        shapeGroup: getDefaultShapeGroup(LEVEL_TO_SCRIPT[scriptLevelOverride] || "hiragana"),
      };
    case PROGRESSION_MODES.ADAPTIVE:
      return {
        ...DEFAULT_LEVEL,
        mode,
        rowStart: 1,
        rowEnd: TOTAL_ROWS,
        scriptLevel: scriptLevelOverride,
        accuracyThreshold: ACCURACY_THRESHOLDS[0],
      };
    case PROGRESSION_MODES.LINEAR:
    default:
      return {
        ...DEFAULT_LEVEL,
        mode: PROGRESSION_MODES.LINEAR,
        rowStart: 1,
        rowEnd: 1,
        scriptLevel: scriptLevelOverride,
      };
  }
};

const advanceLinear = (level) => {
  if (level.rowEnd < TOTAL_ROWS) {
    const nextRow = clampRowRange(level.rowStart + 1, level.rowEnd + 1);
    return {
      ...level,
      rowStart: nextRow.start,
      rowEnd: nextRow.end,
    };
  }

  return getInitialLevelForMode(PROGRESSION_MODES.RANGE, level.scriptLevel);
};

const advanceRange = (level) => {
  const rowCount = Math.max(1, level.rowEnd - level.rowStart + 1);
  const windowSize = WINDOW_SIZES.find((size) => size === rowCount) || WINDOW_SIZES[0] || 2;

  const maxStart = TOTAL_ROWS - rowCount + 1;
  if (level.rowStart < maxStart) {
    const nextStart = level.rowStart + 1;
    const nextEnd = nextStart + rowCount - 1;
    return {
      ...level,
      rowStart: nextStart,
      rowEnd: nextEnd,
    };
  }

  const currentWindowIndex = Math.max(0, WINDOW_SIZES.indexOf(windowSize));
  if (currentWindowIndex < WINDOW_SIZES.length - 1) {
    const nextSize = WINDOW_SIZES[currentWindowIndex + 1];
    const nextEnd = Math.min(TOTAL_ROWS, nextSize);
    return {
      ...level,
      rowStart: 1,
      rowEnd: nextEnd,
    };
  }

  return getInitialLevelForMode(PROGRESSION_MODES.SHAPES, level.scriptLevel);
};

const advanceShapes = (level) => {
  const scriptKey = LEVEL_TO_SCRIPT[level.scriptLevel] || "hiragana";
  const availableGroups = getShapeGroupListForScriptKey(scriptKey);
  const safeGroup = clampShapeGroup(level.shapeGroup, scriptKey);

  const currentIndex = Math.max(0, availableGroups.indexOf(safeGroup));
  if (currentIndex < availableGroups.length - 1) {
    const nextGroup = availableGroups[currentIndex + 1];
    return {
      ...level,
      shapeGroup: nextGroup,
    };
  }

  return getInitialLevelForMode(PROGRESSION_MODES.ADAPTIVE, level.scriptLevel);
};

const advanceAdaptive = (level) => {
  const scriptIndex = Math.max(0, SCRIPT_SEQUENCE.indexOf(level.scriptLevel));
  const thresholdIndex = Math.max(0, ACCURACY_THRESHOLDS.indexOf(level.accuracyThreshold));

  if (thresholdIndex < ACCURACY_THRESHOLDS.length - 1) {
    return {
      ...level,
      accuracyThreshold: ACCURACY_THRESHOLDS[thresholdIndex + 1],
    };
  }

  return getInitialLevelForMode(PROGRESSION_MODES.LINEAR, SCRIPT_SEQUENCE[scriptIndex]);
};

export const getNextLevel = (level = DEFAULT_LEVEL) => {
  const normalized = normalizeLevelShape(level);

  switch (normalized.mode) {
    case PROGRESSION_MODES.LINEAR:
      return normalizeLevelShape(advanceLinear(normalized));
    case PROGRESSION_MODES.RANGE:
      return normalizeLevelShape(advanceRange(normalized));
    case PROGRESSION_MODES.SHAPES:
      return normalizeLevelShape(advanceShapes(normalized));
    case PROGRESSION_MODES.ADAPTIVE:
      return normalizeLevelShape(advanceAdaptive(normalized));
    default:
      return getInitialLevelForMode(PROGRESSION_MODES.LINEAR);
  }
};

export const getInitialLevelByMode = getInitialLevelForMode;

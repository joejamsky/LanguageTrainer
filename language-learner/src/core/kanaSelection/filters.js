import { defaultState } from "../state";
import { PROGRESSION_MODES, clampRowRange, getShapeGroupOptionsForFilters } from "../levelUtils";
import { ensureCustomSelections } from "../customSelections";
import { getRowNumberFromItem, isWithinRowRange } from "./grid";

const BASE_SCRIPT_ROW_KEYS = ["hiragana", "katakana"];

const clampRowRangeFromOptions = (range = defaultState.options.rowRange) => {
  const start = Number.isFinite(range?.start) ? range.start : 1;
  const end = Number.isFinite(range?.end) ? range.end : start;
  return clampRowRange(start, end);
};

const resolveStudyMode = (options) =>
  options?.studyMode || defaultState.options.studyMode;

const resolveShapeGroup = (options, filters = defaultState.filters) => {
  const characterTypes = filters?.characterTypes || defaultState.filters.characterTypes;
  const availableGroups = getShapeGroupOptionsForFilters(characterTypes);
  const fallback = availableGroups[0] || 1;
  const numeric = Number.isFinite(options?.shapeGroup)
    ? Math.max(1, Math.floor(options.shapeGroup))
    : fallback;
  return availableGroups.includes(numeric) ? numeric : fallback;
};

const resolveAccuracyThreshold = (options) => {
  const threshold = Number.isFinite(options?.accuracyThreshold)
    ? options.accuracyThreshold
    : defaultState.options.accuracyThreshold;
  return Math.min(Math.max(threshold, 0), 1);
};

const getSelectionKeyForItem = (item) => {
  if (item.modifierGroup === "dakuten") {
    if (item.type === "hiragana") return "hiragana-dakuten";
    if (item.type === "katakana") return "katakana-dakuten";
    return "dakuten";
  }
  if (item.modifierGroup === "handakuten") {
    if (item.type === "hiragana") return "hiragana-handakuten";
    if (item.type === "katakana") return "katakana-handakuten";
    return "handakuten";
  }
  if (item.type === "hiragana") return "hiragana";
  if (item.type === "katakana") return "katakana";
  return null;
};

export const buildTileFilterState = (
  filters = defaultState.filters,
  options = defaultState.options
) => {
  const rowRange = clampRowRangeFromOptions(
    options?.rowRange || defaultState.options.rowRange
  );
  const studyMode = resolveStudyMode(options);
  const shapeGroupIndex = resolveShapeGroup(options, filters) - 1;
  const accuracyThreshold = resolveAccuracyThreshold(options);
  const customSelections = ensureCustomSelections(options?.customSelections);
  const customRows = customSelections.rows || {};
  const hasCustomRowFilters = BASE_SCRIPT_ROW_KEYS.some((key) =>
    Object.values(customRows[key] || {}).some((value) => value === false)
  );
  const characterTypes = filters?.characterTypes || defaultState.filters.characterTypes;
  const modifierGroup = filters?.modifierGroup || defaultState.filters.modifierGroup;

  return {
    characterTypes,
    modifierGroup,
    rowRange,
    studyMode,
    shapeGroupIndex,
    accuracyThreshold,
    customRows,
    hasCustomRowFilters,
  };
};

export const tilePassesFilter = (item, filterState) => {
  if (!filterState) return false;
  const {
    characterTypes,
    modifierGroup,
    rowRange,
    studyMode,
    shapeGroupIndex,
    accuracyThreshold,
    customRows,
    hasCustomRowFilters,
  } = filterState;

  let baseEnabled = false;
  if (item.type === "hiragana") baseEnabled = characterTypes.hiragana;
  else if (item.type === "katakana") baseEnabled = characterTypes.katakana;
  else if (item.type === "romaji") baseEnabled = characterTypes.romaji;

  if (!baseEnabled) return false;

  if (item.modifierGroup === "dakuten" && !modifierGroup.dakuten) {
    return false;
  }
  if (item.modifierGroup === "handakuten" && !modifierGroup.handakuten) {
    return false;
  }

  const selectionKey = getSelectionKeyForItem(item);
  if (selectionKey) {
    const rowNumber = getRowNumberFromItem(item);
    if (rowNumber !== null) {
      const rowsForKey = customRows[selectionKey];
      if (rowsForKey && rowsForKey[rowNumber] === false) {
        return false;
      }
    }
  }

  if (studyMode === PROGRESSION_MODES.SHAPES) {
    if (typeof item.shapeGroup !== "number") return false;
    return item.shapeGroup === shapeGroupIndex;
  }

  if (studyMode === PROGRESSION_MODES.ADAPTIVE) {
    if (accuracyThreshold === 0) {
      return true;
    }
    const effectiveAccuracy = Number.isFinite(item.accuracy) ? item.accuracy : 1;
    return effectiveAccuracy <= accuracyThreshold;
  }

  if (!hasCustomRowFilters && !isWithinRowRange(item, rowRange)) return false;

  return true;
};


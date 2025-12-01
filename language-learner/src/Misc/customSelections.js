import {
  KANA_SECTION_KEYS,
  STROKE_SECTION_KEYS,
  getRowsForKana,
  getStrokeGroupsForKana,
} from "../data/kanaGroups";
import { DEFAULT_LEVEL } from "./levelUtils";

export const PATH_MODIFIER_OPTIONS = [
  { key: "hiragana", label: "Hiragana", type: "character" },
  { key: "katakana", label: "Katakana", type: "character" },
  { key: "dakuten", label: "Dakuten", type: "modifier" },
  { key: "handakuten", label: "Handakuten", type: "modifier" },
];

const buildRowsForKey = (key) => {
  const rows = getRowsForKana(key);
  const defaultValue = key.includes("-") ? false : true;
  return rows.reduce((acc, row) => {
    acc[row.value] = defaultValue;
    return acc;
  }, {});
};

const buildRowState = () =>
  KANA_SECTION_KEYS.reduce((acc, key) => {
    acc[key] = buildRowsForKey(key);
    return acc;
  }, {});

const DEFAULT_ACCURACY_PERCENT = Math.round(
  DEFAULT_LEVEL.accuracyThreshold * 100
);

const buildShapeState = () =>
  STROKE_SECTION_KEYS.reduce((acc, key) => {
    const groups = getStrokeGroupsForKana(key);
    acc[key] = groups.reduce((shapeAcc, value) => {
      shapeAcc[value] = true;
      return shapeAcc;
    }, {});
    return acc;
  }, {});

const buildAccuracyState = () =>
  KANA_SECTION_KEYS.reduce((acc, key) => {
    acc[key] = DEFAULT_ACCURACY_PERCENT;
    return acc;
  }, {});

export const getDefaultCustomSelections = () => ({
  rows: {
    ...buildRowState(),
  },
  shapes: buildShapeState(),
  accuracyTargets: buildAccuracyState(),
});

export const clampAccuracyTarget = (value = DEFAULT_ACCURACY_PERCENT) =>
  Math.min(Math.max(Math.round(value), 0), 100);

export const ensureCustomSelections = (selections = {}) => {
  const defaults = getDefaultCustomSelections();
  const rows = {};
  KANA_SECTION_KEYS.forEach((key) => {
    rows[key] = {
      ...defaults.rows[key],
      ...(selections.rows?.[key] || {}),
    };
  });
  const shapes = {};
  STROKE_SECTION_KEYS.forEach((key) => {
    shapes[key] = {
      ...defaults.shapes[key],
      ...(selections.shapes?.[key] || {}),
    };
  });
  const fallbackAccuracy =
    typeof selections.frequencyTarget === "number"
      ? clampAccuracyTarget(100 - selections.frequencyTarget)
      : null;
  const accuracyTargets = {};
  KANA_SECTION_KEYS.forEach((key) => {
    const savedValue = selections.accuracyTargets?.[key];
    const baseValue =
      typeof savedValue === "number"
        ? clampAccuracyTarget(savedValue)
        : fallbackAccuracy ?? defaults.accuracyTargets[key];
    accuracyTargets[key] = baseValue;
  });
  return {
    rows,
    shapes,
    accuracyTargets,
  };
};

export const toggleRowSelection = (rowsState, scriptKey, rowValue) => ({
  ...rowsState,
  [scriptKey]: {
    ...(rowsState[scriptKey] || {}),
    [rowValue]: !rowsState[scriptKey]?.[rowValue],
  },
});

export const toggleAllRowsSelection = (rowsState, scriptKey, enabled) => {
  const nextState = {};
  getRowsForKana(scriptKey).forEach((row) => {
    nextState[row.value] = enabled;
  });
  return {
    ...rowsState,
    [scriptKey]: nextState,
  };
};

export const areAllRowsEnabled = (rowsState, scriptKey) =>
  getRowsForKana(scriptKey).every(
    (row) => rowsState[scriptKey]?.[row.value]
  );

export const toggleShapeSelection = (shapeState, scriptKey, groupValue) => ({
  ...shapeState,
  [scriptKey]: {
    ...(shapeState[scriptKey] || {}),
    [groupValue]: !shapeState[scriptKey]?.[groupValue],
  },
});

export const toggleAllShapesSelection = (shapeState, scriptKey, enabled) => {
  const nextState = {};
  getStrokeGroupsForKana(scriptKey).forEach((group) => {
    nextState[group] = enabled;
  });
  return {
    ...shapeState,
    [scriptKey]: nextState,
  };
};

export const areAllShapesEnabled = (shapeState, scriptKey) =>
  getStrokeGroupsForKana(scriptKey).every(
    (group) => shapeState[scriptKey]?.[group]
  );

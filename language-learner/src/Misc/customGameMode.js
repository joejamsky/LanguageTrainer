import { ROW_TIERS } from "../Data/skillTreeConfig";
import { DEFAULT_LEVEL, getShapeGroupCount } from "./levelUtils";

export const PATH_MODIFIER_OPTIONS = [
  { key: "hiragana", label: "Hiragana", type: "character" },
  { key: "katakana", label: "Katakana", type: "character" },
  { key: "dakuten", label: "Dakuten", type: "modifier" },
  { key: "handakuten", label: "Handakuten", type: "modifier" },
];

const buildRowState = () =>
  ROW_TIERS.reduce(
    (acc, row) => ({
      ...acc,
      [row.value]: true,
    }),
    {}
  );

const DEFAULT_FREQUENCY_TARGET = Math.round(
  (1 - DEFAULT_LEVEL.accuracyThreshold) * 100
);

const buildShapeState = () => {
  const total = getShapeGroupCount();
  const shapeState = {};
  for (let i = 1; i <= total; i += 1) {
    shapeState[i] = true;
  }
  return shapeState;
};

export const getDefaultCustomSelections = () => ({
  rows: {
    hiragana: buildRowState(),
    katakana: buildRowState(),
  },
  shapes: buildShapeState(),
  frequencyTarget: DEFAULT_FREQUENCY_TARGET,
});

export const clampFrequencyTarget = (value = 50) =>
  Math.min(Math.max(Math.round(value), 0), 100);

export const ensureCustomSelections = (selections = {}) => {
  const defaults = getDefaultCustomSelections();
  return {
    rows: {
      hiragana: {
        ...defaults.rows.hiragana,
        ...(selections.rows?.hiragana || {}),
      },
      katakana: {
        ...defaults.rows.katakana,
        ...(selections.rows?.katakana || {}),
      },
    },
    shapes: {
      ...defaults.shapes,
      ...(selections.shapes || {}),
    },
    frequencyTarget:
      typeof selections.frequencyTarget === "number"
        ? clampFrequencyTarget(selections.frequencyTarget)
        : defaults.frequencyTarget,
  };
};

export const toggleRowSelection = (rowsState, scriptKey, rowValue) => ({
  ...rowsState,
  [scriptKey]: {
    ...rowsState[scriptKey],
    [rowValue]: !rowsState[scriptKey][rowValue],
  },
});

export const toggleAllRowsSelection = (rowsState, scriptKey, enabled) => {
  const nextState = {};
  Object.keys(rowsState[scriptKey]).forEach((row) => {
    nextState[row] = enabled;
  });
  return {
    ...rowsState,
    [scriptKey]: nextState,
  };
};

export const areAllRowsEnabled = (rowsState, scriptKey) =>
  Object.values(rowsState[scriptKey]).every(Boolean);

export const toggleShapeSelection = (shapeState, groupValue) => ({
  ...shapeState,
  [groupValue]: !shapeState[groupValue],
});

export const toggleAllShapesSelection = (shapeState, enabled) => {
  const nextState = {};
  Object.keys(shapeState).forEach((group) => {
    nextState[group] = enabled;
  });
  return nextState;
};

export const areAllShapesEnabled = (shapeState) =>
  Object.values(shapeState).every(Boolean);

export const adjustFrequencyTarget = (value, delta = 5) =>
  clampFrequencyTarget(value + delta);

export const CUSTOM_SHUFFLE_OPTIONS = [
  {
    key: "none",
    title: "Unshuffled",
    caption: "Ordered practice",
    rowShuffle: false,
    columnShuffle: false,
    icon: "—",
    value: 0,
  },
  {
    key: "horizontal",
    title: "Shuffle Rows",
    caption: "Randomize row order",
    rowShuffle: true,
    columnShuffle: false,
    icon: "↔",
    value: 1,
  },
  {
    key: "vertical",
    title: "Shuffle Columns",
    caption: "Randomize column order",
    rowShuffle: false,
    columnShuffle: true,
    icon: "↕",
    value: 2,
  },
  {
    key: "both",
    title: "Shuffle Both",
    caption: "Full randomization",
    rowShuffle: true,
    columnShuffle: true,
    icon: "↔ ↕",
    value: 3,
  },
];

export const getShuffleKeyFromSorting = (sorting = {}) => {
  if (sorting.rowShuffle && sorting.columnShuffle) return "both";
  if (sorting.rowShuffle) return "horizontal";
  if (sorting.columnShuffle) return "vertical";
  return "none";
};

export const getSortingForShuffleKey = (key, currentSorting = {}) => {
  const option =
    CUSTOM_SHUFFLE_OPTIONS.find((node) => node.key === key) ||
    CUSTOM_SHUFFLE_OPTIONS[0];
  return {
    ...currentSorting,
    rowShuffle: option.rowShuffle,
    columnShuffle: option.columnShuffle,
    shuffleLevel: option.value,
  };
};

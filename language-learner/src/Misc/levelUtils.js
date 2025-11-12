import {
  ROW_TIERS,
  SHUFFLE_NODES,
  LEVEL_TO_SCRIPT,
  SCRIPT_TO_LEVEL,
} from "../Data/skillTreeConfig";

export const PROGRESSION_MODES = {
  LINEAR: "linear",
  RANGE: "range",
  SHAPES: "shapes",
  ADAPTIVE: "adaptive",
};

const TOTAL_ROWS = ROW_TIERS.length;
const WINDOW_SIZES = [2, 4, 6, 8, 10].filter((size) => size <= TOTAL_ROWS);
const SHAPE_GROUP_COUNT = 10;
const ACCURACY_THRESHOLDS = [0.8, 0.85, 0.9, 0.95];
const SCRIPT_SEQUENCE = Object.keys(LEVEL_TO_SCRIPT)
  .map((key) => Number(key))
  .sort((a, b) => a - b);
const MODE_SEQUENCE = [
  PROGRESSION_MODES.LINEAR,
  PROGRESSION_MODES.RANGE,
  PROGRESSION_MODES.SHAPES,
  PROGRESSION_MODES.ADAPTIVE,
];

const STORAGE_KEYS_TO_CLEAR = [
  "languageTrainerLastLevel",
  "languageTrainerStats",
  "tileStats",
  "languageTrainerSettings",
  "characters",
];

const SCRIPT_LABELS = {
  hiragana: "あ",
  katakana: "ア",
  both: "あ + ア",
};

// const capitalize = (value = "") => value.charAt(0).toUpperCase() + value.slice(1);

export const DEFAULT_LEVEL = {
  mode: PROGRESSION_MODES.LINEAR,
  rowStart: 1,
  rowEnd: 1,
  scriptLevel: 1,
  shuffleLevel: 0,
  shapeGroup: 1,
  accuracyThreshold: ACCURACY_THRESHOLDS[0],
};

export const LAST_LEVEL_STORAGE_KEY = "languageTrainerLastLevel";
const LEVEL_STATS_STORAGE_KEY = "languageTrainerStats";

const isBrowser = typeof window !== "undefined";

const defaultMaxShuffleLevel = SHUFFLE_NODES.length - 1;

const clampRowIndex = (value = 1) => {
  const numeric = Number.isFinite(value) ? value : 1;
  return Math.min(Math.max(1, Math.floor(numeric)), TOTAL_ROWS);
};

const clampRowRange = (start = 1, end = 1) => {
  const safeStart = clampRowIndex(start);
  const safeEnd = clampRowIndex(end);
  if (safeStart > safeEnd) {
    return { start: safeEnd, end: safeStart };
  }
  return { start: safeStart, end: safeEnd };
};

const clampShapeGroup = (group = 1) => {
  const numeric = Number.isFinite(group) ? group : 1;
  return Math.min(Math.max(1, Math.floor(numeric)), SHAPE_GROUP_COUNT);
};

const clampAccuracyThreshold = (value = ACCURACY_THRESHOLDS[0]) => {
  const numeric = Number.isFinite(value) ? value : ACCURACY_THRESHOLDS[0];
  const min = ACCURACY_THRESHOLDS[0];
  const max = ACCURACY_THRESHOLDS[ACCURACY_THRESHOLDS.length - 1];
  return Math.min(Math.max(numeric, min), max);
};

const getShuffleSequenceForRowRange = (rowStart, rowEnd) => {
  const count = Math.max(1, rowEnd - rowStart + 1);
  if (count <= 1) {
    return [0, 1].filter((level) => level <= defaultMaxShuffleLevel);
  }
  return [0, 1, 2].filter((level) => level <= defaultMaxShuffleLevel);
};

const normalizeModeValue = (mode) => {
  if (!mode) return PROGRESSION_MODES.LINEAR;
  const normalized = mode.toLowerCase();
  return MODE_SEQUENCE.includes(normalized) ? normalized : PROGRESSION_MODES.LINEAR;
};

const normalizeLevelShape = (level = DEFAULT_LEVEL) => {
  const normalizedMode = normalizeModeValue(level.mode);
  const { start, end } = clampRowRange(level.rowStart, level.rowEnd);
  const scriptLevel = SCRIPT_SEQUENCE.includes(level.scriptLevel)
    ? level.scriptLevel
    : SCRIPT_SEQUENCE[0];
  const shuffleSeq = getShuffleSequenceForRowRange(start, end);
  const safeShuffle = shuffleSeq.includes(level.shuffleLevel)
    ? level.shuffleLevel
    : shuffleSeq[0];
  return {
    mode: normalizedMode,
    rowStart: start,
    rowEnd: end,
    scriptLevel,
    shuffleLevel: safeShuffle,
    shapeGroup: clampShapeGroup(level.shapeGroup),
    accuracyThreshold: clampAccuracyThreshold(level.accuracyThreshold),
  };
};

const safeParse = (raw, fallback) => {
  try {
    return raw ? JSON.parse(raw) : fallback;
  } catch (error) {
    console.warn("Failed to parse stored level data:", error);
    return fallback;
  }
};

export const getMaxShuffleLevelForRow = (rowCount) => {
  if (!rowCount || rowCount <= 1) {
    return Math.min(1, defaultMaxShuffleLevel);
  }
  return defaultMaxShuffleLevel;
};

export const clampShuffleLevelForRow = (rowCount, shuffleLevel = DEFAULT_LEVEL.shuffleLevel) => {
  const maxLevel = getMaxShuffleLevelForRow(rowCount);
  const normalizedValue = typeof shuffleLevel === "number" ? shuffleLevel : DEFAULT_LEVEL.shuffleLevel;
  return Math.max(0, Math.min(normalizedValue, maxLevel));
};

export const readStoredLevel = () => {
  if (!isBrowser) return DEFAULT_LEVEL;
  const raw = localStorage.getItem(LAST_LEVEL_STORAGE_KEY);
  const parsed = safeParse(raw, DEFAULT_LEVEL);
  return normalizeLevelShape(parsed);
};

export const persistStoredLevel = (level = DEFAULT_LEVEL) => {
  if (!isBrowser) return;
  const normalized = normalizeLevelShape(level);
  try {
    localStorage.setItem(
      LAST_LEVEL_STORAGE_KEY,
      JSON.stringify(normalized)
    );
  } catch (error) {
    console.warn("Failed to persist level selection:", error);
  }
};

export const loadLevelStats = () => {
  if (!isBrowser) return null;
  return safeParse(localStorage.getItem(LEVEL_STATS_STORAGE_KEY), null);
};

export const persistLevelStats = (stats) => {
  if (!isBrowser) return;
  try {
    localStorage.setItem(LEVEL_STATS_STORAGE_KEY, JSON.stringify(stats));
  } catch (error) {
    console.warn("Failed to persist stats:", error);
  }
};

export const clearStoredData = () => {
  if (!isBrowser) return;
  STORAGE_KEYS_TO_CLEAR.forEach((key) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn(`Failed to clear stored data for key "${key}":`, error);
    }
  });
};

export const getScriptLevelFromFilters = (characterTypes = {}) => {
  if (characterTypes.hiragana && characterTypes.katakana) return SCRIPT_TO_LEVEL.both;
  if (characterTypes.katakana) return SCRIPT_TO_LEVEL.katakana;
  return SCRIPT_TO_LEVEL.hiragana;
};

export const getShuffleLevelFromSorting = (sorting = {}) => {
  if (typeof sorting.shuffleLevel === "number") return sorting.shuffleLevel;
  if (sorting.rowShuffle && sorting.columnShuffle) return 2;
  if (sorting.rowShuffle) return 1;
  return 0;
};

export const getShuffleNodeByValue = (value) =>
  SHUFFLE_NODES.find((option) => option.value === value) || SHUFFLE_NODES[0];

export const levelToScriptKey = (scriptLevel) => LEVEL_TO_SCRIPT[scriptLevel] || "hiragana";

export const scriptKeyToLevel = (key) => SCRIPT_TO_LEVEL[key] || SCRIPT_TO_LEVEL.hiragana;

export const buildLevelKey = (level = DEFAULT_LEVEL) => {
  const normalized = normalizeLevelShape(level);
  return [
    normalized.mode,
    normalized.rowStart,
    normalized.rowEnd,
    normalized.scriptLevel,
    normalized.shuffleLevel,
    normalized.shapeGroup,
    normalized.accuracyThreshold,
  ].join("-");
};

const getInitialLevelForMode = (mode) => {
  switch (mode) {
    case PROGRESSION_MODES.RANGE:
      return {
        ...DEFAULT_LEVEL,
        mode,
        rowStart: 1,
        rowEnd: Math.min(WINDOW_SIZES[0] || 2, TOTAL_ROWS),
        scriptLevel: SCRIPT_SEQUENCE[0],
        shuffleLevel: 0,
      };
    case PROGRESSION_MODES.SHAPES:
      return {
        ...DEFAULT_LEVEL,
        mode,
        rowStart: 1,
        rowEnd: TOTAL_ROWS,
        scriptLevel: SCRIPT_SEQUENCE[0],
        shuffleLevel: 0,
        shapeGroup: 1,
      };
    case PROGRESSION_MODES.ADAPTIVE:
      return {
        ...DEFAULT_LEVEL,
        mode,
        rowStart: 1,
        rowEnd: TOTAL_ROWS,
        scriptLevel: SCRIPT_SEQUENCE[0],
        shuffleLevel: 0,
        accuracyThreshold: ACCURACY_THRESHOLDS[0],
      };
    case PROGRESSION_MODES.LINEAR:
    default:
      return { ...DEFAULT_LEVEL };
  }
};

// const getNextMode = (mode) => {
//   const idx = MODE_SEQUENCE.indexOf(mode);
//   if (idx === -1) return PROGRESSION_MODES.LINEAR;
//   return MODE_SEQUENCE[(idx + 1) % MODE_SEQUENCE.length];
// };

const advanceScriptShuffle = (level, { rowStart, rowEnd }) => {
  const scriptIndex = Math.max(0, SCRIPT_SEQUENCE.indexOf(level.scriptLevel));
  const shuffleSequence = getShuffleSequenceForRowRange(rowStart, rowEnd);
  const shuffleIndex = Math.max(0, shuffleSequence.indexOf(level.shuffleLevel));

  if (shuffleIndex < shuffleSequence.length - 1) {
    return {
      ...level,
      shuffleLevel: shuffleSequence[shuffleIndex + 1],
    };
  }

  if (scriptIndex < SCRIPT_SEQUENCE.length - 1) {
    return {
      ...level,
      scriptLevel: SCRIPT_SEQUENCE[scriptIndex + 1],
      shuffleLevel: shuffleSequence[0],
    };
  }

  return null;
};

const advanceLinear = (level) => {
  const baseRange = { rowStart: level.rowStart, rowEnd: level.rowEnd };
  const advanced = advanceScriptShuffle(level, baseRange);
  if (advanced) {
    return advanced;
  }

  if (level.rowEnd < TOTAL_ROWS) {
    const nextRow = clampRowRange(level.rowStart + 1, level.rowEnd + 1);
    const shuffleSequence = getShuffleSequenceForRowRange(nextRow.start, nextRow.end);
    return {
      ...level,
      rowStart: nextRow.start,
      rowEnd: nextRow.end,
      scriptLevel: SCRIPT_SEQUENCE[0],
      shuffleLevel: shuffleSequence[0],
    };
  }

  return getInitialLevelForMode(PROGRESSION_MODES.RANGE);
};

const advanceRange = (level) => {
  const rowCount = Math.max(1, level.rowEnd - level.rowStart + 1);
  const windowSize = WINDOW_SIZES.find((size) => size === rowCount) || WINDOW_SIZES[0] || 2;
  const advanced = advanceScriptShuffle(level, { rowStart: level.rowStart, rowEnd: level.rowEnd });
  if (advanced) {
    return advanced;
  }

  const maxStart = TOTAL_ROWS - rowCount + 1;
  if (level.rowStart < maxStart) {
    const nextStart = level.rowStart + 1;
    const nextEnd = nextStart + rowCount - 1;
    const shuffleSequence = getShuffleSequenceForRowRange(nextStart, nextEnd);
    return {
      ...level,
      rowStart: nextStart,
      rowEnd: nextEnd,
      scriptLevel: SCRIPT_SEQUENCE[0],
      shuffleLevel: shuffleSequence[0],
    };
  }

  const currentWindowIndex = Math.max(0, WINDOW_SIZES.indexOf(windowSize));
  if (currentWindowIndex < WINDOW_SIZES.length - 1) {
    const nextSize = WINDOW_SIZES[currentWindowIndex + 1];
    const nextEnd = Math.min(TOTAL_ROWS, nextSize);
    const shuffleSequence = getShuffleSequenceForRowRange(1, nextEnd);
    return {
      ...level,
      rowStart: 1,
      rowEnd: nextEnd,
      scriptLevel: SCRIPT_SEQUENCE[0],
      shuffleLevel: shuffleSequence[0],
    };
  }

  return getInitialLevelForMode(PROGRESSION_MODES.SHAPES);
};

const advanceShapes = (level) => {
  const advanced = advanceScriptShuffle(level, { rowStart: level.rowStart, rowEnd: level.rowEnd });
  if (advanced) {
    return advanced;
  }

  const safeGroup = clampShapeGroup(level.shapeGroup);
  if (safeGroup < SHAPE_GROUP_COUNT) {
    return {
      ...level,
      shapeGroup: safeGroup + 1,
      scriptLevel: SCRIPT_SEQUENCE[0],
      shuffleLevel: getShuffleSequenceForRowRange(level.rowStart, level.rowEnd)[0],
    };
  }

  return getInitialLevelForMode(PROGRESSION_MODES.ADAPTIVE);
};

const advanceAdaptive = (level) => {
  const scriptIndex = Math.max(0, SCRIPT_SEQUENCE.indexOf(level.scriptLevel));
  const thresholdIndex = Math.max(0, ACCURACY_THRESHOLDS.indexOf(level.accuracyThreshold));

  if (scriptIndex < SCRIPT_SEQUENCE.length - 1) {
    return {
      ...level,
      scriptLevel: SCRIPT_SEQUENCE[scriptIndex + 1],
      shuffleLevel: 0,
    };
  }

  if (thresholdIndex < ACCURACY_THRESHOLDS.length - 1) {
    return {
      ...level,
      scriptLevel: SCRIPT_SEQUENCE[0],
      accuracyThreshold: ACCURACY_THRESHOLDS[thresholdIndex + 1],
      shuffleLevel: 0,
    };
  }

  return getInitialLevelForMode(PROGRESSION_MODES.LINEAR);
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

export const getAccuracyThresholds = () => [...ACCURACY_THRESHOLDS];

export const getWindowSizes = () => [...WINDOW_SIZES];

export const getShapeGroupCount = () => SHAPE_GROUP_COUNT;

export const getModeSequence = () => [...MODE_SEQUENCE];

export const normalizeLevel = normalizeLevelShape;

const formatGroupingLabel = (normalized) => {
  if (normalized.mode === PROGRESSION_MODES.LINEAR) {
    return `${normalized.rowStart}`;
  }
  if (normalized.mode === PROGRESSION_MODES.RANGE) {
    return normalized.rowStart === normalized.rowEnd
      ? `${normalized.rowStart}`
      : `${normalized.rowStart}-${normalized.rowEnd}`;
  }
  if (normalized.mode === PROGRESSION_MODES.SHAPES) {
    return `${normalized.shapeGroup}`;
  }
  if (normalized.mode === PROGRESSION_MODES.ADAPTIVE) {
    return `${Math.round(normalized.accuracyThreshold * 100)}%`;
  }
  return `${normalized.rowStart}-${normalized.rowEnd}`;
};

const getShuffleGlyph = (normalized) => {
  if (normalized.mode === PROGRESSION_MODES.ADAPTIVE) {
    return "—";
  }
  const node = SHUFFLE_NODES.find((option) => option.value === normalized.shuffleLevel);
  if (!node) {
    return "—";
  }
  const glyphs = [];
  if (node.rowShuffle) glyphs.push("↔");
  if (node.columnShuffle) glyphs.push("↕");
  if (!glyphs.length) {
    return "—";
  }
  return glyphs.join(" ");
};

export const describeLevel = (level = DEFAULT_LEVEL) => {
  const normalized = normalizeLevelShape(level);
  const modeLabel = normalized.mode.charAt(0).toUpperCase();
  const scriptKey = LEVEL_TO_SCRIPT[normalized.scriptLevel] || "hiragana";
  const kanaLabel = SCRIPT_LABELS[scriptKey] || scriptKey.charAt(0).toUpperCase();
  const groupingLabel = formatGroupingLabel(normalized);
  const shuffleLabel = getShuffleGlyph(normalized);

  return {
    mode: modeLabel,
    grouping: groupingLabel,
    kana: kanaLabel,
    shuffle: shuffleLabel,
    summary: `${modeLabel} | ${groupingLabel} | ${kanaLabel} | ${shuffleLabel}`,
  };
};

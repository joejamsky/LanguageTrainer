import { ROW_TIERS, LEVEL_TO_SCRIPT, SCRIPT_TO_LEVEL } from "../data/rowConfig";
import BOT_CHARACTERS from "../data/japanese_characters_standard_bot.json";

export const PROGRESSION_MODES = {
  LINEAR: "linear",
  RANGE: "range",
  SHAPES: "shapes",
  ADAPTIVE: "adaptive",
};

const TOTAL_ROWS = ROW_TIERS.length;
const WINDOW_SIZES = [2, 4, 6, 8, 10].filter((size) => size <= TOTAL_ROWS);
const buildShapeGroupMap = () => {
  const map = {
    hiragana: new Set(),
    katakana: new Set(),
  };
  BOT_CHARACTERS.forEach((tile) => {
    if (typeof tile.shapeGroup !== "number") return;
    if (tile.type === "hiragana") {
      map.hiragana.add(tile.shapeGroup + 1);
    } else if (tile.type === "katakana") {
      map.katakana.add(tile.shapeGroup + 1);
    }
  });
  const toSortedArray = (set) => {
    const arr = Array.from(set).sort((a, b) => a - b);
    return arr.length ? arr : [1];
  };
  const hiragana = toSortedArray(map.hiragana);
  const katakana = toSortedArray(map.katakana);
  const combined = toSortedArray(new Set([...map.hiragana, ...map.katakana]));
  return {
    hiragana,
    katakana,
    both: combined,
  };
};
const SHAPE_GROUPS_BY_SCRIPT = buildShapeGroupMap();
const SHAPE_GROUP_COUNT = Math.max(...SHAPE_GROUPS_BY_SCRIPT.both, 1);
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

const LAST_LEVEL_STORAGE_KEY = "languageTrainerLastLevel";
const STORAGE_KEYS_TO_CLEAR = [
  LAST_LEVEL_STORAGE_KEY,
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
  shapeGroup: 1,
  accuracyThreshold: ACCURACY_THRESHOLDS[0],
};

const LEVEL_STATS_STORAGE_KEY = "languageTrainerStats";

const isBrowser = typeof window !== "undefined";


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

const getShapeGroupListForScriptKey = (scriptKey = "hiragana") => {
  if (scriptKey === "katakana") return SHAPE_GROUPS_BY_SCRIPT.katakana;
  if (scriptKey === "both") return SHAPE_GROUPS_BY_SCRIPT.both;
  return SHAPE_GROUPS_BY_SCRIPT.hiragana;
};

const clampShapeGroup = (group = 1, scriptKey = "hiragana") => {
  const available = getShapeGroupListForScriptKey(scriptKey);
  if (!available.length) return 1;
  const numeric = Number.isFinite(group) ? Math.max(1, Math.floor(group)) : available[0];
  return available.includes(numeric) ? numeric : available[0];
};

const getDefaultShapeGroup = (scriptKey = "hiragana") => {
  const available = getShapeGroupListForScriptKey(scriptKey);
  return available[0] || 1;
};

const clampAccuracyThreshold = (value = ACCURACY_THRESHOLDS[0]) => {
  const numeric = Number.isFinite(value) ? value : ACCURACY_THRESHOLDS[0];
  const min = ACCURACY_THRESHOLDS[0];
  const max = ACCURACY_THRESHOLDS[ACCURACY_THRESHOLDS.length - 1];
  return Math.min(Math.max(numeric, min), max);
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
  const scriptKey = LEVEL_TO_SCRIPT[scriptLevel] || "hiragana";
  return {
    mode: normalizedMode,
    rowStart: start,
    rowEnd: end,
    scriptLevel,
    shapeGroup: clampShapeGroup(level.shapeGroup, scriptKey),
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

const SCRIPT_STORAGE_KEYS = ["hiragana", "katakana", "both"];
const buildDefaultLevelForScript = (scriptKey) =>
  normalizeLevelShape({
    ...DEFAULT_LEVEL,
    scriptLevel: SCRIPT_TO_LEVEL[scriptKey] || SCRIPT_SEQUENCE[0],
  });
const DEFAULT_LEVELS_BY_SCRIPT = SCRIPT_STORAGE_KEYS.reduce((acc, scriptKey) => {
  acc[scriptKey] = buildDefaultLevelForScript(scriptKey);
  return acc;
}, {});

const normalizeStoredLevels = (rawValue) => {
  const base = { ...DEFAULT_LEVELS_BY_SCRIPT };
  if (!rawValue || typeof rawValue !== "object") {
    return base;
  }

  const hasScriptEntries = SCRIPT_STORAGE_KEYS.some((key) => typeof rawValue[key] === "object");
  if (hasScriptEntries) {
    SCRIPT_STORAGE_KEYS.forEach((key) => {
      if (rawValue[key]) {
        base[key] = normalizeLevelShape(rawValue[key]);
      }
    });
    return base;
  }

  if (rawValue.mode) {
    const normalized = normalizeLevelShape(rawValue);
    const scriptKey = LEVEL_TO_SCRIPT[normalized.scriptLevel] || "hiragana";
    return {
      ...base,
      [scriptKey]: normalized,
    };
  }

  return base;
};

export const readStoredLevels = () => {
  if (!isBrowser) return { ...DEFAULT_LEVELS_BY_SCRIPT };
  const raw = localStorage.getItem(LAST_LEVEL_STORAGE_KEY);
  const parsed = safeParse(raw, null);
  return normalizeStoredLevels(parsed);
};

export const readStoredLevel = (scriptKey = "hiragana") => {
  const levels = readStoredLevels();
  return levels[scriptKey] || levels.hiragana || DEFAULT_LEVEL;
};


export const persistStoredLevel = (level = DEFAULT_LEVEL) => {
  if (!isBrowser) return;
  const normalized = normalizeLevelShape(level);
  const scriptKey = LEVEL_TO_SCRIPT[normalized.scriptLevel] || "hiragana";
  const current = readStoredLevels();
  const next = {
    ...current,
    [scriptKey]: normalized,
  };
  try {
    localStorage.setItem(LAST_LEVEL_STORAGE_KEY, JSON.stringify(next));
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

export const levelToScriptKey = (scriptLevel) => LEVEL_TO_SCRIPT[scriptLevel] || "hiragana";

export const scriptKeyToLevel = (key) => SCRIPT_TO_LEVEL[key] || SCRIPT_TO_LEVEL.hiragana;

export const buildLevelKey = (level = DEFAULT_LEVEL) => {
  const normalized = normalizeLevelShape(level);
  return [
    normalized.mode,
    normalized.rowStart,
    normalized.rowEnd,
    normalized.scriptLevel,
    normalized.shapeGroup,
    normalized.accuracyThreshold,
  ].join("-");
};

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

// const getNextMode = (mode) => {
//   const idx = MODE_SEQUENCE.indexOf(mode);
//   if (idx === -1) return PROGRESSION_MODES.LINEAR;
//   return MODE_SEQUENCE[(idx + 1) % MODE_SEQUENCE.length];
// };

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

export const getAccuracyThresholds = () => [...ACCURACY_THRESHOLDS];

export const getWindowSizes = () => [...WINDOW_SIZES];

export const getShapeGroupCount = () => SHAPE_GROUP_COUNT;

export const getShapeGroupOptionsForFilters = (characterTypes = {}) => {
  const groups = new Set();
  if (characterTypes.hiragana) {
    getShapeGroupListForScriptKey("hiragana").forEach((value) => groups.add(value));
  }
  if (characterTypes.katakana) {
    getShapeGroupListForScriptKey("katakana").forEach((value) => groups.add(value));
  }
  if (!groups.size) {
    getShapeGroupListForScriptKey("hiragana").forEach((value) => groups.add(value));
  }
  return Array.from(groups).sort((a, b) => a - b);
};

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

export const describeLevel = (level = DEFAULT_LEVEL) => {
  const normalized = normalizeLevelShape(level);
  const modeLabel = normalized.mode.charAt(0).toUpperCase();
  const scriptKey = LEVEL_TO_SCRIPT[normalized.scriptLevel] || "hiragana";
  const kanaLabel = SCRIPT_LABELS[scriptKey] || scriptKey.charAt(0).toUpperCase();
  const groupingLabel = formatGroupingLabel(normalized);
  const shuffleLabel = "No Shuffle";

  return {
    mode: modeLabel,
    grouping: groupingLabel,
    kana: kanaLabel,
    shuffle: shuffleLabel,
    summary: `${modeLabel} | ${groupingLabel} | ${kanaLabel} | ${shuffleLabel}`,
  };
};

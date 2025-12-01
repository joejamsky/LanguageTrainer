import { ROW_TIERS, LEVEL_TO_SCRIPT, SCRIPT_TO_LEVEL } from "../../data/rowConfig";
import BOT_CHARACTERS from "../../data/japanese_characters_standard_bot.json";

export const PROGRESSION_MODES = {
  LINEAR: "linear",
  RANGE: "range",
  SHAPES: "shapes",
  ADAPTIVE: "adaptive",
};

export const TOTAL_ROWS = ROW_TIERS.length;
export const WINDOW_SIZES = [2, 4, 6, 8, 10].filter((size) => size <= TOTAL_ROWS);

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

export const SHAPE_GROUPS_BY_SCRIPT = buildShapeGroupMap();
export const SHAPE_GROUP_COUNT = Math.max(...SHAPE_GROUPS_BY_SCRIPT.both, 1);
export const ACCURACY_THRESHOLDS = [0.8, 0.85, 0.9, 0.95];
export const SCRIPT_SEQUENCE = Object.keys(LEVEL_TO_SCRIPT)
  .map((key) => Number(key))
  .sort((a, b) => a - b);
export const MODE_SEQUENCE = [
  PROGRESSION_MODES.LINEAR,
  PROGRESSION_MODES.RANGE,
  PROGRESSION_MODES.SHAPES,
  PROGRESSION_MODES.ADAPTIVE,
];

export const DEFAULT_LEVEL = {
  mode: PROGRESSION_MODES.LINEAR,
  rowStart: 1,
  rowEnd: 1,
  scriptLevel: 1,
  shapeGroup: 1,
  accuracyThreshold: ACCURACY_THRESHOLDS[0],
};

export const LEVEL_STATS_STORAGE_KEY = "languageTrainerStats";
export const STORAGE_KEYS_TO_CLEAR = [
  "languageTrainerLastLevel",
  LEVEL_STATS_STORAGE_KEY,
  "tileStats",
  "languageTrainerSettings",
  "characters",
];

export const SCRIPT_LABELS = {
  hiragana: "あ",
  katakana: "ア",
  both: "あ + ア",
};

export const isBrowser = typeof window !== "undefined";

export const clampRowIndex = (value = 1) => {
  const numeric = Number.isFinite(value) ? value : 1;
  return Math.min(Math.max(1, Math.floor(numeric)), TOTAL_ROWS);
};

export const clampRowRange = (start = 1, end = 1) => {
  const safeStart = clampRowIndex(start);
  const safeEnd = clampRowIndex(end);
  if (safeStart > safeEnd) {
    return { start: safeEnd, end: safeStart };
  }
  return { start: safeStart, end: safeEnd };
};

export const getShapeGroupListForScriptKey = (scriptKey = "hiragana") => {
  if (scriptKey === "katakana") return SHAPE_GROUPS_BY_SCRIPT.katakana;
  if (scriptKey === "both") return SHAPE_GROUPS_BY_SCRIPT.both;
  return SHAPE_GROUPS_BY_SCRIPT.hiragana;
};

export const clampShapeGroup = (group = 1, scriptKey = "hiragana") => {
  const available = getShapeGroupListForScriptKey(scriptKey);
  if (!available.length) return 1;
  const numeric = Number.isFinite(group) ? Math.max(1, Math.floor(group)) : available[0];
  return available.includes(numeric) ? numeric : available[0];
};

export const getDefaultShapeGroup = (scriptKey = "hiragana") => {
  const available = getShapeGroupListForScriptKey(scriptKey);
  return available[0] || 1;
};

export const clampAccuracyThreshold = (value = ACCURACY_THRESHOLDS[0]) => {
  const numeric = Number.isFinite(value) ? value : ACCURACY_THRESHOLDS[0];
  const min = ACCURACY_THRESHOLDS[0];
  const max = ACCURACY_THRESHOLDS[ACCURACY_THRESHOLDS.length - 1];
  return Math.min(Math.max(numeric, min), max);
};

export const normalizeModeValue = (mode) => {
  if (!mode) return PROGRESSION_MODES.LINEAR;
  const normalized = mode.toLowerCase();
  return MODE_SEQUENCE.includes(normalized) ? normalized : PROGRESSION_MODES.LINEAR;
};

export const normalizeLevelShape = (level = DEFAULT_LEVEL) => {
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

export const safeParse = (raw, fallback) => {
  try {
    return raw ? JSON.parse(raw) : fallback;
  } catch (error) {
    console.warn("Failed to parse stored level data:", error);
    return fallback;
  }
};

export const getScriptLevelFromFilters = (characterTypes = {}) => {
  if (characterTypes.hiragana && characterTypes.katakana) return SCRIPT_TO_LEVEL.both;
  if (characterTypes.katakana) return SCRIPT_TO_LEVEL.katakana;
  return SCRIPT_TO_LEVEL.hiragana;
};

export const levelToScriptKey = (scriptLevel) => LEVEL_TO_SCRIPT[scriptLevel] || "hiragana";

export const scriptKeyToLevel = (key) => SCRIPT_TO_LEVEL[key] || SCRIPT_TO_LEVEL.hiragana;

export { LEVEL_TO_SCRIPT, SCRIPT_TO_LEVEL };

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

export const getModeSequence = () => [...MODE_SEQUENCE];

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

export const normalizeLevel = normalizeLevelShape;

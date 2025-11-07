import {
  ROW_TIERS,
  SHUFFLE_NODES,
  LEVEL_TO_SCRIPT,
  SCRIPT_TO_LEVEL,
} from "../Data/skillTreeConfig";

export const DEFAULT_LEVEL = {
  rowLevel: 1,
  scriptLevel: 1,
  shuffleLevel: 0,
};

export const LAST_LEVEL_STORAGE_KEY = "languageTrainerLastLevel";
const LEVEL_STATS_STORAGE_KEY = "languageTrainerStats";

const isBrowser = typeof window !== "undefined";

const defaultMaxShuffleLevel = SHUFFLE_NODES.length - 1;

const safeParse = (raw, fallback) => {
  try {
    return raw ? JSON.parse(raw) : fallback;
  } catch (error) {
    console.warn("Failed to parse stored level data:", error);
    return fallback;
  }
};

export const getMaxShuffleLevelForRow = (rowLevel) => {
  if (!rowLevel || rowLevel <= 1) {
    return Math.min(1, defaultMaxShuffleLevel);
  }
  return defaultMaxShuffleLevel;
};

export const clampShuffleLevelForRow = (rowLevel, shuffleLevel = DEFAULT_LEVEL.shuffleLevel) => {
  const maxLevel = getMaxShuffleLevelForRow(rowLevel);
  const normalizedValue = typeof shuffleLevel === "number" ? shuffleLevel : DEFAULT_LEVEL.shuffleLevel;
  return Math.max(0, Math.min(normalizedValue, maxLevel));
};

export const readStoredLevel = () => {
  if (!isBrowser) return DEFAULT_LEVEL;
  const raw = localStorage.getItem(LAST_LEVEL_STORAGE_KEY);
  const parsed = safeParse(raw, DEFAULT_LEVEL);
  const rowLevel = parsed?.rowLevel ?? DEFAULT_LEVEL.rowLevel;
  const scriptLevel = parsed?.scriptLevel ?? DEFAULT_LEVEL.scriptLevel;
  const shuffleLevel = clampShuffleLevelForRow(rowLevel, parsed?.shuffleLevel ?? DEFAULT_LEVEL.shuffleLevel);
  return {
    rowLevel,
    scriptLevel,
    shuffleLevel,
  };
};

export const persistStoredLevel = (level = DEFAULT_LEVEL) => {
  if (!isBrowser) return;
  const rowLevel = level?.rowLevel ?? DEFAULT_LEVEL.rowLevel;
  const scriptLevel = level?.scriptLevel ?? DEFAULT_LEVEL.scriptLevel;
  const shuffleLevel = clampShuffleLevelForRow(rowLevel, level?.shuffleLevel ?? DEFAULT_LEVEL.shuffleLevel);
  try {
    localStorage.setItem(
      LAST_LEVEL_STORAGE_KEY,
      JSON.stringify({
        rowLevel,
        scriptLevel,
        shuffleLevel,
      })
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

export const buildLevelKey = (level = DEFAULT_LEVEL) =>
  `${level.rowLevel}-${level.scriptLevel}-${level.shuffleLevel}`;

export const getNextLevel = (level = DEFAULT_LEVEL) => {
  const maxRowLevel = ROW_TIERS.length;
  const maxScriptLevel = Object.keys(LEVEL_TO_SCRIPT).length;

  let nextRow = level.rowLevel ?? DEFAULT_LEVEL.rowLevel;
  let nextScript = level.scriptLevel ?? DEFAULT_LEVEL.scriptLevel;
  let nextShuffle = level.shuffleLevel ?? DEFAULT_LEVEL.shuffleLevel;

  const isRowOne = nextRow === 1;
  if (isRowOne) {
    nextShuffle += 1;
    if (nextShuffle > 1) {
      nextShuffle = 0;
      nextScript += 1;
      if (nextScript > maxScriptLevel) {
        nextScript = 1;
        nextRow = Math.min(nextRow + 1, maxRowLevel);
        nextShuffle = clampShuffleLevelForRow(nextRow, nextShuffle);
      }
    }
  } else {
    const maxShuffleForRow = getMaxShuffleLevelForRow(nextRow);
    if (nextShuffle < maxShuffleForRow) {
      nextShuffle += 1;
    } else {
      nextShuffle = 0;
      nextScript += 1;
      if (nextScript > maxScriptLevel) {
        nextScript = 1;
        nextRow += 1;
        if (nextRow > maxRowLevel) {
          nextRow = maxRowLevel;
          nextScript = maxScriptLevel;
          nextShuffle = getMaxShuffleLevelForRow(nextRow);
        }
      }
    }
  }

  return {
    rowLevel: nextRow,
    scriptLevel: nextScript,
    shuffleLevel: nextShuffle,
  };
};

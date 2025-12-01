import TOP_CHARACTERS from "./japanese_characters_standard_top.json";
import BOT_CHARACTERS from "./japanese_characters_standard_bot.json";
import { ROW_TIERS } from "./rowConfig";

const ROW_LOOKUP = ROW_TIERS.reduce((acc, row) => {
  acc[row.value] = row;
  return acc;
}, {});

const parseRowFromId = (tileId) => {
  const numeric = Number.parseInt(tileId, 10);
  if (!Number.isFinite(numeric)) {
    return null;
  }
  return Math.floor(numeric / 5) + 1;
};

const BASE_MODIFIER_KEYS = ["base", "dakuten", "handakuten"];
const SCRIPT_KEYS = ["hiragana", "katakana"];
const STROKE_SECTION_KEYS = [
  ...SCRIPT_KEYS,
  ...SCRIPT_KEYS.flatMap((scriptKey) =>
    ["dakuten", "handakuten"].map((modifier) => `${scriptKey}-${modifier}`)
  ),
];
const rowsByModifier = BASE_MODIFIER_KEYS.reduce((acc, key) => {
  acc[key] = new Set();
  return acc;
}, {});

TOP_CHARACTERS.forEach((tile) => {
  const rowValue = parseRowFromId(tile.id);
  if (!rowValue) return;
  const modifierKey = BASE_MODIFIER_KEYS.includes(tile.modifierGroup)
    ? tile.modifierGroup
    : "base";
  rowsByModifier[modifierKey].add(rowValue);
});

const toRowList = (rowSet) =>
  Array.from(rowSet)
    .sort((a, b) => a - b)
    .map((value) => {
      const row = ROW_LOOKUP[value];
      if (row) return row;
      return {
        id: `row-${value}`,
        title: `Row ${value}`,
        caption: "",
        value,
      };
    });

const baseRows = toRowList(rowsByModifier.base);
const modifierRows = {
  dakuten: toRowList(rowsByModifier.dakuten),
  handakuten: toRowList(rowsByModifier.handakuten),
};

const ROWS_BY_SECTION = {
  hiragana: baseRows,
  katakana: baseRows,
};

Object.entries(modifierRows).forEach(([modifierKey, rows]) => {
  ROWS_BY_SECTION[modifierKey] = rows;
  SCRIPT_KEYS.forEach((scriptKey) => {
    ROWS_BY_SECTION[`${scriptKey}-${modifierKey}`] = rows;
  });
});

export const getRowsForKana = (key) => ROWS_BY_SECTION[key] || [];

export const getRowNumberForTileId = (tileId) => parseRowFromId(tileId);

const buildDisplayRowIndex = () => {
  const indexMap = {
    base: {},
    dakuten: {},
    handakuten: {},
  };
  let nextRowIndex = 1;
  baseRows.forEach((row) => {
    indexMap.base[row.value] = nextRowIndex;
    nextRowIndex += 1;
    ["dakuten", "handakuten"].forEach((modifierKey) => {
      if (rowsByModifier[modifierKey].has(row.value)) {
        indexMap[modifierKey][row.value] = nextRowIndex;
        nextRowIndex += 1;
      }
    });
  });
  return indexMap;
};

const ROW_INDEX_MAP = buildDisplayRowIndex();

export const getModifierRowIndex = (modifierKey = "base", rowValue) => {
  if (typeof rowValue !== "number") {
    return null;
  }
  const baseKey = BASE_MODIFIER_KEYS.includes(modifierKey)
    ? modifierKey
    : modifierKey.split("-")[1];
  const map = ROW_INDEX_MAP[baseKey] || ROW_INDEX_MAP.base;
  return map?.[rowValue] ?? null;
};

const SHAPE_GROUPS_BY_SECTION = {};
const SHAPE_GROUP_SAMPLE_BY_SECTION = {};

STROKE_SECTION_KEYS.forEach((sectionKey) => {
  SHAPE_GROUPS_BY_SECTION[sectionKey] = new Set();
  SHAPE_GROUP_SAMPLE_BY_SECTION[sectionKey] = {};
});

BOT_CHARACTERS.forEach((tile) => {
  if (!["hiragana", "katakana"].includes(tile.type)) return;
  if (typeof tile.shapeGroup !== "number") return;
  const baseKey = tile.type;
  const groupValue = tile.shapeGroup + 1;

  // Always record on the base script
  SHAPE_GROUPS_BY_SECTION[baseKey].add(groupValue);
  if (!SHAPE_GROUP_SAMPLE_BY_SECTION[baseKey][groupValue]) {
    SHAPE_GROUP_SAMPLE_BY_SECTION[baseKey][groupValue] = tile.character;
  }

  // Record on script-modifier combinations when applicable
  if (tile.modifierGroup === "dakuten" || tile.modifierGroup === "handakuten") {
    const modifierKey = `${baseKey}-${tile.modifierGroup}`;
    SHAPE_GROUPS_BY_SECTION[modifierKey].add(groupValue);
    if (!SHAPE_GROUP_SAMPLE_BY_SECTION[modifierKey][groupValue]) {
      SHAPE_GROUP_SAMPLE_BY_SECTION[modifierKey][groupValue] = tile.character;
    }
  }
});

const STROKE_GROUPS_BY_SECTION = {};
STROKE_SECTION_KEYS.forEach((sectionKey) => {
  const values = Array.from(SHAPE_GROUPS_BY_SECTION[sectionKey] || []).sort((a, b) => a - b);
  STROKE_GROUPS_BY_SECTION[sectionKey] = values;
});

export const getStrokeGroupsForKana = (key) => STROKE_GROUPS_BY_SECTION[key] || [];
export const getStrokeGroupSampleForKana = (key, group) =>
  (SHAPE_GROUP_SAMPLE_BY_SECTION[key] && SHAPE_GROUP_SAMPLE_BY_SECTION[key][group]) || null;

export const ROW_SECTION_KEYS = [
  ...SCRIPT_KEYS,
  ...SCRIPT_KEYS.flatMap((scriptKey) => ["dakuten", "handakuten"].map((modifier) => `${scriptKey}-${modifier}`)),
];
export const KANA_SECTION_KEYS = ROW_SECTION_KEYS;
export { STROKE_SECTION_KEYS };

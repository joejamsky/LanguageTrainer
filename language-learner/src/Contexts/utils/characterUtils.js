import { defaultState, dictionaryKanaToRomaji } from "../../misc/utils";
import japaneseCharactersBot from "../../data/japanese_characters_standard_bot.json";
import japaneseCharactersTop from "../../data/japanese_characters_standard_top.json";
import { PROGRESSION_MODES } from "../../misc/levelUtils";
import {
  clampRowRange,
  resolveAccuracyThreshold,
  resolveShapeGroup,
  resolveStudyMode,
} from "./optionsUtils";
import { ensureCustomSelections } from "../../misc/customSelections";

const BASE_SCRIPT_ROW_KEYS = ["hiragana", "katakana"];

export const matchInput = (scriptObj, userInput) => {
  if (scriptObj.type === "romaji") {
    return scriptObj.character.toLowerCase() === userInput.toLowerCase();
  }
  const romaji = dictionaryKanaToRomaji[scriptObj.character] || "";
  return romaji.toLowerCase() === userInput.toLowerCase();
};

const getRowIndexFromId = (identifier) => {
  if (!identifier) return null;
  const numericPortion = parseInt(identifier, 10);
  if (Number.isNaN(numericPortion)) return null;
  return Math.floor(numericPortion / 5);
};

export const isWithinRowRange = (item, rowRange) => {
  if (!rowRange) return false;
  const sourceId = item.parentId || item.id;
  const rowIndex = getRowIndexFromId(sourceId);
  if (rowIndex === null) return false;
  const rowNumber = rowIndex + 1;
  return rowNumber >= rowRange.start && rowNumber <= rowRange.end;
};

export const getGridCoordinatesForTile = (tile) => {
  if (!tile) return null;
  const sourceId = tile.parentId || tile.id;
  const numericPortion = parseInt(sourceId, 10);
  if (Number.isNaN(numericPortion)) return null;
  return {
    column: (numericPortion % 5) + 1,
    row: Math.floor(numericPortion / 5) + 1,
  };
};

const getRowNumberFromItem = (item) => {
  const sourceId = item.parentId || item.id;
  const rowIndex = getRowIndexFromId(sourceId);
  return rowIndex === null ? null : rowIndex + 1;
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
  const rowRange = clampRowRange(options?.rowRange || defaultState.options.rowRange);
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
    const effectiveAccuracy = Number.isFinite(item.accuracy) ? item.accuracy : 1;
    return effectiveAccuracy <= accuracyThreshold;
  }

  if (!hasCustomRowFilters && !isWithinRowRange(item, rowRange)) return false;

  return true;
};

export const cloneTopCharacters = () =>
  japaneseCharactersTop.map((tile) => ({
    ...tile,
    completed: false,
    scripts: tile.scripts
      ? Object.fromEntries(
          Object.entries(tile.scripts).map(([key, script]) => [
            key,
            {
              ...script,
              filled: false,
            },
          ])
        )
      : tile.scripts,
  }));

export const getInitialCharacters = (
  filters = defaultState.filters,
  options = defaultState.options,
  storedTileStats = {}
) => {
  const stats = storedTileStats || {};
  const defaultBot = japaneseCharactersBot.map((tile) => ({
    ...tile,
    missed: stats[tile.id]?.misses ?? tile.missed,
    accuracy: stats[tile.id]?.accuracy ?? 1,
    averageTimeSeconds: stats[tile.id]?.averageTimeSeconds ?? null,
    memoryScore: stats[tile.id]?.memoryScore ?? 1,
    filled: false,
    render: false,
  }));
  const masterTopCharacters = cloneTopCharacters();
  const filterState = buildTileFilterState(filters, options);
  const botCharacters = defaultBot.filter((item) => tilePassesFilter(item, filterState));
  return {
    masterTopCharacters,
    masterBotCharacters: defaultBot,
    topCharacters: cloneTopCharacters(),
    botCharacters,
  };
};

export const getRemainingPlayableTiles = (tiles = []) => tiles.length;

export const updateMissedTile = (currentTile, characters) => ({
  ...characters,
  masterBotCharacters: characters.masterBotCharacters.map((tile) =>
    tile.id === currentTile.id ? { ...tile, missed: tile.missed + 1 } : tile
  ),
});

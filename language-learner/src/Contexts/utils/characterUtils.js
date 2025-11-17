import { defaultState, dictionaryKanaToRomaji } from "../../Misc/Utils";
import japaneseCharactersBot from "../../Data/japanese_characters_standard_bot.json";
import japaneseCharactersTop from "../../Data/japanese_characters_standard_top.json";
import { PROGRESSION_MODES } from "../../Misc/levelUtils";
import {
  clampRowRange,
  resolveAccuracyThreshold,
  resolveShapeGroup,
  resolveStudyMode,
} from "./optionsUtils";

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

export const handleCharRenderToggles = (item, filters, options) => {
  const rowRange = clampRowRange(options?.rowRange || defaultState.options.rowRange);
  const studyMode = resolveStudyMode(options);
  const shapeGroup = resolveShapeGroup(options, filters) - 1;
  const accuracyThreshold = resolveAccuracyThreshold(options);
  let baseEnabled = false;
  if (item.type === "hiragana") baseEnabled = filters.characterTypes.hiragana;
  else if (item.type === "katakana") baseEnabled = filters.characterTypes.katakana;
  else if (item.type === "romaji") baseEnabled = filters.characterTypes.romaji;

  if (!baseEnabled) return false;

  if (item.modifierGroup === "dakuten" && !filters.modifierGroup.dakuten) {
    return false;
  }
  if (item.modifierGroup === "handakuten" && !filters.modifierGroup.handakuten) {
    return false;
  }

  if (studyMode === PROGRESSION_MODES.SHAPES) {
    if (typeof item.shapeGroup !== "number") return false;
    return item.shapeGroup === shapeGroup;
  }

  if (studyMode === PROGRESSION_MODES.ADAPTIVE) {
    const effectiveAccuracy = Number.isFinite(item.accuracy) ? item.accuracy : 1;
    return effectiveAccuracy <= accuracyThreshold;
  }

  if (!isWithinRowRange(item, rowRange)) return false;

  return baseEnabled;
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
  const botCharacters = stripLeadingPlaceholders(
    defaultBot.filter((item) => handleCharRenderToggles(item, filters, options))
  );
  return {
    masterTopCharacters,
    masterBotCharacters: defaultBot,
    topCharacters: cloneTopCharacters(),
    botCharacters,
  };
};

export const getRemainingPlayableTiles = (tiles = []) =>
  tiles.filter((tile) => !tile.placeholder).length;

export const updateMissedTile = (currentTile, characters) => ({
  ...characters,
  masterBotCharacters: characters.masterBotCharacters.map((tile) =>
    tile.id === currentTile.id ? { ...tile, missed: tile.missed + 1 } : tile
  ),
});

export const stripLeadingPlaceholders = (tiles = []) => {
  if (!Array.isArray(tiles) || tiles.length === 0) {
    return [];
  }
  const firstPlayableIndex = tiles.findIndex((tile) => !tile?.placeholder);
  if (firstPlayableIndex <= 0) {
    return firstPlayableIndex === 0 ? tiles : [];
  }
  return tiles.slice(firstPlayableIndex);
};

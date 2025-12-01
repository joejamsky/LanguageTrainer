import { defaultState } from "../../../core/state";
import japaneseCharactersBot from "../../../data/japanese_characters_standard_bot.json";
import japaneseCharactersTop from "../../../data/japanese_characters_standard_top.json";
import { buildTileFilterState, tilePassesFilter } from "./characterFilters";

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

const buildBotCharacters = (storedTileStats = {}) =>
  japaneseCharactersBot.map((tile) => ({
    ...tile,
    missed: storedTileStats[tile.id]?.misses ?? tile.missed,
    accuracy: storedTileStats[tile.id]?.accuracy ?? 1,
    averageTimeSeconds: storedTileStats[tile.id]?.averageTimeSeconds ?? null,
    memoryScore: storedTileStats[tile.id]?.memoryScore ?? 1,
    filled: false,
    render: false,
  }));

export const getInitialCharacters = (
  filters = defaultState.filters,
  options = defaultState.options,
  storedTileStats = {}
) => {
  const masterTopCharacters = cloneTopCharacters();
  const defaultBot = buildBotCharacters(storedTileStats);
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

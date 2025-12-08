import { SHUFFLE_MODES } from "../levelUtils";
import { getGridCoordinatesForTile, getRowNumberFromItem } from "../kanaSelection";

const shuffleArray = (items) => {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = result[i];
    result[i] = result[j];
    result[j] = temp;
  }
  return result;
};

const groupByKey = (items, getKey) => {
  const groups = new Map();
  items.forEach((item) => {
    const key = getKey(item);
    if (key == null) return;
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key).push(item);
  });
  return groups;
};

const shuffleWithinRow = (tiles) => {
  const groups = groupByKey(tiles, (tile) => getRowNumberFromItem(tile));
  const rows = Array.from(groups.keys()).sort((a, b) => a - b);
  const result = [];
  rows.forEach((row) => {
    const rowTiles = groups.get(row) || [];
    result.push(...shuffleArray(rowTiles));
  });
  return result;
};

const shuffleWithinColumn = (tiles) => {
  const groups = groupByKey(tiles, (tile) => {
    const coords = getGridCoordinatesForTile(tile);
    return coords?.column ?? null;
  });
  const columns = Array.from(groups.keys()).sort((a, b) => a - b);
  const result = [];
  columns.forEach((column) => {
    const columnTiles = groups.get(column) || [];
    result.push(...shuffleArray(columnTiles));
  });
  return result;
};

export const applyShuffleToTiles = (tiles = [], shuffleMode = SHUFFLE_MODES.NONE) => {
  if (!Array.isArray(tiles) || tiles.length <= 1) {
    return tiles;
  }

  switch (shuffleMode) {
    case SHUFFLE_MODES.HORIZONTAL:
      return shuffleWithinRow(tiles);
    case SHUFFLE_MODES.VERTICAL:
      return shuffleWithinColumn(tiles);
    case SHUFFLE_MODES.BOTH:
      return shuffleArray(tiles);
    case SHUFFLE_MODES.NONE:
    default:
      return tiles;
  }
};

export const getShuffleDisplay = (shuffleMode = SHUFFLE_MODES.NONE) => {
  switch (shuffleMode) {
    case SHUFFLE_MODES.HORIZONTAL:
      return {
        label: "Row Shuffle",
        icon: "↔",
      };
    case SHUFFLE_MODES.VERTICAL:
      return {
        label: "Column Shuffle",
        icon: "↕",
      };
    case SHUFFLE_MODES.BOTH:
      return {
        label: "Row + Column",
        icon: "↕↔",
      };
    case SHUFFLE_MODES.NONE:
    default:
      return {
        label: "No Shuffle",
        icon: "—",
      };
  }
};


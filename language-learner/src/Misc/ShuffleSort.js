// ShuffleSort.js

// Fisher-Yates shuffle for a one-dimensional array.
const shuffleArray = (arr) => {
  let array = [...arr];
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

// Shuffle each row independently.
const shuffleRows = (grid) => {
  return grid.map((row) => shuffleArray(row));
};

// Sound-based sorting using a grid layout with optional row/column shuffling.
export const getSoundSorted = (tiles, rowShuffle, columnShuffle) => {
  const numCols = 5;
  if (!tiles.length) return [];
  const numRows = Math.max(1, Math.ceil(tiles.length / numCols));
  let grid = [];
  for (let r = 0; r < numRows; r++) {
    const slice = tiles.slice(r * numCols, r * numCols + numCols);
    grid.push(slice);
  }
  if (rowShuffle) grid = shuffleRows(grid);
  if (columnShuffle) {
    for (let col = 0; col < numCols; col++) {
      let colItems = grid.map((row) => row[col]).filter((item) => item !== undefined);
      if (!colItems.length) continue;
      colItems = shuffleArray(colItems);
      let idx = 0;
      for (let row = 0; row < numRows; row++) {
        if (grid[row][col] !== undefined) {
          grid[row][col] = colItems[idx++];
        }
      }
    }
  }
  return grid.flat().filter((item) => item !== undefined);
};

  // For shape-based sorting when no shuffling is required.
const sortByShapeGroup = (tiles, desiredType) => {
  return tiles
    .filter(tile => tile.type === desiredType)
    .sort((a, b) => a.shapeGroup - b.shapeGroup);
};

export const shuffleByShapeGroup = (tiles, desiredType, rowShuffle, columnShuffle) => {
  // If neither shuffle is enabled, return the regular sorted order.
  if (!rowShuffle && !columnShuffle) {
    return sortByShapeGroup(tiles, desiredType);
  }

  // Filter to ensure we only use tiles of the desired type.
  const filtered = tiles.filter(tile => tile.type === desiredType);

  // Group tiles by their shapeGroup.
  const groups = {};
  filtered.forEach(tile => {
    const key = tile.shapeGroup;
    groups[key] = groups[key] ? [...groups[key], tile] : [tile];
  });

  // If rowShuffle is enabled, shuffle the items within each group.
  for (const key in groups) {
    if (rowShuffle) {
      groups[key] = shuffleArray(groups[key]);
    }
  }

  // Get the group keys. If columnShuffle is enabled, randomize the group order.
  const groupKeys = Object.keys(groups);
  const orderedKeys = columnShuffle ? shuffleArray(groupKeys) : groupKeys.sort((a, b) => a - b);

  // Flatten the groups in the determined order.
  let result = [];
  orderedKeys.forEach(key => {
    result = result.concat(groups[key]);
  });
  
  return result;
};

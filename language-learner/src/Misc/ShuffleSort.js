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
  return grid.map(row => shuffleArray(row));
};

// Sound-based sorting using a grid layout with optional row/column shuffling.
export const getSoundSorted = (tiles, rowShuffle, columnShuffle) => {
    const numCols = 5;
    const numRows = Math.floor(tiles.length / numCols);
    let grid = [];
    for (let r = 0; r < numRows; r++) {
      grid.push(tiles.slice(r * numCols, r * numCols + numCols));
    }
    if (rowShuffle) grid = shuffleRows(grid);
    if (columnShuffle) {
      for (let col = 0; col < numCols; col++) {
        let colItems = grid.map(row => row[col]);
        // For specific columns, only shuffle non-placeholders.
        if (col === 1 || col === 3) {
          const nonPlaceholders = colItems.filter(item => !item.placeholder);
          const placeholders = colItems.filter(item => item.placeholder);
          colItems = [...shuffleArray(nonPlaceholders), ...placeholders];
        } else {
          colItems = shuffleArray(colItems);
        }
        for (let row = 0; row < numRows; row++) {
          grid[row][col] = colItems[row];
        }
      }
    }
    return grid.flat();
  };

  // For shape-based sorting when no shuffling is required.
const sortByShapeGroup = (tiles, desiredType) => {
  return tiles
    .filter(tile => tile.type === desiredType && !tile.placeholder)
    .sort((a, b) => a.shapeGroup - b.shapeGroup);
};

export const shuffleByShapeGroup = (tiles, desiredType, rowShuffle, columnShuffle) => {
  // If neither shuffle is enabled, return the regular sorted order.
  if (!rowShuffle && !columnShuffle) {
    return sortByShapeGroup(tiles, desiredType);
  }

  // Filter out placeholders and ensure we only use tiles of the desired type.
  const filtered = tiles.filter(tile => tile.type === desiredType && !tile.placeholder);

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
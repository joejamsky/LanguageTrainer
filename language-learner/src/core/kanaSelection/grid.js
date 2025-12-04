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

export const getRowNumberFromItem = (item) => {
  const sourceId = item?.parentId || item?.id;
  const rowIndex = getRowIndexFromId(sourceId);
  return rowIndex === null ? null : rowIndex + 1;
};


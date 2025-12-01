import { getRowsForKana } from "../../data/kanaGroups";

export const toggleRowSelection = (rowsState, scriptKey, rowValue) => ({
  ...rowsState,
  [scriptKey]: {
    ...(rowsState[scriptKey] || {}),
    [rowValue]: !rowsState[scriptKey]?.[rowValue],
  },
});

export const toggleAllRowsSelection = (rowsState, scriptKey, enabled) => {
  const nextState = {};
  getRowsForKana(scriptKey).forEach((row) => {
    nextState[row.value] = enabled;
  });
  return {
    ...rowsState,
    [scriptKey]: nextState,
  };
};

export const areAllRowsEnabled = (rowsState, scriptKey) =>
  getRowsForKana(scriptKey).every((row) => rowsState[scriptKey]?.[row.value]);

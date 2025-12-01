import { getStrokeGroupsForKana } from "../../data/kanaGroups";

export const toggleShapeSelection = (shapeState, scriptKey, groupValue) => ({
  ...shapeState,
  [scriptKey]: {
    ...(shapeState[scriptKey] || {}),
    [groupValue]: !shapeState[scriptKey]?.[groupValue],
  },
});

export const toggleAllShapesSelection = (shapeState, scriptKey, enabled) => {
  const nextState = {};
  getStrokeGroupsForKana(scriptKey).forEach((group) => {
    nextState[group] = enabled;
  });
  return {
    ...shapeState,
    [scriptKey]: nextState,
  };
};

export const areAllShapesEnabled = (shapeState, scriptKey) =>
  getStrokeGroupsForKana(scriptKey).every((group) => shapeState[scriptKey]?.[group]);

import { defaultState } from "../../core/state";
import { TOTAL_ROWS } from "./constants";
import { getShapeGroupOptionsForFilters, SHUFFLE_MODES } from "../../core/levelUtils";
import { ensureCustomSelections } from "../../core/customSelections";

export const clampRowRange = (range = defaultState.options.rowRange) => {
  const start = Number.isFinite(range?.start) ? range.start : 1;
  const end = Number.isFinite(range?.end) ? range.end : start;
  const safeStart = Math.min(Math.max(1, Math.floor(start)), TOTAL_ROWS);
  const safeEnd = Math.min(Math.max(1, Math.floor(end)), TOTAL_ROWS);
  return safeStart <= safeEnd
    ? { start: safeStart, end: safeEnd }
    : { start: safeEnd, end: safeStart };
};

export const getRowCountFromRange = (range) => {
  if (!range) return 0;
  return Math.max(1, range.end - range.start + 1);
};

export const resolveStudyMode = (options) =>
  options?.studyMode || defaultState.options.studyMode;

export const resolveShapeGroup = (options, filters = defaultState.filters) => {
  const availableGroups = getShapeGroupOptionsForFilters(filters);
  const fallback = availableGroups[0] || 1;
  const numeric = Number.isFinite(options?.shapeGroup)
    ? Math.max(1, Math.floor(options.shapeGroup))
    : fallback;
  return availableGroups.includes(numeric) ? numeric : fallback;
};

export const resolveAccuracyThreshold = (options) => {
  const threshold = Number.isFinite(options?.accuracyThreshold)
    ? options.accuracyThreshold
    : defaultState.options.accuracyThreshold;
  return Math.min(Math.max(threshold, 0), 1);
};

export const resolveShuffleMode = (options) => {
  const candidate = options?.shuffleMode;
  const allowed = Object.values(SHUFFLE_MODES);
  if (allowed.includes(candidate)) return candidate;
  return defaultState.options.shuffleMode || SHUFFLE_MODES.NONE;
};

export const normalizeOptionsState = (options = defaultState.options) => {
  const normalizedRange =
    options.rowRange &&
    Number.isFinite(options.rowRange.start) &&
    Number.isFinite(options.rowRange.end)
      ? clampRowRange(options.rowRange)
      : clampRowRange({
          start: 1,
          end: options.rowLevel || 1,
        });
  return {
    ...options,
    rowRange: normalizedRange,
    rowLevel: normalizedRange.end,
    shapeGroup: resolveShapeGroup(options),
    accuracyThreshold: resolveAccuracyThreshold(options),
    studyMode: resolveStudyMode(options),
    shuffleMode: resolveShuffleMode(options),
    customSelections: ensureCustomSelections(options.customSelections),
  };
};

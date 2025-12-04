import {
  PROGRESSION_MODES,
  SCRIPT_LABELS,
  LEVEL_TO_SCRIPT,
  SHUFFLE_MODES,
  normalizeLevelShape,
} from "./core";

const formatGroupingLabel = (normalized) => {
  if (normalized.mode === PROGRESSION_MODES.LINEAR) {
    return `${normalized.rowStart}`;
  }
  if (normalized.mode === PROGRESSION_MODES.RANGE) {
    return normalized.rowStart === normalized.rowEnd
      ? `${normalized.rowStart}`
      : `${normalized.rowStart}-${normalized.rowEnd}`;
  }
  if (normalized.mode === PROGRESSION_MODES.SHAPES) {
    return `${normalized.shapeGroup}`;
  }
  if (normalized.mode === PROGRESSION_MODES.ADAPTIVE) {
    return `${Math.round(normalized.accuracyThreshold * 100)}%`;
  }
  return `${normalized.rowStart}-${normalized.rowEnd}`;
};

const formatShuffleLabel = (normalized) => {
  switch (normalized.shuffleMode) {
    case SHUFFLE_MODES.HORIZONTAL:
      return "Row Shuffle";
    case SHUFFLE_MODES.VERTICAL:
      return "Column Shuffle";
    case SHUFFLE_MODES.BOTH:
      return "Row + Column";
    case SHUFFLE_MODES.NONE:
    default:
      return "No Shuffle";
  }
};

export const describeLevel = (level) => {
  const normalized = normalizeLevelShape(level);
  const modeLabel = normalized.mode.charAt(0).toUpperCase();
  const scriptKey = LEVEL_TO_SCRIPT[normalized.scriptLevel] || "hiragana";
  const kanaLabel = SCRIPT_LABELS[scriptKey] || scriptKey.charAt(0).toUpperCase();
  const groupingLabel = formatGroupingLabel(normalized);
  const shuffleLabel = formatShuffleLabel(normalized);

  return {
    mode: modeLabel,
    grouping: groupingLabel,
    kana: kanaLabel,
    shuffle: shuffleLabel,
    summary: `${modeLabel} | ${groupingLabel} | ${kanaLabel} | ${shuffleLabel}`,
  };
};

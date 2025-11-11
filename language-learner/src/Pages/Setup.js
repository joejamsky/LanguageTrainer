import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "../Styles/Setup.scss";
import { useGameState } from "../Contexts/GameStateContext";
import {
  ROW_TIERS,
  ROW_MODIFIERS,
  SCRIPT_NODES,
  SHUFFLE_NODES,
  LEVEL_TO_SCRIPT,
} from "../Data/skillTreeConfig";
import {
  DEFAULT_LEVEL,
  readStoredLevel,
  persistStoredLevel,
  getScriptLevelFromFilters,
  getShuffleLevelFromSorting,
  getShuffleNodeByValue,
  clampShuffleLevelForRow,
  getMaxShuffleLevelForRow,
  describeLevel,
  normalizeLevel,
  PROGRESSION_MODES,
  getWindowSizes,
  getShapeGroupCount,
  getAccuracyThresholds,
  clearStoredData,
} from "../Misc/levelUtils";

const TOTAL_ROWS = ROW_TIERS.length;
const WINDOW_SIZES = getWindowSizes();
const SHAPE_GROUP_COUNT = getShapeGroupCount();
const ACCURACY_STEPS = getAccuracyThresholds();

const MODE_OPTIONS = [
  {
    key: PROGRESSION_MODES.LINEAR,
    title: "Linear",
    caption: "One row at a time",
  },
  {
    key: PROGRESSION_MODES.RANGE,
    title: "Range",
    caption: "Sliding multi-row focus",
  },
  {
    key: PROGRESSION_MODES.SHAPES,
    title: "Shapes",
    caption: "Visual similarity groups",
  },
  {
    key: PROGRESSION_MODES.ADAPTIVE,
    title: "Adaptive",
    caption: "Accuracy-based review",
  },
];

const clampRowValue = (value = 1) => {
  const numeric = Number.isFinite(value) ? value : 1;
  return Math.min(Math.max(1, Math.floor(numeric)), TOTAL_ROWS);
};

const clampRange = (start, end) => {
  const safeStart = clampRowValue(start);
  const safeEnd = clampRowValue(end);
  return safeStart <= safeEnd ? { start: safeStart, end: safeEnd } : { start: safeEnd, end: safeStart };
};

const toPercent = (value) => `${Math.round((value || 0) * 100)}%`;

const Setup = () => {
  const { filters, setFilters, options, setOptions } = useGameState();
  const [lastLevel, setLastLevel] = useState(() => readStoredLevel());
  const [storageResetMessage, setStorageResetMessage] = useState("");

  const baseRowRange = options.rowRange || { start: options.rowLevel || 1, end: options.rowLevel || 1 };
  const rowRange = useMemo(
    () => clampRange(baseRowRange.start, baseRowRange.end),
    [baseRowRange.start, baseRowRange.end]
  );
  const studyMode = options.studyMode || PROGRESSION_MODES.LINEAR;
  const rowCount = Math.max(1, rowRange.end - rowRange.start + 1);
  const shapeGroup = Math.min(Math.max(1, options.shapeGroup || 1), SHAPE_GROUP_COUNT);
  const accuracyThreshold = Number.isFinite(options.accuracyThreshold)
    ? options.accuracyThreshold
    : DEFAULT_LEVEL.accuracyThreshold;

  const scriptLevel = getScriptLevelFromFilters(filters.characterTypes);
  const shuffleLevelRaw = getShuffleLevelFromSorting(options.sorting);
  const shuffleLevel = studyMode === PROGRESSION_MODES.ADAPTIVE
    ? 0
    : clampShuffleLevelForRow(rowCount, shuffleLevelRaw);

  const activeScriptKey = LEVEL_TO_SCRIPT[scriptLevel];
  const activeScriptNode = useMemo(
    () => SCRIPT_NODES.find((node) => node.value === activeScriptKey),
    [activeScriptKey]
  );
  const activeShuffleNode = useMemo(() => {
    if (studyMode === PROGRESSION_MODES.ADAPTIVE) {
      return SHUFFLE_NODES[0];
    }
    return SHUFFLE_NODES.find((node) => node.value === shuffleLevel) || SHUFFLE_NODES[0];
  }, [shuffleLevel, studyMode]);

  const guidedCourseLevel = useMemo(() => normalizeLevel(lastLevel), [lastLevel]);
  const guidedCourseDescriptor = useMemo(
    () => describeLevel(guidedCourseLevel),
    [guidedCourseLevel]
  );

  const customLevel = useMemo(
    () =>
      normalizeLevel({
        mode: studyMode,
        rowStart: rowRange.start,
        rowEnd: rowRange.end,
        scriptLevel,
        shuffleLevel,
        shapeGroup,
        accuracyThreshold,
      }),
    [studyMode, rowRange, scriptLevel, shuffleLevel, shapeGroup, accuracyThreshold]
  );
  const customDescriptor = useMemo(() => describeLevel(customLevel), [customLevel]);

  const windowSize = Math.max(2, rowCount);
  const maxWindowStart = Math.max(1, TOTAL_ROWS - windowSize + 1);
  const accuracyIndexRaw = ACCURACY_STEPS.findIndex((value) => value === accuracyThreshold);
  const accuracyIndex = accuracyIndexRaw === -1 ? 0 : accuracyIndexRaw;

  const modifierActiveKeys = Object.entries(filters.modifierGroup)
    .filter(([, isOn]) => isOn)
    .map(([key]) => key);

  const handleModeSelect = (mode) => {
    setOptions((prev) => {
      if (prev.studyMode === mode) {
        return prev;
      }
      let nextRange;
      if (mode === PROGRESSION_MODES.LINEAR) {
        const pivot = clampRowValue(rowRange.start);
        nextRange = clampRange(pivot, pivot);
      } else if (mode === PROGRESSION_MODES.RANGE) {
        const initialSize = WINDOW_SIZES[0] || 2;
        nextRange = clampRange(1, initialSize);
      } else {
        nextRange = clampRange(1, TOTAL_ROWS);
      }
      return {
        ...prev,
        studyMode: mode,
        rowRange: nextRange,
        rowLevel: nextRange.end,
      };
    });
  };

  const handleLinearRowChange = (value) => {
    const safeValue = clampRowValue(value);
    setOptions((prev) => ({
      ...prev,
      rowRange: { start: safeValue, end: safeValue },
      rowLevel: safeValue,
    }));
  };

  const handleWindowStartChange = (value) => {
    const safeStart = clampRowValue(value);
    const size = Math.max(2, rowCount);
    const maxStart = Math.max(1, TOTAL_ROWS - size + 1);
    const nextStart = Math.min(safeStart, maxStart);
    const nextEnd = clampRowValue(nextStart + size - 1);
    setOptions((prev) => ({
      ...prev,
      rowRange: { start: nextStart, end: nextEnd },
      rowLevel: nextEnd,
    }));
  };

  const handleWindowSizeChange = (size) => {
    const safeSize = Math.max(2, Math.min(size, TOTAL_ROWS));
    const maxStart = Math.max(1, TOTAL_ROWS - safeSize + 1);
    const nextStart = Math.min(rowRange.start, maxStart);
    const nextEnd = clampRowValue(nextStart + safeSize - 1);
    setOptions((prev) => ({
      ...prev,
      rowRange: { start: nextStart, end: nextEnd },
      rowLevel: nextEnd,
    }));
  };

  const handleShapeGroupChange = (value) => {
    const safeGroup = Math.min(Math.max(1, value), SHAPE_GROUP_COUNT);
    setOptions((prev) => ({
      ...prev,
      shapeGroup: safeGroup,
    }));
  };

  const handleAccuracyChange = (index) => {
    const safeIndex = Math.min(Math.max(0, index), ACCURACY_STEPS.length - 1);
    const nextThreshold = ACCURACY_STEPS[safeIndex];
    setOptions((prev) => ({
      ...prev,
      accuracyThreshold: nextThreshold,
    }));
  };

  const handleModifierToggle = (key) => {
    setFilters((prev) => ({
      ...prev,
      modifierGroup: {
        ...prev.modifierGroup,
        [key]: !prev.modifierGroup[key],
      },
    }));
  };

  const handleScriptSelect = (value) => {
    setFilters((prev) => ({
      ...prev,
      characterTypes: {
        ...prev.characterTypes,
        hiragana: value === "hiragana" || value === "both",
        katakana: value === "katakana" || value === "both",
      },
    }));
  };

  const handleShuffleSelect = (node) => {
    if (studyMode === PROGRESSION_MODES.ADAPTIVE) return;
    setOptions((prev) => ({
      ...prev,
      sorting: {
        ...prev.sorting,
        rowShuffle: node.rowShuffle,
        columnShuffle: node.columnShuffle,
        shuffleLevel: node.value,
      },
    }));
  };

  const handleScriptSliderChange = (event) => {
    const value = Number(event.target.value);
    const nextKey = LEVEL_TO_SCRIPT[value];
    if (nextKey) {
      handleScriptSelect(nextKey);
    }
  };

  const handleShuffleSliderChange = (event) => {
    if (studyMode === PROGRESSION_MODES.ADAPTIVE) return;
    const value = Number(event.target.value);
    const clampedValue = clampShuffleLevelForRow(rowCount, value);
    const node = SHUFFLE_NODES.find((option) => option.value === clampedValue);
    if (node) {
      handleShuffleSelect(node);
    }
  };

  const applyGuidedLevel = (level = DEFAULT_LEVEL) => {
    const normalized = normalizeLevel(level);
    const targetScriptKey =
      LEVEL_TO_SCRIPT[normalized.scriptLevel] || LEVEL_TO_SCRIPT[DEFAULT_LEVEL.scriptLevel];

    setFilters((prev) => ({
      ...prev,
      characterTypes: {
        ...prev.characterTypes,
        hiragana: targetScriptKey === "hiragana" || targetScriptKey === "both",
        katakana: targetScriptKey === "katakana" || targetScriptKey === "both",
      },
    }));

    setOptions((prev) => {
      const range = clampRange(normalized.rowStart, normalized.rowEnd);
      const count = Math.max(1, range.end - range.start + 1);
      const forceOrdered = normalized.mode === PROGRESSION_MODES.ADAPTIVE;
      const clampedShuffleValue = forceOrdered
        ? 0
        : clampShuffleLevelForRow(count, normalized.shuffleLevel);
      const shuffleNode = getShuffleNodeByValue(clampedShuffleValue) || SHUFFLE_NODES[0];

      return {
        ...prev,
        studyMode: normalized.mode,
        rowRange: range,
        rowLevel: range.end,
        shapeGroup: normalized.shapeGroup,
        accuracyThreshold: normalized.accuracyThreshold,
        sorting: {
          ...prev.sorting,
          rowShuffle: forceOrdered ? false : shuffleNode.rowShuffle,
          columnShuffle: forceOrdered || count <= 1 ? false : shuffleNode.columnShuffle,
          shuffleLevel: forceOrdered ? 0 : shuffleNode.value,
        },
      };
    });

    setLastLevel(normalized);
    return normalized;
  };

  const handleResetLevels = () => {
    const normalized = applyGuidedLevel(DEFAULT_LEVEL);
    persistStoredLevel(normalized);
  };

  const handleGuidedStart = () => {
    const normalized = applyGuidedLevel(lastLevel);
    persistStoredLevel(normalized);
  };

  const handleClearStoredData = () => {
    clearStoredData();
    applyGuidedLevel(DEFAULT_LEVEL);
    setStorageResetMessage("Saved data cleared. Everything is back to defaults.");
  };

  const renderGroupingControls = () => {
    switch (studyMode) {
      case PROGRESSION_MODES.LINEAR: {
        const rowMeta = ROW_TIERS[rowRange.start - 1];
        return (
          <div className="slider-control">
            <input
              type="range"
              min="1"
              max={TOTAL_ROWS}
              step="1"
              value={rowRange.start}
              onChange={(event) => handleLinearRowChange(Number(event.target.value))}
            />
            <div className="slider-value">
              <span className="slider-title">Row {rowRange.start}</span>
              <span className="slider-caption">{rowMeta?.caption}</span>
            </div>
          </div>
        );
      }
      case PROGRESSION_MODES.RANGE: {
        const sliderDisabled = maxWindowStart <= 1;
        return (
          <>
            <div className="slider-control">
              <input
                type="range"
                min="1"
                max={Math.max(1, maxWindowStart)}
                step="1"
                value={Math.min(rowRange.start, maxWindowStart)}
                disabled={sliderDisabled}
                onChange={(event) => handleWindowStartChange(Number(event.target.value))}
              />
              <div className="slider-value">
                <span className="slider-title">Rows {rowRange.start}-{rowRange.end}</span>
                <span className="slider-caption">{windowSize} rows active</span>
              </div>
            </div>
            <div className="window-size-grid">
              {WINDOW_SIZES.map((size) => (
                <button
                  key={size}
                  type="button"
                  className={`mode-chip ${windowSize === size ? "active" : ""}`}
                  onClick={() => handleWindowSizeChange(size)}
                >
                  <span className="mode-chip-title">{size} rows</span>
                  <span className="mode-chip-caption">
                    {size === TOTAL_ROWS ? "Full set" : `Range of ${size}`}
                  </span>
                </button>
              ))}
            </div>
          </>
        );
      }
      case PROGRESSION_MODES.SHAPES:
        return (
          <div className="slider-control">
            <input
              type="range"
              min="1"
              max={SHAPE_GROUP_COUNT}
              step="1"
              value={shapeGroup}
              onChange={(event) => handleShapeGroupChange(Number(event.target.value))}
            />
            <div className="slider-value">
              <span className="slider-title">Group {shapeGroup}</span>
              <span className="slider-caption">Focus by shared strokes</span>
            </div>
          </div>
        );
      case PROGRESSION_MODES.ADAPTIVE:
        return (
          <div className="slider-control">
            <input
              type="range"
              min="0"
              max={Math.max(0, ACCURACY_STEPS.length - 1)}
              step="1"
              value={accuracyIndex}
              onChange={(event) => handleAccuracyChange(Number(event.target.value))}
            />
            <div className="slider-value">
              <span className="slider-title">Show below {toPercent(accuracyThreshold)}</span>
              <span className="slider-caption">Targets recent weak spots</span>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <main className="setup">
      <div className="setup-content">
        <h1 className="setup-title">Choose Your Path</h1>

        <div className="auto-mode-card">
          <h4>Guided Course</h4>
          <div className="auto-mode-copy">
            <p>
              Master kana step by step on a structured journey. Each stage introduces new characters
              while reinforcing what you’ve already learned, steadily building recognition, speed,
              and confidence.
            </p>
          </div>
          <div className="auto-mode-copy">
            <p className="auto-mode-description">
              Current checkpoint: <strong>{guidedCourseDescriptor.summary}</strong>
            </p>
          </div>

          <div className="auto-mode-actions">
            <Link to="/game" className="auto-mode-button" onClick={handleGuidedStart}>
              Start Guided
            </Link>
            <button
              type="button"
              className="auto-mode-button auto-mode-reset"
              onClick={handleResetLevels}
            >
              Reset Course
            </button>
            <button
              type="button"
              className="auto-mode-button auto-mode-reset"
              onClick={handleClearStoredData}
            >
              Clear Saved Data
            </button>
          </div>
          {storageResetMessage && (
            <div className="auto-mode-copy">
              <p className="auto-mode-description">{storageResetMessage}</p>
            </div>
          )}
        </div>

        <div className="auto-mode-card">
          <h4>Custom Course</h4>
          <div className="auto-mode-copy">
            <p>Dial in a specific mode, grouping, kana mix, and shuffle profile to fit your goals.</p>
          </div>

          <div className="level-summary">
            <span className="level-badge">Mode | Grouping | Kana | Shuffle</span>
            <p className="level-details">
              {customDescriptor.mode} | {customDescriptor.grouping} | {customDescriptor.kana} | {customDescriptor.shuffle}
            </p>
          </div>

          <div className="slider-board">
            <section className="slider-block">
              <header className="slider-header">
                <h2>Mode</h2>
                <p>Select how the curriculum should progress.</p>
              </header>
              <div className="mode-grid">
                {MODE_OPTIONS.map((mode) => (
                  <button
                    key={mode.key}
                    type="button"
                    className={`mode-chip ${studyMode === mode.key ? "active" : ""}`}
                    onClick={() => handleModeSelect(mode.key)}
                  >
                    <span className="mode-chip-title">{mode.title}</span>
                    <span className="mode-chip-caption">{mode.caption}</span>
                  </button>
                ))}
              </div>
            </section>

            <section className="slider-block">
              <header className="slider-header">
                <h2>Rows / Grouping</h2>
                <p>Control which slices of kana appear in this run.</p>
              </header>
              {renderGroupingControls()}

              <div className="modifier-switches">
                <span className="modifier-switches-title">Include modifiers</span>
                <div className="modifier-switch-group">
                  {ROW_MODIFIERS.map((modifier) => {
                    const active = modifierActiveKeys.includes(modifier.key);
                    return (
                      <label
                        key={modifier.id}
                        className={`modifier-switch ${active ? "active" : ""}`}
                      >
                        <input
                          type="checkbox"
                          checked={active}
                          onChange={() => handleModifierToggle(modifier.key)}
                        />
                        <span className="modifier-switch-track" aria-hidden="true"></span>
                        <span className="modifier-switch-meta">
                          <span className="modifier-switch-title">{modifier.title}</span>
                          <span className="modifier-switch-caption">{modifier.caption}</span>
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </section>

            <section className="slider-block">
              <header className="slider-header">
                <h2>Kana Mode</h2>
                <p>Slide to choose hiragana, katakana, or both.</p>
              </header>
              <div className="slider-control">
                <input
                  type="range"
                  min="1"
                  max={SCRIPT_NODES.length}
                  step="1"
                  value={scriptLevel}
                  onChange={handleScriptSliderChange}
                />
                <div className="slider-value">
                  <span className="slider-title">{activeScriptNode?.title}</span>
                  <span className="slider-caption">{activeScriptNode?.caption}</span>
                </div>
              </div>
            </section>

            <section className="slider-block">
              <header className="slider-header">
                <h2>Shuffle</h2>
                <p>Dial in how tiles should mix.</p>
              </header>
              <div className="slider-control">
                <input
                  type="range"
                  min="0"
                  max={getMaxShuffleLevelForRow(rowCount)}
                  step="1"
                  value={shuffleLevel}
                  disabled={studyMode === PROGRESSION_MODES.ADAPTIVE}
                  onChange={handleShuffleSliderChange}
                />
                <div className="slider-value">
                  <span className="slider-title">{activeShuffleNode.title}</span>
                  <span className="slider-caption">{activeShuffleNode.caption}</span>
                </div>
              </div>
              {studyMode === PROGRESSION_MODES.ADAPTIVE && (
                <p className="shuffle-hint">Adaptive sessions run ordered to preserve accuracy tracking.</p>
              )}
            </section>
          </div>

          <div className="setup-actions">
            <Link to="/game" className="setup-start">
              Start Custom Course
            </Link>
          </div>
        </div>

        <Link to="/stats" className="setup-secondary">
          View stats
        </Link>
      </div>
    </main>
  );
};

export default Setup;

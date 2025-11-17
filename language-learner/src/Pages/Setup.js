import React, { useEffect, useMemo, useState } from "react";
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
  getScriptLevelFromFilters,
  getShuffleLevelFromSorting,
  clampShuffleLevelForRow,
  getMaxShuffleLevelForRow,
  describeLevel,
  normalizeLevel,
  PROGRESSION_MODES,
  getWindowSizes,
  getAccuracyThresholds,
  clearStoredData,
  levelToScriptKey,
  scriptKeyToLevel,
  getShapeGroupOptionsForFilters,
} from "../Misc/levelUtils";
import PageNav from "../Components/PageNav";

const TOTAL_ROWS = ROW_TIERS.length;
const WINDOW_SIZES = getWindowSizes();
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
  const {
    filters,
    setFilters,
    options,
    setOptions,
    applyLevelConfiguration,
    setSessionType,
  } = useGameState();
  const [lastLevel, setLastLevel] = useState(() => readStoredLevel());
  const [storageMessage, setStorageMessage] = useState("");

  const baseRowRange = options.rowRange || { start: options.rowLevel || 1, end: options.rowLevel || 1 };
  const rowRange = useMemo(
    () => clampRange(baseRowRange.start, baseRowRange.end),
    [baseRowRange.start, baseRowRange.end]
  );
  const studyMode = options.studyMode || PROGRESSION_MODES.LINEAR;
  const rowCount = Math.max(1, rowRange.end - rowRange.start + 1);
  const shapeGroup = options.shapeGroup || 1;
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
  const availableShapeGroups = useMemo(
    () => getShapeGroupOptionsForFilters(filters.characterTypes),
    [filters.characterTypes]
  );
  const shuffleLegend = useMemo(() => {
    const maxShuffle = getMaxShuffleLevelForRow(rowCount);
    return SHUFFLE_NODES.filter((node) => node.value <= maxShuffle).map((node) => ({
      value: node.value,
      glyph:
        node.rowShuffle && node.columnShuffle
          ? "↔ ↕"
          : node.rowShuffle
            ? "↔"
            : "—",
      title: node.title,
    }));
  }, [rowCount]);

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

  useEffect(() => {
    if (!availableShapeGroups.includes(options.shapeGroup)) {
      const fallbackGroup = availableShapeGroups[0] || 1;
      setOptions((prev) => ({
        ...prev,
        shapeGroup: fallbackGroup,
      }));
    }
  }, [availableShapeGroups, options.shapeGroup, setOptions]);

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
    const safeGroup = availableShapeGroups.includes(value)
      ? value
      : availableShapeGroups[0] || 1;
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
    setFilters((prev) => {
      const nextTypes = {
        ...prev.characterTypes,
        hiragana: value === "hiragana" || value === "both",
        katakana: value === "katakana" || value === "both",
      };
      const nextGroups = getShapeGroupOptionsForFilters(nextTypes);
      setOptions((prevOptions) => {
        const safeGroup = nextGroups.includes(prevOptions.shapeGroup)
          ? prevOptions.shapeGroup
          : nextGroups[0] || 1;
        return {
          ...prevOptions,
          shapeGroup: safeGroup,
        };
      });
      return {
        ...prev,
        characterTypes: nextTypes,
      };
    });
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

  const handleShuffleSliderChange = (event) => {
    if (studyMode === PROGRESSION_MODES.ADAPTIVE) return;
    const value = Number(event.target.value);
    const clampedValue = clampShuffleLevelForRow(rowCount, value);
    const node = SHUFFLE_NODES.find((option) => option.value === clampedValue);
    if (node) {
      handleShuffleSelect(node);
    }
  };

  const handleGuidedStart = () => {
    const desiredScriptKey = activeScriptKey || "hiragana";
    const storedScriptKey = levelToScriptKey(lastLevel.scriptLevel);
    const resumeFromStored = storedScriptKey === desiredScriptKey;
    const baseLevel = resumeFromStored
      ? lastLevel
      : {
          ...DEFAULT_LEVEL,
          scriptLevel: scriptKeyToLevel(desiredScriptKey),
        };
    const normalized = normalizeLevel(baseLevel);
    applyLevelConfiguration(normalized);
    setLastLevel(normalized);
    setSessionType("guided");
    setStorageMessage("");
  };

  const handleFreePlayStart = () => {
    setSessionType("freePlay");
    setStorageMessage("");
  };

  const handleResetCourse = () => {
    const normalized = normalizeLevel(DEFAULT_LEVEL);
    applyLevelConfiguration(normalized);
    setLastLevel(normalized);
    setStorageMessage("Guided course reset to Row 1 Hiragana.");
  };

  const handleClearSavedData = () => {
    clearStoredData();
    const normalized = normalizeLevel(DEFAULT_LEVEL);
    applyLevelConfiguration(normalized);
    setLastLevel(normalized);
    setStorageMessage("Saved data cleared.");
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
              max={Math.max(1, availableShapeGroups.length)}
              step="1"
              value={Math.max(0, availableShapeGroups.indexOf(shapeGroup)) + 1}
              disabled={availableShapeGroups.length <= 1}
              onChange={(event) => {
                const maxIndex = Math.max(0, availableShapeGroups.length - 1);
                const requestedIndex = Math.max(
                  0,
                  Math.min(maxIndex, Number(event.target.value) - 1)
                );
                const nextGroup = availableShapeGroups[requestedIndex] || availableShapeGroups[0] || 1;
                handleShapeGroupChange(nextGroup);
              }}
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
      <PageNav />
      <header className="setup-header">
        <div className="setup-headings">
          <h1 className="setup-title">Choose Your Path</h1>
          <p className="setup-subtitle">
            Build a free play run or follow the guided flow. Adjust path, mode, grouping, modifiers, and shuffle from a single board.
          </p>
        </div>
      </header>

      <section className="guided-panel">
        <div className="guided-copy">
          <h4>Guided Course</h4>
          <p>
            Master kana step by step on a structured journey. Each stage introduces new characters
            while reinforcing what you’ve already learned.
          </p>
          <p className="guided-checkpoint">
            Current checkpoint: <strong>{guidedCourseDescriptor.summary}</strong>
          </p>
        </div>
        <div className="guided-actions">
          <button type="button" onClick={handleResetCourse}>
            Reset Course
          </button>
          <button type="button" onClick={handleClearSavedData}>
            Clear Saved Data
          </button>
          <Link to="/options">
            Options
          </Link>

          <div className="level-summary">
            <span className="level-badge">Mode | Grouping | Kana | Shuffle</span>
            <p className="level-details">
              {customDescriptor.mode} | {customDescriptor.grouping} | {customDescriptor.kana} | {customDescriptor.shuffle}
            </p>
          </div>
        </div>
        {storageMessage && <p className="guided-message">{storageMessage}</p>}
      </section>

      <div className="control-stack">
          <div className="control-group">
            <div className="control-label">Path</div>
            <div className="mode-grid path-grid">
              {SCRIPT_NODES.map((node) => (
                <button
                  key={node.id}
                  type="button"
                  className={`mode-chip ${activeScriptKey === node.value ? "active" : ""}`}
                  onClick={() => handleScriptSelect(node.value)}
                >
                  <span className="mode-chip-title">{node.title}</span>
                  <span className="mode-chip-caption">{node.caption}</span>
                </button>
              ))}
            </div>
            {activeScriptNode?.caption && (
              <p className="control-caption">{activeScriptNode.caption}</p>
            )}
          </div>

          <div className="control-group">
            <div className="control-label">Mode</div>
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
          </div>

          <div className="control-group">
            <div className="control-label">Rows / Grouping</div>
            {renderGroupingControls()}
          </div>

          <div className="control-group">
            <div className="control-label">Modifiers</div>
            <div className="modifier-switches">
              <div className="modifier-switch-group">
                {ROW_MODIFIERS.map((modifier) => {
                  const active = modifierActiveKeys.includes(modifier.key);
                  return (
                    <label key={modifier.id} className={`modifier-switch ${active ? "active" : ""}`}>
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
          </div>

          <div className="control-group">
            <div className="control-label">Shuffle</div>
            <div className="shuffle-row">
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
              <div className="shuffle-glyphs" aria-hidden="true">
                {shuffleLegend.map((option) => (
                  <span
                    key={option.value}
                    className={`shuffle-glyph ${option.value === shuffleLevel ? "active" : ""}`}
                    title={option.title}
                  >
                    {option.glyph}
                  </span>
                ))}
              </div>
            </div>
            {studyMode === PROGRESSION_MODES.ADAPTIVE && (
              <p className="shuffle-hint">Adaptive sessions run ordered to preserve accuracy tracking.</p>
            )}
          </div>
      </div>

      <div className="setup-actions">
        <Link
          to="/game"
          className="setup-start setup-start--ghost"
          onClick={handleGuidedStart}
        >
          Start Guided
        </Link>
        <Link
          to="/game"
          className="setup-start"
          onClick={handleFreePlayStart}
        >
          Start Free Play
        </Link>
      </div>
    </main>
  );
};

export default Setup;

import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "../Styles/Setup.scss";
import { useGameState } from "../Contexts/GameStateContext";
import {
  ROW_TIERS,
} from "../Data/skillTreeConfig";
import {
  DEFAULT_LEVEL,
  getScriptLevelFromFilters,
  getShuffleLevelFromSorting,
  clampShuffleLevelForRow,
  PROGRESSION_MODES,
  getShapeGroupOptionsForFilters,
  describeLevel,
  normalizeLevel,
} from "../Misc/levelUtils";
import PageNav from "../Components/PageNav";
import {
  PATH_MODIFIER_OPTIONS,
  ensureCustomSelections,
  toggleRowSelection,
  toggleAllRowsSelection,
  areAllRowsEnabled,
  toggleShapeSelection,
  toggleAllShapesSelection,
  areAllShapesEnabled,
  clampFrequencyTarget,
  adjustFrequencyTarget,
  CUSTOM_SHUFFLE_OPTIONS,
  getShuffleKeyFromSorting,
  getSortingForShuffleKey,
  getDefaultCustomSelections,
} from "../Misc/customGameMode";
import { defaultState } from "../Misc/Utils";

const ROW_SECTION_KEYS = ["hiragana", "katakana"];

const Setup = () => {
  const {
    filters,
    setFilters,
    options,
    setOptions,
    setSessionType,
  } = useGameState();
  const studyMode = options.studyMode || PROGRESSION_MODES.LINEAR;
  const rowRange = useMemo(
    () => options.rowRange || { start: options.rowLevel || 1, end: options.rowLevel || 1 },
    [options.rowRange?.start, options.rowRange?.end, options.rowLevel]
  );
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

  const availableShapeGroups = useMemo(
    () => getShapeGroupOptionsForFilters(filters.characterTypes),
    [filters.characterTypes]
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


  const customSelections = useMemo(
    () => ensureCustomSelections(options.customSelections),
    [options.customSelections]
  );
  const frequencyTarget =
    customSelections.frequencyTarget ??
    clampFrequencyTarget(Math.round((1 - accuracyThreshold) * 100));

  const getCharacterOptionActive = (option) => {
    if (option.type === "character") {
      return Boolean(filters.characterTypes[option.key]);
    }
    return Boolean(filters.modifierGroup[option.key]);
  };

  const updateShapeGroupFromTypes = (nextTypes) => {
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
  };

  const handleCharacterOptionToggle = (option) => {
    if (option.type === "character") {
      setFilters((prev) => {
        const nextValue = !prev.characterTypes[option.key];
        const nextCharacterTypes = {
          ...prev.characterTypes,
          [option.key]: nextValue,
        };
        // ensure at least one script remains active
        if (!nextCharacterTypes.hiragana && !nextCharacterTypes.katakana) {
          nextCharacterTypes[option.key] = true;
        }
        updateShapeGroupFromTypes(nextCharacterTypes);
        return {
          ...prev,
          characterTypes: nextCharacterTypes,
        };
      });
    } else {
      setFilters((prev) => ({
        ...prev,
        modifierGroup: {
          ...prev.modifierGroup,
          [option.key]: !prev.modifierGroup[option.key],
        },
      }));
    }
  };

  const updateCustomSelections = (updater) => {
    setOptions((prev) => {
      const normalized = ensureCustomSelections(prev.customSelections);
      const nextSelections = updater(normalized);
      return {
        ...prev,
        customSelections: nextSelections,
      };
    });
  };

  const handleRowToggle = (scriptKey, rowValue) => {
    updateCustomSelections((prevSelections) => ({
      ...prevSelections,
      rows: toggleRowSelection(prevSelections.rows, scriptKey, rowValue),
    }));
  };

  const handleToggleAllRows = (scriptKey, enable) => {
    updateCustomSelections((prevSelections) => ({
      ...prevSelections,
      rows: toggleAllRowsSelection(prevSelections.rows, scriptKey, enable),
    }));
  };

  const handleShapeToggle = (group) => {
    updateCustomSelections((prevSelections) => ({
      ...prevSelections,
      shapes: toggleShapeSelection(prevSelections.shapes, group),
    }));
  };

  const handleToggleAllShapes = (enable) => {
    updateCustomSelections((prevSelections) => ({
      ...prevSelections,
      shapes: toggleAllShapesSelection(prevSelections.shapes, enable),
    }));
  };

  const handleFrequencyChange = (value) => {
    const nextValue = clampFrequencyTarget(value);
    updateCustomSelections((prevSelections) => ({
      ...prevSelections,
      frequencyTarget: nextValue,
    }));
    setOptions((prev) => ({
      ...prev,
      accuracyThreshold: 1 - nextValue / 100,
    }));
  };

  const handleFrequencyAdjust = (delta) => {
    handleFrequencyChange(adjustFrequencyTarget(frequencyTarget, delta));
  };

  const shuffleKey = getShuffleKeyFromSorting(options.sorting);
  const [selectionTab, setSelectionTab] = useState("rows");

  const handleShuffleModeChange = (key) => {
    setOptions((prev) => ({
      ...prev,
      sorting: getSortingForShuffleKey(key, prev.sorting),
    }));
  };

  const handleResetForm = () => {
    setFilters(defaultState.filters);
    setOptions({
      ...defaultState.options,
      customSelections: getDefaultCustomSelections(),
    });
  };

  useEffect(() => {
    if (!availableShapeGroups.includes(options.shapeGroup)) {
      const fallbackGroup = availableShapeGroups[0] || 1;
      setOptions((prev) => ({
        ...prev,
        shapeGroup: fallbackGroup,
      }));
    }
  }, [availableShapeGroups, options.shapeGroup, setOptions]);

  const handleFreePlayStart = () => {
    setSessionType("freePlay");
  };

  return (
    <main className="setup">
      <PageNav />
      <header className="setup-header">
        <p className="eyebrow">Step 2 · Custom Setup</p>
        <h1>Customize Your Session</h1>
        <p>
          Choose the exact path, mode, grouping, modifiers, and shuffle to craft your perfect practice run.
        </p>
      </header>

      <section className="setup-summary">
        <span className="setup-badge">Current Plan</span>
        <p className="setup-summary-main">{customDescriptor.summary}</p>
        <p className="setup-summary-note">Mode · Grouping · Kana · Shuffle</p>
      </section>

      <div className="setup-grid">
      <section className="control-card selection-card full-width-card">
        <div className="control-card-header">
          <h2>Characters & Extras</h2>
          <p>Mix base scripts with dakuten add-ons.</p>
        </div>
          <div className="selection-grid">
            {PATH_MODIFIER_OPTIONS.map((option) => {
              const active = getCharacterOptionActive(option);
              return (
                <button
                  key={option.key}
                  type="button"
                  className={`selection-chip ${active ? "active" : ""}`}
                  onClick={() => handleCharacterOptionToggle(option)}
                >
                  <span className="selection-chip-title">{option.label}</span>
                </button>
              );
            })}
          </div>
          <div className="selection-actions">
            <button type="button" onClick={handleResetForm}>
              Reset
            </button>
            <button type="button" className="selection-save" disabled>
              Save Preset
            </button>
          </div>
        </section>
        <section className="control-card tab-card">
          <div className="tab-header">
            <button
              type="button"
              className={`tab-button ${selectionTab === "rows" ? "active" : ""}`}
              onClick={() => setSelectionTab("rows")}
            >
              Row Groups
            </button>
            <button
              type="button"
              className={`tab-button ${selectionTab === "shapes" ? "active" : ""}`}
              onClick={() => setSelectionTab("shapes")}
            >
              Stroke Groups
            </button>
            <button
              type="button"
              className={`tab-button ${selectionTab === "frequency" ? "active" : ""}`}
              onClick={() => setSelectionTab("frequency")}
            >
              Frequency
            </button>
          </div>
          <div className="tab-content">
            {selectionTab === "rows" && (
              <div className="row-selection-card">
                {ROW_SECTION_KEYS.map((scriptKey) => {
                  const label = scriptKey === "hiragana" ? "Hiragana" : "Katakana";
                  const allActive = areAllRowsEnabled(customSelections.rows, scriptKey);
                  return (
                    <div key={scriptKey} className="row-section">
                      <div className="row-section-header">
                        <h3>{label}</h3>
                        <button
                          type="button"
                          className="toggle-all"
                          onClick={() => handleToggleAllRows(scriptKey, !allActive)}
                        >
                          {allActive ? "Clear All" : "Select All"}
                        </button>
                      </div>
                      <div className="row-toggle-grid">
                        {ROW_TIERS.map((row) => {
                          const active = customSelections.rows[scriptKey][row.value];
                          return (
                            <button
                              key={`${scriptKey}-${row.id}`}
                              type="button"
                              className={`row-toggle ${active ? "active" : ""}`}
                              onClick={() => handleRowToggle(scriptKey, row.value)}
                            >
                              <span className="row-toggle-title">{row.title}</span>
                              <span className="row-toggle-caption">{row.caption}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {selectionTab === "shapes" && (
              <div className="shape-selection-card">
                <div className="row-section-header">
                  <h3>Shapes</h3>
                  <button
                    type="button"
                    className="toggle-all"
                    onClick={() => handleToggleAllShapes(!areAllShapesEnabled(customSelections.shapes))}
                  >
                    {areAllShapesEnabled(customSelections.shapes) ? "Clear All" : "Select All"}
                  </button>
                </div>
                <div className="shape-toggle-grid">
                  {Object.keys(customSelections.shapes)
                    .map((group) => Number(group))
                    .sort((a, b) => a - b)
                    .map((group) => {
                      const active = customSelections.shapes[group];
                      return (
                        <button
                          key={`shape-${group}`}
                          type="button"
                          className={`shape-toggle ${active ? "active" : ""}`}
                          onClick={() => handleShapeToggle(Number(group))}
                        >
                          Group {group}
                        </button>
                      );
                    })}
                </div>
              </div>
            )}

            {selectionTab === "frequency" && (
              <div className="frequency-selection-card">
                <div className="control-card-header">
                  <h2>Frequency Focus</h2>
                  <p>Prioritize kana most frequently missed.</p>
                </div>
                <div className="frequency-controls">
                  <button type="button" onClick={() => handleFrequencyAdjust(-5)}>-</button>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={frequencyTarget}
                    onChange={(event) => handleFrequencyChange(Number(event.target.value))}
                  />
                  <button type="button" onClick={() => handleFrequencyAdjust(5)}>+</button>
                </div>
                <p className="frequency-display">
                  Target kana missed more than <strong>{frequencyTarget}%</strong>
                </p>
              </div>
            )}
          </div>
        </section>

        <section className="control-card shuffle-card full-width-card">
          <div className="control-card-header">
            <h2>Shuffle</h2>
            <p>Control ordering and randomization.</p>
          </div>
          <div className="shuffle-options">
            {CUSTOM_SHUFFLE_OPTIONS.map((option) => (
              <button
                key={option.key}
                type="button"
                className={`shuffle-chip ${shuffleKey === option.key ? "active" : ""}`}
                onClick={() => handleShuffleModeChange(option.key)}
              >
                <span className="shuffle-icon">{option.icon}</span>
                <span className="shuffle-text">
                  <span className="shuffle-title">{option.title}</span>
                  <span className="shuffle-caption">{option.caption}</span>
                </span>
              </button>
            ))}
          </div>
        </section>
      </div>

      <div className="setup-actions">
        <Link
          to="/game"
          className="setup-start"
          onClick={handleFreePlayStart}
        >
          Start Custom Run
        </Link>
      </div>
    </main>
  );
};

export default Setup;

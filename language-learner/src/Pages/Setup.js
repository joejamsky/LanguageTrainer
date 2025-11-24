import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "../Styles/Setup.scss";
import { useGameState } from "../Contexts/GameStateContext";
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
  clampAccuracyTarget,
  CUSTOM_SHUFFLE_OPTIONS,
  getShuffleKeyFromSorting,
  getSortingForShuffleKey,
  getDefaultCustomSelections,
} from "../Misc/customGameMode";
import {
  getRowsForKana,
  getStrokeGroupsForKana,
  STROKE_SECTION_KEYS,
} from "../Data/kanaGroups";
import { defaultState } from "../Misc/Utils";

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
  const accuracyTargets = customSelections.accuracyTargets || {};
  const fallbackAccuracyPercent = clampAccuracyTarget(
    Math.round(
      (Number.isFinite(accuracyThreshold)
        ? accuracyThreshold
        : DEFAULT_LEVEL.accuracyThreshold) * 100
    )
  );
  const getAccuracyValue = (key) =>
    accuracyTargets[key] ?? fallbackAccuracyPercent;
  const kanaOptionMap = useMemo(
    () =>
      PATH_MODIFIER_OPTIONS.reduce((acc, option) => {
        acc[option.key] = option;
        return acc;
      }, {}),
    []
  );
  const modifierOptions = useMemo(
    () => PATH_MODIFIER_OPTIONS.filter((option) => option.type === "modifier"),
    []
  );
  const scriptKeys = ["hiragana", "katakana"];
  const getScriptModifierKey = (scriptKey, modifierKey) => `${scriptKey}-${modifierKey}`;

  const getCharacterOptionActive = (option) => {
    if (!option) return false;
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

  const handleShapeToggle = (scriptKey, group) => {
    updateCustomSelections((prevSelections) => ({
      ...prevSelections,
      shapes: toggleShapeSelection(prevSelections.shapes, scriptKey, group),
    }));
  };

  const handleToggleAllShapes = (scriptKey, enable) => {
    updateCustomSelections((prevSelections) => ({
      ...prevSelections,
      shapes: toggleAllShapesSelection(prevSelections.shapes, scriptKey, enable),
    }));
  };

  const handleAccuracyChange = (scriptKey, value) => {
    const nextValue = clampAccuracyTarget(value);
    updateCustomSelections((prevSelections) => ({
      ...prevSelections,
      accuracyTargets: {
        ...prevSelections.accuracyTargets,
        [scriptKey]: nextValue,
      },
    }));
    setOptions((prev) => ({
      ...prev,
      accuracyThreshold: nextValue / 100,
    }));
  };
  const isAnyRowsSelected = (panelKey) => {
    const rows = getRowsForKana(panelKey);
    if (!rows.length) return false;
    return rows.some((row) => customSelections.rows[panelKey]?.[row.value]);
  };

  const handleScriptModifierToggle = (scriptKey, modifierKey) => {
    const panelKey = getScriptModifierKey(scriptKey, modifierKey);
    const shouldEnable = !isAnyRowsSelected(panelKey);
    if (shouldEnable && !filters.modifierGroup[modifierKey]) {
      setFilters((prev) => ({
        ...prev,
        modifierGroup: {
          ...prev.modifierGroup,
          [modifierKey]: true,
        },
      }));
    }
    handleToggleAllRows(panelKey, shouldEnable);
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
      accuracyThreshold: DEFAULT_LEVEL.accuracyThreshold,
    });
    setSelectionTab("rows");
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

  const renderRowPanel = (
    panelKey,
    title,
    rows,
    isEnabled = true,
    emptyCopy = "Enable this group to make selections.",
    keyPrefix = panelKey
  ) => {
    if (!rows.length) {
      return null;
    }
    if (!isEnabled) {
      return (
        <div className="row-panel disabled" key={`${keyPrefix}-${panelKey}`}>
          <div className="row-panel-header">
            <h4>{title}</h4>
          </div>
          <p className="panel-placeholder">{emptyCopy}</p>
        </div>
      );
    }
    const allActive = areAllRowsEnabled(customSelections.rows, panelKey);
    return (
      <div className="row-panel" key={`${keyPrefix}-${panelKey}`}>
        <div className="row-panel-header">
          <h4>{title}</h4>
          <button
            type="button"
            className="toggle-all"
            onClick={() => handleToggleAllRows(panelKey, !allActive)}
          >
            {allActive ? "Clear All" : "Select All"}
          </button>
        </div>
        <div className="row-toggle-grid">
          {rows.map((row) => {
            const active = customSelections.rows[panelKey]?.[row.value];
            return (
              <button
                key={`${keyPrefix}-${panelKey}-${row.id}`}
                type="button"
                className={`row-toggle ${active ? "active" : ""}`}
                onClick={() => handleRowToggle(panelKey, row.value)}
              >
                <span className="row-toggle-title">{row.title}</span>
                <span className="row-toggle-caption">{row.caption}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <main className="setup">
      <PageNav />
      <header className="setup-header">
        <h1>Customize Your Session</h1>
      </header>

      <section className="setup-summary">
        <span className="setup-badge">Current Plan</span>
        <p className="setup-summary-main">{customDescriptor.summary}</p>
        <p className="setup-summary-note">Mode · Grouping · Kana · Shuffle</p>
      </section>

      <div className="setup-grid">
        <section className="control-card grouping-card full-width-card">
          <div className="grouping-card-header">
            <div className="tab-header">
              <button
                type="button"
                className={`tab-button ${selectionTab === "rows" ? "active" : ""}`}
                onClick={() => setSelectionTab("rows")}
              >
                Select by Row
              </button>
              <button
                type="button"
                className={`tab-button ${selectionTab === "shapes" ? "active" : ""}`}
                onClick={() => setSelectionTab("shapes")}
              >
                Select by Stroke
              </button>
              <button
                type="button"
                className={`tab-button ${selectionTab === "accuracy" ? "active" : ""}`}
                onClick={() => setSelectionTab("accuracy")}
              >
                Select by Accuracy
              </button>
            </div>
            <div className="selection-actions">
              <button type="button" onClick={handleResetForm}>
                Reset All
              </button>
              <button type="button" className="selection-save" disabled>
                Save Preset
              </button>
            </div>
          </div>
          <p className="control-caption">
            Toggle kana groups, then fine-tune what should be available in the round.
          </p>
          <div className="script-toggle-grid">
            {scriptKeys.map((scriptKey) => {
              const scriptOption = kanaOptionMap[scriptKey];
              const scriptActive = getCharacterOptionActive(scriptOption);
              const scriptLabel = scriptOption?.label || scriptKey;
              return (
                <div key={`${scriptKey}-toggle`} className="script-toggle-group">
                  <button
                    type="button"
                    className={`script-main-toggle ${scriptActive ? "active" : ""}`}
                    onClick={() => handleCharacterOptionToggle(scriptOption)}
                  >
                    {scriptLabel}
                  </button>
                  <div className="script-sub-toggle-row">
                    {modifierOptions.map((modifier) => {
                      const rowKey = getScriptModifierKey(scriptKey, modifier.key);
                      const rowsAvailable = getRowsForKana(rowKey).length > 0;
                      if (!rowsAvailable) {
                        return null;
                      }
                      const modifierEnabled =
                        getCharacterOptionActive(modifier) && scriptActive;
                      const modifierActive =
                        isAnyRowsSelected(rowKey) && modifierEnabled;
                      return (
                        <button
                          key={`${scriptKey}-${modifier.key}-sub`}
                          type="button"
                          className={`script-sub-toggle ${modifierActive ? "active" : ""}`}
                          onClick={() => handleScriptModifierToggle(scriptKey, modifier.key)}
                        >
                          {modifier.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="grouping-content">
            {selectionTab === "rows" && (
              <div className="row-selection-card">
                {scriptKeys.map((scriptKey) => {
                  const scriptOption = kanaOptionMap[scriptKey];
                  const scriptActive = getCharacterOptionActive(scriptOption);
                  const scriptLabel = scriptOption?.label || scriptKey;
                  const baseRows = getRowsForKana(scriptKey);
                  const scriptPanel = renderRowPanel(
                    scriptKey,
                    "Rows",
                    baseRows,
                    scriptActive,
                    `Enable ${scriptLabel} to choose rows.`,
                    scriptKey
                  );
                  const scriptModifierPanels = modifierOptions
                    .map((modifier) => {
                      const rowKey = getScriptModifierKey(scriptKey, modifier.key);
                      if (!getCharacterOptionActive(modifier) || !scriptActive) {
                        return null;
                      }
                      if (!isAnyRowsSelected(rowKey)) {
                        return null;
                      }
                      const modifierRows = getRowsForKana(rowKey);
                      return renderRowPanel(
                        rowKey,
                        modifier.label,
                        modifierRows,
                        true,
                        undefined,
                        `${scriptKey}-${modifier.key}`
                      );
                    })
                    .filter(Boolean);
                  return (
                    <div key={scriptKey} className="script-row-group">
                      <div className="script-row-header">
                        <h3>{scriptLabel}</h3>
                      </div>
                      <div className="row-panel-grid">
                        {scriptPanel}
                        {scriptModifierPanels}
                        {!scriptPanel && !scriptModifierPanels.length && (
                          <p className="empty-state small">
                            Turn on {scriptLabel} above to configure rows.
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {selectionTab === "shapes" && (
              <div className="shape-selection-card">
                {(() => {
                  const strokeKeys = STROKE_SECTION_KEYS.filter((key) =>
                    getCharacterOptionActive(kanaOptionMap[key] || { key })
                  );
                  if (!strokeKeys.length) {
                    return (
                      <p className="empty-state">
                        Turn on Hiragana or Katakana to pick stroke groups.
                      </p>
                    );
                  }
                  return strokeKeys.map((scriptKey) => {
                    const groups = getStrokeGroupsForKana(scriptKey);
                    const allActive = areAllShapesEnabled(customSelections.shapes, scriptKey);
                    const label = kanaOptionMap[scriptKey]?.label || scriptKey;
                    return (
                      <div key={scriptKey} className="row-section">
                        <div className="row-section-header">
                          <h3>{label}</h3>
                          <button
                            type="button"
                            className="toggle-all"
                            onClick={() => handleToggleAllShapes(scriptKey, !allActive)}
                          >
                            {allActive ? "Clear All" : "Select All"}
                          </button>
                        </div>
                        <div className="shape-toggle-grid">
                          {groups.map((group) => {
                            const active = customSelections.shapes[scriptKey]?.[group];
                            return (
                              <button
                                key={`${scriptKey}-shape-${group}`}
                                type="button"
                                className={`shape-toggle ${active ? "active" : ""}`}
                                onClick={() => handleShapeToggle(scriptKey, group)}
                              >
                                Group {group}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            )}

            {selectionTab === "accuracy" && (
              <div className="accuracy-selection-card">
                {(() => {
                  const activeOptions = PATH_MODIFIER_OPTIONS.filter((option) =>
                    getCharacterOptionActive(option)
                  );
                  if (!activeOptions.length) {
                    return (
                      <p className="empty-state">
                        Enable a kana group above to set accuracy targets.
                      </p>
                    );
                  }
                  return activeOptions.map((option) => {
                    const sliderValue = getAccuracyValue(option.key);
                    return (
                      <div key={option.key} className="accuracy-section">
                        <div className="accuracy-header">
                          <h3>{option.label}</h3>
                          <span>{sliderValue}%</span>
                        </div>
                        <input
                          type="range"
                          min="50"
                          max="100"
                          value={sliderValue}
                          onChange={(event) =>
                            handleAccuracyChange(option.key, Number(event.target.value))
                          }
                        />
                      </div>
                    );
                  });
                })()}
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
          Start Round
        </Link>
      </div>
    </main>
  );
};

export default Setup;

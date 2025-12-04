import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/pages/customSetup.scss";
import { useSettings } from "../../contexts/gameStateContext";
import {
  DEFAULT_LEVEL,
  getScriptLevelFromFilters,
  PROGRESSION_MODES,
  getShapeGroupOptionsForFilters,
  describeLevel,
  normalizeLevel,
  SCRIPT_LABELS,
  SHUFFLE_MODES,
} from "../../core/levelUtils";
import AppHeader from "../../components/appHeader";
import SelectByRow from "./components/selectByRow";
import SelectByStroke from "./components/selectByStroke";
import SelectByAccuracy from "./components/selectByAccuracy";
import Button from "../../components/button";
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
  getDefaultCustomSelections,
} from "../../core/customSelections";
import {
  getRowsForKana,
  getStrokeGroupsForKana,
  STROKE_SECTION_KEYS,
} from "../../data/kanaGroups";
import { defaultState } from "../../core/state";

const CustomSetup = () => {
  const { filters, setFilters, options, setOptions } = useSettings();
  const navigate = useNavigate();
  const rowRange = useMemo(
    () => options.rowRange || { start: options.rowLevel || 1, end: options.rowLevel || 1 },
    [options.rowRange, options.rowLevel]
  );
  const shapeGroup = options.shapeGroup || 1;
  const accuracyThreshold = Number.isFinite(options.accuracyThreshold)
    ? options.accuracyThreshold
    : DEFAULT_LEVEL.accuracyThreshold;

  const scriptLevel = getScriptLevelFromFilters(filters.characterTypes);

  const availableShapeGroups = useMemo(
    () => getShapeGroupOptionsForFilters(filters.characterTypes),
    [filters.characterTypes]
  );

  const customLevel = useMemo(
    () =>
      normalizeLevel({
        mode: PROGRESSION_MODES.LINEAR,
        rowStart: rowRange.start,
        rowEnd: rowRange.end,
        scriptLevel,
        shapeGroup,
        accuracyThreshold,
      }),
    [rowRange, scriptLevel, shapeGroup, accuracyThreshold]
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

  const hasActiveRows = (rowsState, panelKey) => {
    const panel = rowsState[panelKey] || {};
    return Object.values(panel).some(Boolean);
  };

  const parsePanelKey = (panelKey) => {
    if (!panelKey) return {};
    const [scriptKey, modifierKey] = panelKey.split("-");
    return { scriptKey, modifierKey };
  };

  const syncFiltersForPanel = (panelKey, rowsState) => {
    const { scriptKey, modifierKey } = parsePanelKey(panelKey);
    if (!scriptKey) return;
    const hasRows = hasActiveRows(rowsState, panelKey);
    setFilters((prev) => {
      if (modifierKey) {
        return {
          ...prev,
          modifierGroup: {
            ...prev.modifierGroup,
            [modifierKey]: hasRows,
          },
        };
      }
      const nextCharacterTypes = {
        ...prev.characterTypes,
        [scriptKey]: hasRows,
      };
      if (!nextCharacterTypes.hiragana && !nextCharacterTypes.katakana) {
        nextCharacterTypes[scriptKey] = true;
      }
      updateShapeGroupFromTypes(nextCharacterTypes);
      return {
        ...prev,
        characterTypes: nextCharacterTypes,
      };
    });
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

  const handleRowToggle = (panelKey, rowValue) => {
    updateCustomSelections((prevSelections) => {
      const nextRows = toggleRowSelection(prevSelections.rows, panelKey, rowValue);
      syncFiltersForPanel(panelKey, nextRows);
      return {
        ...prevSelections,
        rows: nextRows,
      };
    });
  };

  const handleToggleAllRows = (panelKey, enable) => {
    updateCustomSelections((prevSelections) => {
      const nextRows = toggleAllRowsSelection(prevSelections.rows, panelKey, enable);
      syncFiltersForPanel(panelKey, nextRows);
      return {
        ...prevSelections,
        rows: nextRows,
      };
    });
  };

  const handleScriptToggle = (scriptKey) => {
    const modifierKeys = ["dakuten", "handakuten"].map((modifier) =>
      getScriptModifierKey(scriptKey, modifier)
    );
    const panelKeys = [scriptKey, ...modifierKeys].filter((panelKey) => {
      const rows = getRowsForKana(panelKey);
      return rows.length > 0;
    });
    if (!panelKeys.length) return;
    const allActive = panelKeys.every((panelKey) =>
      areAllRowsEnabled(customSelections.rows, panelKey)
    );
    const shouldEnable = !allActive;
    panelKeys.forEach((panelKey) => handleToggleAllRows(panelKey, shouldEnable));
  };

  const handleScriptToggleShapes = (scriptKey) => {
    const modifierKeys = ["dakuten", "handakuten"].map((modifier) =>
      getScriptModifierKey(scriptKey, modifier)
    );
    const panelKeys = [scriptKey, ...modifierKeys].filter((panelKey) => {
      const groups = getStrokeGroupsForKana(panelKey);
      return groups.length > 0;
    });
    if (!panelKeys.length) return;
    const allActive = panelKeys.every((panelKey) =>
      areAllShapesEnabled(customSelections.shapes, panelKey)
    );
    const shouldEnable = !allActive;
    panelKeys.forEach((panelKey) => handleToggleAllShapes(panelKey, shouldEnable));
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

  const handleSelectAll = () => {
    if (selectionTab === "rows") {
      const allRowsOn = Object.values(customSelections.rows).every((panel) =>
        Object.values(panel || {}).every(Boolean)
      );
      const shouldEnable = !allRowsOn;

      setFilters((prev) => ({
        ...prev,
        characterTypes: {
          ...prev.characterTypes,
          hiragana: shouldEnable,
          katakana: shouldEnable,
        },
        modifierGroup: {
          ...prev.modifierGroup,
          dakuten: shouldEnable,
          handakuten: shouldEnable,
        },
      }));

      updateCustomSelections((prevSelections) => {
        const nextRows = {};
        Object.keys(prevSelections.rows).forEach((key) => {
          const rows = getRowsForKana(key);
          nextRows[key] = rows.reduce((acc, row) => {
            acc[row.value] = shouldEnable;
            return acc;
          }, {});
        });
        return {
          ...prevSelections,
          rows: nextRows,
        };
      });
    } else if (selectionTab === "shapes") {
      const allShapesOn = Object.values(customSelections.shapes).every((panel) =>
        Object.values(panel || {}).every(Boolean)
      );
      const shouldEnable = !allShapesOn;

      updateCustomSelections((prevSelections) => {
        const nextShapes = {};
        Object.keys(prevSelections.shapes).forEach((key) => {
          nextShapes[key] = Object.keys(prevSelections.shapes[key] || {}).reduce(
            (shapeAcc, groupKey) => {
              shapeAcc[groupKey] = shouldEnable;
              return shapeAcc;
            },
            {}
          );
        });
        return {
          ...prevSelections,
          shapes: nextShapes,
        };
      });
    } else if (selectionTab === "accuracy") {
      // Accuracy tab: Toggle all row groups on/off, keep accuracy values
      const allRowsOn = Object.values(customSelections.rows).every((panel) =>
        Object.values(panel || {}).every(Boolean)
      );
      const shouldEnable = !allRowsOn;

      setFilters((prev) => ({
        ...prev,
        characterTypes: {
          ...prev.characterTypes,
          hiragana: shouldEnable,
          katakana: shouldEnable,
        },
        modifierGroup: {
          ...prev.modifierGroup,
          dakuten: shouldEnable,
          handakuten: shouldEnable,
        },
      }));

      updateCustomSelections((prevSelections) => {
        const nextRows = {};
        Object.keys(prevSelections.rows).forEach((key) => {
          const rows = getRowsForKana(key);
          nextRows[key] = rows.reduce((acc, row) => {
            acc[row.value] = shouldEnable;
            return acc;
          }, {});
        });
        return {
          ...prevSelections,
          rows: nextRows,
        };
      });
    }
  };

  const [selectionTab, setSelectionTab] = useState("rows");

  const totalSelectedRows = useMemo(
    () =>
      Object.values(customSelections.rows).reduce((sum, panel) => {
        const values = Object.values(panel || {});
        const activeCount = values.reduce(
          (count, value) => count + (value ? 1 : 0),
          0
        );
        return sum + activeCount;
      }, 0),
    [customSelections.rows]
  );

  const getAllowedShuffleModes = (tab, rowCount) => {
    if (tab === "shapes" || tab === "accuracy") {
      return [SHUFFLE_MODES.NONE, SHUFFLE_MODES.BOTH];
    }
    if (rowCount <= 1) {
      return [SHUFFLE_MODES.NONE, SHUFFLE_MODES.HORIZONTAL];
    }
    return [
      SHUFFLE_MODES.NONE,
      SHUFFLE_MODES.HORIZONTAL,
      SHUFFLE_MODES.VERTICAL,
      SHUFFLE_MODES.BOTH,
    ];
  };

  const allowedShuffleModes = useMemo(
    () => getAllowedShuffleModes(selectionTab, totalSelectedRows),
    [selectionTab, totalSelectedRows]
  );

  const rawShuffleMode = options.shuffleMode || SHUFFLE_MODES.NONE;
  const effectiveShuffleMode = allowedShuffleModes.includes(rawShuffleMode)
    ? rawShuffleMode
    : allowedShuffleModes[0];

  useEffect(() => {
    if (rawShuffleMode !== effectiveShuffleMode) {
      setOptions((prev) => ({
        ...prev,
        shuffleMode: effectiveShuffleMode,
      }));
    }
  }, [rawShuffleMode, effectiveShuffleMode, setOptions]);

  const handleShuffleChange = (mode) => {
    if (!allowedShuffleModes.includes(mode)) return;
    setOptions((prev) => ({
      ...prev,
      shuffleMode: mode,
    }));
  };

  const hasAnyRowSelected = useMemo(
    () => totalSelectedRows > 0,
    [totalSelectedRows]
  );

  const summaryScriptLabel = useMemo(() => {
    const panelKeysForScript = (scriptKey) => {
      if (selectionTab === "rows" || selectionTab === "accuracy") {
        const baseKeys = [scriptKey];
        const modifierKeys = ["dakuten", "handakuten"].map((modifier) =>
          getScriptModifierKey(scriptKey, modifier)
        );
        return [...baseKeys, ...modifierKeys];
      }
      if (selectionTab === "shapes") {
        const baseKeys = [scriptKey];
        const modifierKeys = ["dakuten", "handakuten"].map(
          (modifier) => `${scriptKey}-${modifier}`
        );
        return [...baseKeys, ...modifierKeys];
      }
      return [scriptKey];
    };

    const scriptHasSelection = (scriptKey) => {
      if (selectionTab === "shapes") {
        return panelKeysForScript(scriptKey).some((key) =>
          Object.values(customSelections.shapes[key] || {}).some(Boolean)
        );
      }
      // rows + accuracy share the same row state
      return panelKeysForScript(scriptKey).some((key) =>
        Object.values(customSelections.rows[key] || {}).some(Boolean)
      );
    };

    const hasHiragana = scriptHasSelection("hiragana");
    const hasKatakana = scriptHasSelection("katakana");

    if (hasHiragana && hasKatakana) return SCRIPT_LABELS.both;
    if (hasHiragana) return SCRIPT_LABELS.hiragana;
    if (hasKatakana) return SCRIPT_LABELS.katakana;
    return "—";
  }, [selectionTab, customSelections.rows, customSelections.shapes]);

  const summaryGroupingLabel = useMemo(() => {
    const countTruthyValues = (record) =>
      Object.values(record || {}).reduce(
        (sum, value) => sum + (value ? 1 : 0),
        0
      );

    if (selectionTab === "shapes") {
      const totalGroups = Object.values(customSelections.shapes).reduce(
        (sum, panel) => sum + countTruthyValues(panel),
        0
      );
      return `${totalGroups} stroke groups`;
    }

    // rows + accuracy: count selected rows
    const totalRows = Object.values(customSelections.rows).reduce(
      (sum, panel) => sum + countTruthyValues(panel),
      0
    );
    return `${totalRows} rows`;
  }, [selectionTab, customSelections.rows, customSelections.shapes]);

  const summaryShuffleLabel = useMemo(() => {
    switch (effectiveShuffleMode) {
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
  }, [effectiveShuffleMode]);

  const handleResetForm = () => {
    if (selectionTab === "rows") {
      // Rows tab: only base Hiragana rows selected
      setFilters((prev) => ({
        ...prev,
        characterTypes: {
          ...prev.characterTypes,
          hiragana: true,
          katakana: false,
        },
        modifierGroup: {
          ...prev.modifierGroup,
          dakuten: false,
          handakuten: false,
        },
      }));
      updateCustomSelections((prevSelections) => {
        const nextRows = {};
        Object.keys(prevSelections.rows).forEach((key) => {
          const rows = getRowsForKana(key);
          nextRows[key] = rows.reduce((acc, row) => {
            acc[row.value] = key === "hiragana";
            return acc;
          }, {});
        });
        return {
          ...prevSelections,
          rows: nextRows,
        };
      });
    } else if (selectionTab === "shapes") {
      // Stroke tab: only Hiragana stroke group 1 selected
      setFilters((prev) => ({
        ...prev,
        characterTypes: {
          ...prev.characterTypes,
          hiragana: true,
          katakana: false,
        },
        modifierGroup: {
          ...prev.modifierGroup,
          dakuten: false,
          handakuten: false,
        },
      }));
      updateCustomSelections((prevSelections) => {
        const nextShapes = {};
        Object.keys(prevSelections.shapes).forEach((key) => {
          const groups = getStrokeGroupsForKana(key);
          nextShapes[key] = groups.reduce((acc, group) => {
            acc[group] = key === "hiragana" && group === 1;
            return acc;
          }, {});
        });
        return {
          ...prevSelections,
          shapes: nextShapes,
        };
      });
    } else if (selectionTab === "accuracy") {
      // Accuracy tab: only Hiragana base group active, all targets 80%
      setFilters((prev) => ({
        ...prev,
        characterTypes: {
          ...prev.characterTypes,
          hiragana: true,
          katakana: false,
        },
        modifierGroup: {
          ...prev.modifierGroup,
          dakuten: false,
          handakuten: false,
        },
      }));
      updateCustomSelections((prevSelections) => {
        const nextRows = {};
        Object.keys(prevSelections.rows).forEach((key) => {
          const rows = getRowsForKana(key);
          nextRows[key] = rows.reduce((acc, row) => {
            acc[row.value] = key === "hiragana";
            return acc;
          }, {});
        });
        const nextTargets = {};
        Object.keys(prevSelections.accuracyTargets || {}).forEach((key) => {
          nextTargets[key] = 80;
        });
        return {
          ...prevSelections,
          rows: nextRows,
          accuracyTargets: nextTargets,
        };
      });
      setOptions((prev) => ({
        ...prev,
        accuracyThreshold: 0.8,
      }));
    }
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

  return (
    <main className="gutter-container setup">
      <AppHeader />
      <header className="setup-header">
        <h1>Customize Your Session</h1>
      </header>

      <section className="setup-summary">
        <span className="setup-badge">Current Plan</span>
        <p className="setup-summary-main">
          {summaryGroupingLabel} | {summaryScriptLabel} | {summaryShuffleLabel}
        </p>
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
          </div>
        </section>

        <section className="control-card grouping-card full-width-card">
          <div className="selection-actions">
            <button type="button" onClick={handleSelectAll}>
              Toggle All
            </button>
            <button type="button" onClick={handleResetForm}>
              Reset All
            </button>
          </div>
          <p className="control-caption">
            Toggle kana groups, then fine-tune what should be available in the round.
          </p>
          <div className="grouping-content">
            {selectionTab === "rows" && (
              <SelectByRow
                scriptKeys={scriptKeys}
                kanaOptionMap={kanaOptionMap}
                modifierOptions={modifierOptions}
                customSelections={customSelections}
                getScriptModifierKey={getScriptModifierKey}
                getRowsForKana={getRowsForKana}
                getCharacterOptionActive={getCharacterOptionActive}
                handleScriptToggle={handleScriptToggle}
                handleRowToggle={handleRowToggle}
                handleToggleAllRows={handleToggleAllRows}
                areAllRowsEnabled={areAllRowsEnabled}
              />
            )}
            {selectionTab === "shapes" && (
              <SelectByStroke
                scriptKeys={scriptKeys}
                kanaOptionMap={kanaOptionMap}
                modifierOptions={modifierOptions}
                customSelections={customSelections}
                getStrokeGroupsForKana={getStrokeGroupsForKana}
                getScriptModifierKey={getScriptModifierKey}
                getCharacterOptionActive={getCharacterOptionActive}
                areAllShapesEnabled={areAllShapesEnabled}
                handleScriptToggleShapes={handleScriptToggleShapes}
                handleToggleAllShapes={handleToggleAllShapes}
                handleShapeToggle={handleShapeToggle}
              />
            )}
            {selectionTab === "accuracy" && (
              <SelectByAccuracy
                scriptKeys={scriptKeys}
                kanaOptionMap={kanaOptionMap}
                customSelections={customSelections}
                modifierOptions={modifierOptions}
                getScriptModifierKey={getScriptModifierKey}
                getCharacterOptionActive={getCharacterOptionActive}
                getAccuracyValue={getAccuracyValue}
                handleAccuracyChange={handleAccuracyChange}
                handleCharacterOptionToggle={handleCharacterOptionToggle}
                handleToggleAllRows={handleToggleAllRows}
              />
            )}
          </div>
        </section>

        <section className="control-card full-width-card">
          <div className="control-card-header">
            <h2>Shuffle</h2>
            <p>
              Choose how kana are shuffled in the grid.
            </p>
          </div>
          <div className="shuffle-row">
            <div className="shuffle-glyphs">
              <button
                type="button"
                aria-label="No shuffle"
                className={`shuffle-glyph ${
                  effectiveShuffleMode === SHUFFLE_MODES.NONE ? "active" : ""
                } ${
                  allowedShuffleModes.includes(SHUFFLE_MODES.NONE)
                    ? ""
                    : "disabled"
                }`}
                onClick={() => handleShuffleChange(SHUFFLE_MODES.NONE)}
              >
                —
              </button>
              <button
                type="button"
                aria-label="Horizontal shuffle"
                className={`shuffle-glyph ${
                  effectiveShuffleMode === SHUFFLE_MODES.HORIZONTAL
                    ? "active"
                    : ""
                } ${
                  allowedShuffleModes.includes(SHUFFLE_MODES.HORIZONTAL)
                    ? ""
                    : "disabled"
                }`}
                onClick={() => handleShuffleChange(SHUFFLE_MODES.HORIZONTAL)}
              >
                ↔
              </button>
              <button
                type="button"
                aria-label="Vertical shuffle"
                className={`shuffle-glyph ${
                  effectiveShuffleMode === SHUFFLE_MODES.VERTICAL
                    ? "active"
                    : ""
                } ${
                  allowedShuffleModes.includes(SHUFFLE_MODES.VERTICAL)
                    ? ""
                    : "disabled"
                }`}
                onClick={() => handleShuffleChange(SHUFFLE_MODES.VERTICAL)}
              >
                ↕
              </button>
              <button
                type="button"
                aria-label="Horizontal and vertical shuffle"
                className={`shuffle-glyph ${
                  effectiveShuffleMode === SHUFFLE_MODES.BOTH ? "active" : ""
                } ${
                  allowedShuffleModes.includes(SHUFFLE_MODES.BOTH)
                    ? ""
                    : "disabled"
                }`}
                onClick={() => handleShuffleChange(SHUFFLE_MODES.BOTH)}
              >
                ↕↔
              </button>
            </div>
          </div>
        </section>

      </div>

      <div className="setup-actions">
        <Button
          className="setup-start"
          onClick={() => navigate("/game")}
          disabled={!hasAnyRowSelected}
        >
          Start Round
        </Button>
        {!hasAnyRowSelected && (
          <p className="setup-warning">
            Select at least one row to start a round.
          </p>
        )}
      </div>
    </main>
  );
};

export default CustomSetup;

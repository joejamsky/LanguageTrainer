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
import AppHeader from "../Components/AppHeader";
import SelectByRow from "../Components/SelectByRow";
import SelectByStroke from "../Components/SelectByStroke";
import SelectByAccuracy from "../Components/SelectByAccuracy";
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
    [options.rowRange, options.rowLevel]
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

  const handleSelectAll = () => {
    setFilters((prev) => ({
      ...prev,
      characterTypes: {
        ...prev.characterTypes,
        hiragana: true,
        katakana: true,
      },
      modifierGroup: {
        ...prev.modifierGroup,
        dakuten: true,
        handakuten: true,
      },
    }));
    updateCustomSelections((prevSelections) => {
      const nextRows = {};
      Object.keys(prevSelections.rows).forEach((key) => {
        const rows = getRowsForKana(key);
        nextRows[key] = rows.reduce((acc, row) => {
          acc[row.value] = true;
          return acc;
        }, {});
      });
      const nextShapes = {};
      Object.keys(prevSelections.shapes).forEach((key) => {
        nextShapes[key] = Object.keys(prevSelections.shapes[key] || {}).reduce(
          (shapeAcc, groupKey) => {
            shapeAcc[groupKey] = true;
            return shapeAcc;
          },
          {}
        );
      });
      return {
        ...prevSelections,
        rows: nextRows,
        shapes: nextShapes,
      };
    });
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

  return (
    <main className="gutter-container setup">
      <AppHeader />
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
              <button type="button" onClick={handleSelectAll}>
                Select All
              </button>
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
                isAnyRowsSelected={isAnyRowsSelected}
                handleCharacterOptionToggle={handleCharacterOptionToggle}
                handleScriptModifierToggle={handleScriptModifierToggle}
                handleRowToggle={handleRowToggle}
                handleToggleAllRows={handleToggleAllRows}
                areAllRowsEnabled={areAllRowsEnabled}
              />
            )}
            {selectionTab === "shapes" && (
              <SelectByStroke
                strokeKeys={STROKE_SECTION_KEYS}
                kanaOptionMap={kanaOptionMap}
                customSelections={customSelections}
                getCharacterOptionActive={getCharacterOptionActive}
                getStrokeGroupsForKana={getStrokeGroupsForKana}
                areAllShapesEnabled={areAllShapesEnabled}
                handleToggleAllShapes={handleToggleAllShapes}
                handleShapeToggle={handleShapeToggle}
                handleCharacterOptionToggle={handleCharacterOptionToggle}
              />
            )}
            {selectionTab === "accuracy" && (
              <SelectByAccuracy
                scriptKeys={scriptKeys}
                modifierOptions={modifierOptions}
                kanaOptionMap={kanaOptionMap}
                customSelections={customSelections}
                getScriptModifierKey={getScriptModifierKey}
                getCharacterOptionActive={getCharacterOptionActive}
                getAccuracyValue={getAccuracyValue}
                handleAccuracyChange={handleAccuracyChange}
                handleCharacterOptionToggle={handleCharacterOptionToggle}
                handleScriptModifierToggle={handleScriptModifierToggle}
                isAnyRowsSelected={isAnyRowsSelected}
                handleToggleAllRows={handleToggleAllRows}
              />
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

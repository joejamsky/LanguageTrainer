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
} from "../Misc/levelUtils";

const clampRowLevelIndex = (rowLevel) => {
  const idx = Math.max(0, Math.min(rowLevel - 1, ROW_TIERS.length - 1));
  return ROW_TIERS[idx];
};

const normalizeLevelSelection = (level = DEFAULT_LEVEL) => {
  const safeRow = Number.isFinite(level?.rowLevel) ? level.rowLevel : DEFAULT_LEVEL.rowLevel;
  const safeScript = Number.isFinite(level?.scriptLevel)
    ? level.scriptLevel
    : DEFAULT_LEVEL.scriptLevel;
  const safeShuffle = clampShuffleLevelForRow(
    safeRow,
    Number.isFinite(level?.shuffleLevel) ? level.shuffleLevel : DEFAULT_LEVEL.shuffleLevel
  );
  return {
    rowLevel: safeRow,
    scriptLevel: safeScript,
    shuffleLevel: safeShuffle,
  };
};

const Setup = () => {
  const { filters, setFilters, options, setOptions } = useGameState();
  const rowLevel = options.rowLevel || 1;
  const scriptLevel = getScriptLevelFromFilters(filters.characterTypes);
  const shuffleLevel = clampShuffleLevelForRow(rowLevel, getShuffleLevelFromSorting(options.sorting));
  const [lastLevel, setLastLevel] = useState(() => readStoredLevel());

  const rowSummary = useMemo(() => {
    return ROW_TIERS.filter((tier) => tier.value <= rowLevel)
      .map((tier) => tier.caption)
      .join(" • ");
  }, [rowLevel]);

  const guidedCourseLevel = useMemo(() => normalizeLevelSelection(lastLevel), [lastLevel]);

  const activeRowNode = clampRowLevelIndex(rowLevel);
  const activeScriptKey = LEVEL_TO_SCRIPT[scriptLevel];
  const activeScriptNode = useMemo(
    () => SCRIPT_NODES.find((node) => node.value === activeScriptKey),
    [activeScriptKey]
  );
  const activeShuffleNode = useMemo(
    () => SHUFFLE_NODES.find((node) => node.value === shuffleLevel) || SHUFFLE_NODES[0],
    [shuffleLevel]
  );

  const modifierActiveKeys = Object.entries(filters.modifierGroup)
    .filter(([, isOn]) => isOn)
    .map(([key]) => key);

  const handleRowSelect = (value) => {
    setOptions((prev) => ({
      ...prev,
      rowLevel: value,
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

  const handleRowSliderChange = (event) => {
    handleRowSelect(Number(event.target.value));
  };

  const handleScriptSliderChange = (event) => {
    const value = Number(event.target.value);
    const nextKey = LEVEL_TO_SCRIPT[value];
    if (nextKey) {
      handleScriptSelect(nextKey);
    }
  };

  const handleShuffleSliderChange = (event) => {
    const value = Number(event.target.value);
    const clampedValue = clampShuffleLevelForRow(rowLevel, value);
    const node = SHUFFLE_NODES.find((option) => option.value === clampedValue);
    if (node) {
      handleShuffleSelect(node);
    }
  };

  const applyGuidedLevel = (level = DEFAULT_LEVEL) => {
    const normalized = normalizeLevelSelection(level);
    const targetScriptKey =
      LEVEL_TO_SCRIPT[normalized.scriptLevel] || LEVEL_TO_SCRIPT[DEFAULT_LEVEL.scriptLevel];
    const targetShuffleNode =
      getShuffleNodeByValue(normalized.shuffleLevel) ||
      getShuffleNodeByValue(DEFAULT_LEVEL.shuffleLevel);

    handleRowSelect(normalized.rowLevel);
    handleScriptSelect(targetScriptKey);
    handleShuffleSelect(targetShuffleNode);
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

  return (
    <main className="setup">
      <div className="setup-content">
        <h1 className="setup-title">Choose Your Path</h1>

        <div className="auto-mode-card">
          <h4>Guidead Course</h4>
          <div className="auto-mode-copy">
            <p>
              Master kana step by step on a structured journey.
              Each stage introduces new characters while reinforcing what you’ve already learned, 
              steadily building recognition, speed, and confidence. 
              Progress through guided lessons that unlock new rows, shuffle patterns, 
              and mixed modes as your skill grows.
            </p>
          </div>
          <div className="auto-mode-copy">
            <p className="auto-mode-description">
              Current checkpoint:{" "}
              <strong>
                Level {guidedCourseLevel.rowLevel}-{guidedCourseLevel.scriptLevel}-
                {guidedCourseLevel.shuffleLevel}
              </strong>
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
          </div>
        </div>



        <div className="auto-mode-card">
          <h4>Custom Course</h4>
          <div className="auto-mode-copy">
            <p>Pick your own mix of rows, scripts, and shuffle rules for a practice mix you control.</p>
          </div>

          <div className="level-summary">
            <span className="level-badge">Level {`${rowLevel}-${scriptLevel}-${shuffleLevel}`}</span>
            <p className="level-details">
              Rows: {rowSummary || ROW_TIERS[0].caption} | Script:{" "}
              {activeScriptNode ? activeScriptNode.title : activeScriptKey} | Shuffle: {activeShuffleNode.title}
            </p>
          </div>

          <div className="slider-board">
            <section className="slider-block">
              <header className="slider-header">
                <h2>Row Depth</h2>
                <p>Select how many kana rows you want to study.</p>
              </header>
              <div className="slider-control">
                <input
                  type="range"
                  min="1"
                  max={ROW_TIERS.length}
                  step="1"
                  value={rowLevel}
                  onChange={handleRowSliderChange}
                />
                <div className="slider-value">
                  <span className="slider-title">{activeRowNode.title}</span>
                  <span className="slider-caption">{activeRowNode.caption}</span>
                </div>
              </div>

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
                <h2>Script Focus</h2>
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
                <h2>Shuffle Mode</h2>
                <p>Dial in how the tiles should mix.</p>
              </header>
              <div className="slider-control">
                <input
                  type="range"
                  min="0"
                  max={getMaxShuffleLevelForRow(rowLevel)}
                  step="1"
                  value={shuffleLevel}
                  onChange={handleShuffleSliderChange}
                />
                <div className="slider-value">
                  <span className="slider-title">{activeShuffleNode.title}</span>
                  <span className="slider-caption">{activeShuffleNode.caption}</span>
                </div>
              </div>
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

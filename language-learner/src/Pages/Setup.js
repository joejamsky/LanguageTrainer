import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import "../Styles/Setup.scss";
import { useGameState } from "../Contexts/GameStateContext";
import {
  ROW_TIERS,
  ROW_MODIFIERS,
  SCRIPT_NODES,
  SHUFFLE_NODES,
  SCRIPT_TO_LEVEL,
  LEVEL_TO_SCRIPT,
} from "../Data/skillTreeConfig";

const getScriptLevelFromFilters = (characterTypes) => {
  if (characterTypes.hiragana && characterTypes.katakana) return SCRIPT_TO_LEVEL.both;
  if (characterTypes.katakana) return SCRIPT_TO_LEVEL.katakana;
  return SCRIPT_TO_LEVEL.hiragana;
};

const getShuffleLevel = (sorting) => {
  if (typeof sorting.shuffleLevel === "number") return sorting.shuffleLevel;
  if (sorting.rowShuffle && sorting.columnShuffle) return 2;
  if (sorting.rowShuffle) return 1;
  return 0;
};

const clampRowLevelIndex = (rowLevel) => {
  const idx = Math.max(0, Math.min(rowLevel - 1, ROW_TIERS.length - 1));
  return ROW_TIERS[idx];
};

const Setup = () => {
  const { filters, setFilters, options, setOptions } = useGameState();
  const rowLevel = options.rowLevel || 1;
  const scriptLevel = getScriptLevelFromFilters(filters.characterTypes);
  const shuffleLevel = getShuffleLevel(options.sorting);

  const rowSummary = useMemo(() => {
    return ROW_TIERS.filter((tier) => tier.value <= rowLevel)
      .map((tier) => tier.caption)
      .join(" • ");
  }, [rowLevel]);

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
    const node = SHUFFLE_NODES.find((option) => option.value === value);
    if (node) {
      handleShuffleSelect(node);
    }
  };

  return (
    <main className="setup">
      <div className="setup-content">
        <h1 className="setup-title">Choose Your Level</h1>
        <p className="setup-subtitle">
          Pick the challenge that fits you best. We&apos;ll tailor the practice round once you decide.
        </p>

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
                max={SHUFFLE_NODES.length - 1}
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
            Continue
          </Link>
        </div>
      </div>
    </main>
  );
};

export default Setup;

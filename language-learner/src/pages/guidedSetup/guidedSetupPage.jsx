import React, { useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "../../styles/pages/guidedSetup.scss";
import AppHeader from "../../components/appHeader";
import Button from "../../components/button";
import {
  PROGRESSION_MODES,
  SHUFFLE_MODES,
  SCRIPT_LABELS,
  getShapeGroupListForScriptKey,
  getAccuracyThresholds,
} from "../../core/levelUtils";
import { getShuffleDisplay } from "../../core/shuffle";
import { TOTAL_ROWS } from "../../contexts/utils/constants";

const GUIDED_SCRIPT_OPTIONS = [
  {
    key: "hiragana",
    title: "Hiragana Path",
    caption: "Drill Rows ",
    scriptLabel: SCRIPT_LABELS.hiragana,
  },
  {
    key: "katakana",
    title: "Katakana Path",
    caption: "Drill Rows ",
    scriptLabel: SCRIPT_LABELS.katakana,
  },
  {
    key: "both",
    title: "Combined Path",
    caption: "Drill Rows ",
    scriptLabel: SCRIPT_LABELS.both,
  },
];

const GUIDED_MODE_PATHS = [
  {
    key: "linear",
    title: "Linear",
    caption: "Single rows in order",
  },
  {
    key: "range",
    title: "Range",
    caption: "Sliding row windows",
  },
  {
    key: "shapes",
    title: "Stroke Groups",
    caption: "Drill by shape similarity",
  },
  {
    key: "adaptive",
    title: "Accuracy",
    caption: "Levels by accuracy % target",
  },
];

const buildRangeWindows = () => {
  const windows = [];
  const sizes = [2, 4, 6, 8, 10].filter((size) => size <= TOTAL_ROWS);
  sizes.forEach((size) => {
    const maxStart = TOTAL_ROWS - size + 1;
    for (let start = 1; start <= maxStart; start += 1) {
      const end = start + size - 1;
      windows.push({ start, end });
    }
  });
  return windows;
};

const RANGE_WINDOWS = buildRangeWindows();
const ACCURACY_LEVELS = getAccuracyThresholds();

const GuidedPathNode = ({
  as = "div",
  className = "",
  label,
  innerRef,
  ...rest
}) => {
  const Element = as;
  return (
    <Element ref={innerRef} className={className} {...rest}>
      <span className="guided-node-ring" />
      <span className="guided-node-index">{label}</span>
    </Element>
  );
};

const GuidedSetup = () => {
  const [scriptSelection, setScriptSelection] = useState(
    () => GUIDED_SCRIPT_OPTIONS[0]?.key || "hiragana"
  );
  const [currentNodeIndexByScript] = useState({
    hiragana: 0,
    katakana: 0,
    both: 0,
  });
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const currentNodeRef = useRef(null);

  const nodesByScript = useMemo(() => {
    const buildNodes = (scriptKey) =>
      Array.from({ length: TOTAL_ROWS }).map((_, index) => ({
        id: `${scriptKey}-row-${index + 1}`,
        label: `Drill ${index + 1}`,
        mode: PROGRESSION_MODES.LINEAR,
        row: index + 1,
      }));
    return {
      hiragana: buildNodes("hiragana"),
      katakana: buildNodes("katakana"),
      both: buildNodes("both"),
    };
  }, []);

  const scriptNodes = useMemo(
    () => nodesByScript[scriptSelection] || [],
    [nodesByScript, scriptSelection]
  );
  const currentNodeIndex = currentNodeIndexByScript[scriptSelection] ?? 0;
  const safeCurrentIndex =
    currentNodeIndex >= 0 && currentNodeIndex < scriptNodes.length
      ? currentNodeIndex
      : 0;
  const currentNode = scriptNodes[safeCurrentIndex] || null;

  const effectiveSelectedNodeId =
    selectedNodeId && scriptNodes.some((node) => node.id === selectedNodeId)
      ? selectedNodeId
      : currentNode?.id || null;

  const selectedNode =
    scriptNodes.find((node) => node.id === effectiveSelectedNodeId) || currentNode;

  const buildCurrentCheckpointForScript = (scriptKey) => {
    const nodes = nodesByScript[scriptKey] || [];
    if (!nodes.length) return null;
    const index = currentNodeIndexByScript[scriptKey] ?? 0;
    const safeIndex = index >= 0 && index < nodes.length ? index : 0;
    const node = nodes[safeIndex];
    const shuffleMode = SHUFFLE_MODES.NONE;
    const { label: shuffleLabel, icon: shuffleIcon } = getShuffleDisplay(shuffleMode);
    return {
      id: `${node.id}-${shuffleMode}`,
      mode: "Linear",
      rowLabel: `Row ${node.row}`,
      shuffleLabel,
      shuffleIcon,
    };
  };

  const checkpointsByScript = useMemo(
    () => ({
      hiragana: buildCurrentCheckpointForScript("hiragana"),
      katakana: buildCurrentCheckpointForScript("katakana"),
      both: buildCurrentCheckpointForScript("both"),
    }),
    [
      nodesByScript.both,
      nodesByScript.hiragana,
      nodesByScript.katakana,
      currentNodeIndexByScript.both,
      currentNodeIndexByScript.hiragana,
      currentNodeIndexByScript.katakana,
    ]
  );

  const handleStartGuided = () => {
    
  };

  const handleJumpToStart = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleJumpToCurrent = () => {
    if (currentNodeRef.current) {
      currentNodeRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  return (
    <main className="gutter-container guided-setup">
      <AppHeader />
      <header className="guided-header">
        <h1>Guided Journey</h1>
      </header>

      <section className="guided-tree-bar">
        <div className="guided-tree-toggle">
          {GUIDED_SCRIPT_OPTIONS.map((choice) => (
            <div key={choice.key} className="guided-tree-column">
              <button
                type="button"
                className={`guided-tree-button ${
                  scriptSelection === choice.key ? "active" : ""
                }`}
                onClick={() => setScriptSelection(choice.key)}
              >
                <div className="guided-tree-main">
                  <span className="guided-tree-title">{choice.title}</span>
                </div>
                <span className="guided-tree-caption">{choice.caption}{choice.scriptLabel}</span>
              </button>

              <div className="guided-checkpoint-list">
                <div
                  key={checkpointsByScript[choice.key].id}
                  className="guided-checkpoint-pill"
                >
                  <span className="guided-checkpoint-main">
                    {checkpointsByScript[choice.key].mode} |{" "}
                    {checkpointsByScript[choice.key].rowLabel} |{" "}
                    {checkpointsByScript[choice.key].shuffleIcon}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="guided-layout">
        <div className="guided-jump-column">
          <button
            type="button"
            className="guided-jump-button"
            onClick={handleJumpToStart}
          >
            ↑
          </button>
          <button
            type="button"
            className="guided-jump-button"
            onClick={handleJumpToCurrent}
            disabled={!currentNode}
          >
            ↓
          </button>
        </div>

        <div className="guided-node-column">
          <div className="guided-node-section">
            <h2 className="guided-node-section-title">Linear Path</h2>
            <div className="guided-node-list">
              {scriptNodes.map((node, index) => {
                const isCurrent = index === safeCurrentIndex;
                const isCompleted = index < safeCurrentIndex;
                const isFuture = index > safeCurrentIndex;
                const stateClass = isCurrent
                  ? "guided-node--current"
                  : isCompleted
                  ? "guided-node--completed"
                  : "guided-node--future";
                const isSelected = node.id === effectiveSelectedNodeId;
                const isDisabled = isFuture;

                const className = `guided-node ${stateClass} ${
                  isSelected ? "guided-node--selected" : ""
                }`;
                return (
                  <GuidedPathNode
                    key={node.id}
                    as="button"
                    type="button"
                    innerRef={isCurrent ? currentNodeRef : undefined}
                    className={className}
                    onClick={() => {
                      if (!isDisabled) {
                        setSelectedNodeId(node.id);
                      }
                    }}
                    disabled={isDisabled}
                    label={`Row ${node.row}`}
                  />
                );
              })}
            </div>
          </div>

          {!!RANGE_WINDOWS.length && (
            <div className="guided-node-section">
              <h2 className="guided-node-section-title">Range Path</h2>
              <div className="guided-node-list guided-node-list--secondary">
                {RANGE_WINDOWS.map((window) => (
                  <GuidedPathNode
                    key={`range-${window.start}-${window.end}`}
                    className="guided-node guided-node--future"
                    label={`Rows ${window.start}-${window.end}`}
                  />
                ))}
              </div>
            </div>
          )}

          {(() => {
            const shapeGroupsForScript =
              scriptSelection === "hiragana" || scriptSelection === "katakana"
                ? getShapeGroupListForScriptKey(scriptSelection)
                : (() => {
                    const hira = getShapeGroupListForScriptKey("hiragana");
                    const kata = getShapeGroupListForScriptKey("katakana");
                    const maxValue = Math.max(
                      ...(hira.length ? hira : [0]),
                      ...(kata.length ? kata : [0])
                    );
                    return maxValue > 0
                      ? Array.from({ length: maxValue }).map((_, index) => index + 1)
                      : [];
                  })();

            if (!shapeGroupsForScript.length) return null;

            return (
              <div className="guided-node-section">
                <h2 className="guided-node-section-title">Stroke Group Path</h2>
                <div className="guided-node-list guided-node-list--secondary">
                  {shapeGroupsForScript.map((group) => (
                    <GuidedPathNode
                      key={`stroke-${scriptSelection}-${group}`}
                      className="guided-node guided-node--future"
                      label={`Group ${group}`}
                    />
                  ))}
                </div>
              </div>
            );
          })()}

          {!!ACCURACY_LEVELS.length && (
            <div className="guided-node-section">
              <h2 className="guided-node-section-title">Accuracy Path</h2>
              <div className="guided-node-list guided-node-list--secondary">
                {ACCURACY_LEVELS.map((value) => (
                  <GuidedPathNode
                    key={`accuracy-${value}`}
                    className="guided-node guided-node--future"
                    label={`${Math.round(value * 100)}%`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <div className="guided-actions">
        <Button className="guided-start" onClick={handleStartGuided}>
          Start Guided
        </Button>
      </div>
    </main>
  );
};

export default GuidedSetup;

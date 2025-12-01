import React from "react";
import { getStrokeGroupSampleForKana } from "../../../data/kanaGroups";

const SelectByStroke = ({
  scriptKeys,
  kanaOptionMap,
  modifierOptions,
  customSelections,
  getScriptModifierKey,
  getStrokeGroupsForKana,
  getCharacterOptionActive,
  areAllShapesEnabled,
  handleScriptToggleShapes,
  handleToggleAllShapes,
  handleShapeToggle,
}) => {
  const renderPanel = (panelKey, title) => {
    const groups = getStrokeGroupsForKana(panelKey);
    if (!groups.length) return null;
    const allActive = areAllShapesEnabled(customSelections.shapes, panelKey);
    const hasAnySelected = Object.values(customSelections.shapes[panelKey] || {}).some(Boolean);
    const panelClass = ["row-panel", hasAnySelected ? "" : "disabled"]
      .filter(Boolean)
      .join(" ");
    return (
      <div key={`${panelKey}-panel`} className={panelClass}>
        <div className="row-panel-header">
          <button
            type="button"
            className={`toggle-all ${hasAnySelected ? "active" : ""}`}
            onClick={() => handleToggleAllShapes(panelKey, !allActive)}
          >
            Toggle All {title}
          </button>
        </div>
        <div className="shape-toggle-grid">
          {groups.map((group) => {
            const active = customSelections.shapes[panelKey]?.[group];
            const sample = getStrokeGroupSampleForKana(panelKey, group);
            return (
              <button
                key={`${panelKey}-shape-${group}`}
                type="button"
                className={`shape-toggle ${active ? "active" : ""}`}
                onClick={() => handleShapeToggle(panelKey, group)}
              >
                <span className="shape-toggle-title">
                  Group {group}
                </span>
                {sample && (
                  <span className="shape-toggle-caption">{sample}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const modifierToggles = [
    { key: "dakuten", label: "Dakuten", type: "modifier" },
    { key: "handakuten", label: "Handakuten", type: "modifier" },
  ];

  return (
    <div>
      <div className="script-grid">
        {scriptKeys.map((scriptKey) => {
          const scriptOption = kanaOptionMap[scriptKey];
          const scriptLabel = scriptOption?.label || scriptKey;
          const baseGroups = getStrokeGroupsForKana(scriptKey);
          const rowKeyMap = modifierOptions.reduce((acc, modifier) => {
            acc[modifier.key] = getScriptModifierKey(scriptKey, modifier.key);
            return acc;
          }, {});
          const scriptPanelKeys = [
            scriptKey,
            ...Object.values(rowKeyMap),
          ];
          const scriptActive = scriptPanelKeys.some((panelKey) =>
            Object.values(customSelections.shapes[panelKey] || {}).some(Boolean)
          );

          return (
            <div key={scriptKey} className="script-panel">
              <div className="script-panel-header">
                <button
                  type="button"
                  className={`script-main-toggle ${scriptActive ? "active" : ""}`}
                  onClick={() => handleScriptToggleShapes(scriptKey)}
                >
                  Toggle All {scriptLabel}
                </button>
              </div>
              {renderPanel(scriptKey, "Stroke Groups")}
              <div className="script-modifier-panels">
                {modifierToggles.map((modifier) => {
                  const panelKey = rowKeyMap[modifier.key];
                  if (!panelKey) return null;
                  const groupsForModifier = getStrokeGroupsForKana(panelKey);
                  if (!groupsForModifier.length) return null;
                  return renderPanel(panelKey, modifier.label);
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SelectByStroke;

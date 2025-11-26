import React from "react";

const SelectByStroke = ({
  strokeKeys,
  kanaOptionMap,
  customSelections,
  getCharacterOptionActive,
  getStrokeGroupsForKana,
  areAllShapesEnabled,
  handleToggleAllShapes,
  handleShapeToggle,
  handleCharacterOptionToggle,
}) => {
  const renderPanel = (panelKey, headerLabel, enabled, scriptLabel) => {
    const groups = getStrokeGroupsForKana(panelKey);
    if (!groups.length) return null;
    const allActive = areAllShapesEnabled(customSelections.shapes, panelKey);
    const panelClass = ["row-panel", enabled ? "" : "disabled"]
      .filter(Boolean)
      .join(" ");
    return (
      <div key={`${panelKey}-panel`} className={panelClass}>
        <div className="row-panel-header">
          <h4>{headerLabel}</h4>
          <button
            type="button"
            className="toggle-all"
            onClick={() => handleToggleAllShapes(panelKey, !allActive)}
            disabled={!enabled}
          >
            {allActive ? "Clear All" : "Select All"}
          </button>
        </div>
        {enabled ? (
          <div className="shape-toggle-grid">
            {groups.map((group) => {
              const active = customSelections.shapes[panelKey]?.[group];
              return (
                <button
                  key={`${panelKey}-shape-${group}`}
                  type="button"
                  className={`shape-toggle ${active ? "active" : ""}`}
                  onClick={() => handleShapeToggle(panelKey, group)}
                >
                  Group {group}
                </button>
              );
            })}
          </div>
        ) : (
          <p className="panel-placeholder">
            Enable {scriptLabel || headerLabel} to choose stroke groups.
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="script-grid">
      {strokeKeys.map((scriptKey) => {
        const scriptOption = kanaOptionMap[scriptKey] || {
          key: scriptKey,
          label: scriptKey,
          type: "character",
        };
        const scriptActive = getCharacterOptionActive(scriptOption);
        const label = scriptOption?.label || scriptKey;
        return (
          <div key={scriptKey} className="script-panel">
            <div className="script-panel-header">
              <button
                type="button"
                className={`script-main-toggle ${scriptActive ? "active" : ""}`}
                onClick={() => handleCharacterOptionToggle(scriptOption)}
              >
                {label}
              </button>
            </div>
            {renderPanel(
              scriptKey,
              "Stroke Groups",
              scriptActive,
              label
            )}
          </div>
        );
      })}
    </div>
  );
};

export default SelectByStroke;

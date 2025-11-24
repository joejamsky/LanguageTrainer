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
}) => {
  const activeStrokeKeys = strokeKeys.filter((key) =>
    getCharacterOptionActive(kanaOptionMap[key] || { key })
  );

  if (!activeStrokeKeys.length) {
    return (
      <div className="shape-selection-card">
        <p className="empty-state">Activate Hiragana or Katakana to pick stroke groups.</p>
      </div>
    );
  }

  return (
    <div className="shape-selection-card">
      {activeStrokeKeys.map((scriptKey) => {
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
      })}
    </div>
  );
};

export default SelectByStroke;

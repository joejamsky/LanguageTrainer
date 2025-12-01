import React from "react";

const SelectByAccuracy = ({
  scriptKeys,
  kanaOptionMap,
  customSelections,
  getCharacterOptionActive,
  getAccuracyValue,
  handleAccuracyChange,
  handleCharacterOptionToggle,
  handleToggleAllRows,
}) => {
  const toggleBaseGroup = (scriptOption, scriptKey) => {
    const scriptRows = customSelections.rows[scriptKey] || {};
    const hasRowsSelected = Object.values(scriptRows).some(Boolean);
    const shouldEnable = !hasRowsSelected;
    handleToggleAllRows(scriptKey, shouldEnable);
    const scriptActive = getCharacterOptionActive(scriptOption);
    if (shouldEnable && !scriptActive) {
      handleCharacterOptionToggle(scriptOption);
    } else if (!shouldEnable && scriptActive) {
      handleCharacterOptionToggle(scriptOption);
    }
  };

  return (
    <div className="script-grid">
      {scriptKeys.map((scriptKey) => {
        const scriptOption = kanaOptionMap[scriptKey] || {
          key: scriptKey,
          label: scriptKey,
          type: "character",
        };
        const scriptRows = customSelections.rows[scriptKey] || {};
        const scriptActive = Object.values(scriptRows).some(Boolean);
        const scriptLabel = scriptOption?.label || scriptKey;
        const sliderValue = getAccuracyValue(scriptKey);

        return (
          <div key={scriptKey} className="script-panel">
            <div className="script-panel-header">
              <button
                type="button"
                className={`script-main-toggle ${scriptActive ? "active" : ""}`}
                onClick={() => toggleBaseGroup(scriptOption, scriptKey)}
              >
                {scriptLabel}
              </button>
            </div>
            <div className={`accuracy-section ${scriptActive ? "" : "disabled"}`}>
              <div className="accuracy-header">
                <h3>Accuracy Target</h3>
                <span>{sliderValue}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="100"
                value={sliderValue}
                onChange={(event) =>
                  handleAccuracyChange(scriptKey, Number(event.target.value))
                }
                disabled={!scriptActive}
              />
              {!scriptActive && (
                <p className="panel-placeholder">
                  Enable {scriptLabel} to set an accuracy target.
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SelectByAccuracy;

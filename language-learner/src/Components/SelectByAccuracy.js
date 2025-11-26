import React from "react";

const SelectByAccuracy = ({
  scriptKeys,
  modifierOptions,
  kanaOptionMap,
  customSelections,
  getScriptModifierKey,
  getCharacterOptionActive,
  getAccuracyValue,
  handleAccuracyChange,
  handleCharacterOptionToggle,
  handleScriptModifierToggle,
  isAnyRowsSelected,
  handleToggleAllRows,
}) => {
  const toggleBaseGroup = (scriptOption, scriptKey) => {
    const hasRowsSelected = isAnyRowsSelected(scriptKey);
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
        const scriptActive = isAnyRowsSelected(scriptKey);
        const scriptLabel = scriptOption?.label || scriptKey;
        const rowKeyMap = modifierOptions.reduce((acc, modifier) => {
          acc[modifier.key] = getScriptModifierKey(scriptKey, modifier.key);
          return acc;
        }, {});
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
              <div className="script-inline-modifiers">
                {modifierOptions.map((modifier) => {
                  const panelKey = rowKeyMap[modifier.key];
                  if (!panelKey || !customSelections.rows[panelKey]) return null;
                  const modifierActive = isAnyRowsSelected(panelKey);
                  return (
                    <button
                      key={`${scriptKey}-${modifier.key}-btn`}
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

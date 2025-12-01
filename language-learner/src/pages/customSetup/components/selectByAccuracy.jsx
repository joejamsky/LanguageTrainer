import React from "react";

const SelectByAccuracy = ({
  scriptKeys,
  kanaOptionMap,
  modifierOptions,
  customSelections,
  getScriptModifierKey,
  getCharacterOptionActive,
  getAccuracyValue,
  handleAccuracyChange,
  handleCharacterOptionToggle,
  handleToggleAllRows,
}) => {
  const togglePanel = (panelKey, option) => {
    const panelRows = customSelections.rows[panelKey] || {};
    const hasRowsSelected = Object.values(panelRows).some(Boolean);
    const shouldEnable = !hasRowsSelected;
    handleToggleAllRows(panelKey, shouldEnable);
    const optionActive = getCharacterOptionActive(option);
    if (shouldEnable && !optionActive) {
      handleCharacterOptionToggle(option);
    } else if (!shouldEnable && optionActive) {
      handleCharacterOptionToggle(option);
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
        const scriptLabel = scriptOption?.label || scriptKey;
        const rowKeyMap = modifierOptions.reduce((acc, modifier) => {
          acc[modifier.key] = getScriptModifierKey(scriptKey, modifier.key);
          return acc;
        }, {});
        const panelConfigs = [
          { key: scriptKey, option: scriptOption, label: scriptLabel },
          ...modifierOptions.map((modifier) => ({
            key: rowKeyMap[modifier.key],
            option: modifier,
            label: modifier.label,
          })),
        ].filter((cfg) => cfg.key);
        const scriptActive = panelConfigs.some(({ key }) => {
          const rows = customSelections.rows[key] || {};
          return Object.values(rows).some(Boolean);
        });
        const toggleScript = () => {
          const panelKeys = panelConfigs.map(({ key }) => key);
          const allPanelsOn = panelKeys.every((key) => {
            const rows = customSelections.rows[key] || {};
            return Object.values(rows).some(Boolean);
          });
          const shouldEnable = !allPanelsOn;
          panelKeys.forEach((key) => handleToggleAllRows(key, shouldEnable));
        };
        return (
          <div key={scriptKey} className="script-panel">
            <div className="script-panel-header">
              <button
                type="button"
                className={`script-main-toggle ${scriptActive ? "active" : ""}`}
                onClick={toggleScript}
              >
                Toggle All {scriptLabel}
              </button>
            </div>
            <div className="accuracy-section-group">
              {panelConfigs.map(({ key, option, label }) => {
                const panelRows = customSelections.rows[key] || {};
                const panelActive = Object.values(panelRows).some(Boolean);
                const sliderValue = getAccuracyValue(key);
                return (
                  <div
                    key={key}
                    className={`accuracy-section-row ${panelActive ? "" : "disabled"}`}
                  >
                    <button
                      type="button"
                      className={`toggle-all ${panelActive ? "active" : ""}`}
                      onClick={() => togglePanel(key, option)}
                    >
                      Toggle {label}
                    </button>
                    <div className="accuracy-spinner">
                      <button
                        type="button"
                        className="accuracy-arrow accuracy-arrow-down"
                        onClick={() =>
                          handleAccuracyChange(
                            key,
                            Math.max(0, sliderValue - 5)
                          )
                        }
                      >
                        ▾
                      </button>
                      <span className="accuracy-value">{sliderValue}%</span>
                      <button
                        type="button"
                        className="accuracy-arrow accuracy-arrow-up"
                        onClick={() =>
                          handleAccuracyChange(
                            key,
                            Math.min(100, sliderValue + 5)
                          )
                        }
                      >
                        ▴
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SelectByAccuracy;

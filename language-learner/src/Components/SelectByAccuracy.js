import React from "react";

const formatLabel = (baseLabel, modifierLabel) => {
  if (!modifierLabel) return baseLabel;
  return `${baseLabel} · ${modifierLabel}`;
};

const SelectByAccuracy = ({
  scriptKeys,
  modifierOptions,
  kanaOptionMap,
  customSelections,
  getScriptModifierKey,
  getCharacterOptionActive,
  getAccuracyValue,
  handleAccuracyChange,
}) => {
  const panels = [];

  scriptKeys.forEach((scriptKey) => {
    const scriptOption = kanaOptionMap[scriptKey];
    const scriptActive = getCharacterOptionActive(scriptOption);
    const scriptLabel = scriptOption?.label || scriptKey;
    if (!customSelections.rows[scriptKey]) return;

    panels.push({
      key: scriptKey,
      label: scriptLabel,
      enabled: scriptActive,
    });

    modifierOptions.forEach((modifier) => {
      const rowKey = getScriptModifierKey(scriptKey, modifier.key);
      if (!customSelections.rows[rowKey]) return;
      const enabled =
        scriptActive && getCharacterOptionActive(modifier);
      panels.push({
        key: rowKey,
        label: formatLabel(scriptLabel, modifier.label),
        enabled,
      });
    });
  });

  if (!panels.length) {
    return (
      <div className="accuracy-selection-card">
        <p className="empty-state">Enable a kana group above to set accuracy targets.</p>
      </div>
    );
  }

  return (
    <div className="accuracy-selection-card">
      {panels.map((panel) => {
        const sliderValue = getAccuracyValue(panel.key);
        return (
          <div key={`accuracy-${panel.key}`} className="accuracy-section">
            <div className="accuracy-header">
              <h3>{panel.label}</h3>
              <span>{sliderValue}%</span>
            </div>
            <input
              type="range"
              min="50"
              max="100"
              value={sliderValue}
              onChange={(event) =>
                handleAccuracyChange(panel.key, Number(event.target.value))
              }
              disabled={!panel.enabled}
            />
          </div>
        );
      })}
    </div>
  );
};

export default SelectByAccuracy;

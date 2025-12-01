import React from "react";

const SelectByRow = ({
  scriptKeys,
  kanaOptionMap,
  modifierOptions,
  customSelections,
  getScriptModifierKey,
  getRowsForKana,
  getCharacterOptionActive,
  isAnyRowsSelected,
  handleCharacterOptionToggle,
  handleScriptModifierToggle,
  handleRowToggle,
  handleToggleAllRows,
  areAllRowsEnabled,
}) => {
  const renderPanel = (panelKey, title, rows, enabled, emptyMessage) => {
    if (!rows.length) {
      return null;
    }
    if (!enabled) {
      return (
        <div key={`${panelKey}-panel`} className="row-panel disabled">
          <div className="row-panel-header">
            <h4>{title}</h4>
          </div>
          <p className="panel-placeholder">
            {emptyMessage || "Enable this group to make selections."}
          </p>
        </div>
      );
    }
    const allActive = areAllRowsEnabled(customSelections.rows, panelKey);
    return (
      <div key={`${panelKey}-panel`} className="row-panel">
        <div className="row-panel-header">
          <h4>{title}</h4>
          <button
            type="button"
            className="toggle-all"
            onClick={() => handleToggleAllRows(panelKey, !allActive)}
          >
            {allActive ? "Clear All" : "Select All"}
          </button>
        </div>
        <div className="row-toggle-grid">
          {rows.map((row) => {
            const active = customSelections.rows[panelKey]?.[row.value];
            return (
              <button
                key={`${panelKey}-${row.id}`}
                type="button"
                className={`row-toggle ${active ? "active" : ""}`}
                onClick={() => handleRowToggle(panelKey, row.value)}
              >
                <span className="row-toggle-title">{row.title}</span>
                <span className="row-toggle-caption">{row.caption}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="script-grid">
      {scriptKeys.map((scriptKey) => {
        const scriptOption = kanaOptionMap[scriptKey];
        const scriptActive = getCharacterOptionActive(scriptOption);
        const scriptLabel = scriptOption?.label || scriptKey;
        const baseRows = getRowsForKana(scriptKey);
        const rowKeyMap = modifierOptions.reduce((acc, modifier) => {
          acc[modifier.key] = getScriptModifierKey(scriptKey, modifier.key);
          return acc;
        }, {});

        return (
          <div key={scriptKey} className="script-panel">
            <div className="script-panel-header">
              <button
                type="button"
                className={`script-main-toggle ${scriptActive ? "active" : ""}`}
                onClick={() => handleCharacterOptionToggle(scriptOption)}
              >
                {scriptLabel}
              </button>
              <div className="script-inline-modifiers">
                {modifierOptions.map((modifier) => {
                  const rowKey = rowKeyMap[modifier.key];
                  if (!rowKey) return null;
                  const rows = getRowsForKana(rowKey);
                  if (!rows.length) return null;
                  const modifierActive = isAnyRowsSelected(rowKey);
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
            {renderPanel(
              scriptKey,
              "Rows",
              baseRows,
              scriptActive,
              `Enable ${scriptLabel} to choose rows.`
            )}
            <div className="script-modifier-panels">
              {modifierOptions.map((modifier) => {
                const rowKey = rowKeyMap[modifier.key];
                if (!rowKey) return null;
                const rows = getRowsForKana(rowKey);
                if (!rows.length) return null;
                const modifierEnabled =
                  getCharacterOptionActive(modifier) && scriptActive;
                return renderPanel(
                  rowKey,
                  modifier.label,
                  rows,
                  modifierEnabled,
                  `Enable ${modifier.label} above to select rows.`
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SelectByRow;

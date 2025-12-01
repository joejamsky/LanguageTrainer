import React from "react";

const SelectByRow = ({
  scriptKeys,
  kanaOptionMap,
  modifierOptions,
  customSelections,
  getScriptModifierKey,
  getRowsForKana,
  getCharacterOptionActive,
  handleScriptToggle,
  handleRowToggle,
  handleToggleAllRows,
  areAllRowsEnabled,
}) => {
  const renderPanel = (panelKey, title, rows) => {
    if (!rows.length) {
      return null;
    }
    const allActive = areAllRowsEnabled(customSelections.rows, panelKey);
    const hasAnySelected = Object.values(customSelections.rows[panelKey] || {}).some(Boolean);
    const panelClass = ["row-panel", hasAnySelected ? "" : "disabled"]
      .filter(Boolean)
      .join(" ");
    return (
      <div key={`${panelKey}-panel`} className={panelClass}>
        <div className="row-panel-header">
          <button
            type="button"
            className={`toggle-all ${hasAnySelected ? "active" : ""}`}
            onClick={() => handleToggleAllRows(panelKey, !allActive)}
          >
            Toggle All {title}
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
        const scriptLabel = scriptOption?.label || scriptKey;
        const baseRows = getRowsForKana(scriptKey);
        const rowKeyMap = modifierOptions.reduce((acc, modifier) => {
          acc[modifier.key] = getScriptModifierKey(scriptKey, modifier.key);
          return acc;
        }, {});
        const scriptPanelKeys = [
          scriptKey,
          ...Object.values(rowKeyMap),
        ];
        const scriptActive = scriptPanelKeys.some((panelKey) =>
          Object.values(customSelections.rows[panelKey] || {}).some(Boolean)
        );

        return (
          <div key={scriptKey} className="script-panel">
            <div className="script-panel-header">
              <button
                type="button"
                className={`script-main-toggle ${scriptActive ? "active" : ""}`}
                onClick={() => handleScriptToggle(scriptKey)}
              >
                Toggle All {scriptLabel}
              </button>
            </div>
            {renderPanel(scriptKey, "Rows", baseRows)}
            <div className="script-modifier-panels">
              {modifierOptions.map((modifier) => {
                const rowKey = rowKeyMap[modifier.key];
                if (!rowKey) return null;
                const rows = getRowsForKana(rowKey);
                if (!rows.length) return null;
                return renderPanel(rowKey, modifier.label, rows);
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SelectByRow;

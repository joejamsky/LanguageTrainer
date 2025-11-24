import React, { useState } from "react";
import "../Styles/Options.scss";
import AppHeader from "../Components/AppHeader";
import { useGameState } from "../Contexts/GameStateContext";
import { DEFAULT_LEVEL, clearStoredData, normalizeLevel } from "../Misc/levelUtils";

const Options = () => {
  const { applyLevelConfiguration } = useGameState();
  const [statusMessage, setStatusMessage] = useState("");

  const handleResetCourse = () => {
    const normalized = normalizeLevel(DEFAULT_LEVEL);
    applyLevelConfiguration(normalized);
    setStatusMessage("Guided course reset to Row 1 Hiragana.");
  };

  const handleClearStorage = () => {
    clearStoredData();
    const normalized = normalizeLevel(DEFAULT_LEVEL);
    applyLevelConfiguration(normalized);
    setStatusMessage("All saved data cleared and levels reset.");
  };

  return (
    <main className="options-page">
      <AppHeader />
      <div className="options-card">
        <header>
          <h1>Options</h1>
          <p>Manage your guided progression, storage, and stats.</p>
        </header>

        <div className="options-grid">
          <div className="options-item">
            <div>
              <h2>Reset Course</h2>
              <p>Return the guided route to Hiragana Row 1, ordered.</p>
            </div>
            <button type="button" onClick={handleResetCourse}>
              Reset Course
            </button>
          </div>

          <div className="options-item">
            <div>
              <h2>Clear Saved Data</h2>
              <p>Remove guided checkpoints and gameplay history.</p>
            </div>
            <button type="button" onClick={handleClearStorage}>
              Clear Saved Data
            </button>
          </div>
        </div>

        {statusMessage && <p className="options-status">{statusMessage}</p>}
      </div>
    </main>
  );
};

export default Options;

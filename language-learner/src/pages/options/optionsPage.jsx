import React, { useState } from "react";
import "../../styles/Pages/Options.scss";
import AppHeader from "../../components/appHeader";
import { useSettings } from "../../contexts/gameStateContext";
import { clearStoredData } from "../../core/levelUtils";

const Options = () => {
  const { options, setOptions } = useSettings();
  const [statusMessage, setStatusMessage] = useState("");

  const handlePronunciationToggle = () => {
    setOptions((prev) => ({
      ...prev,
      pronunciation: !prev.pronunciation,
    }));
  };

  const handleResetCourse = () => {
    setStatusMessage("Guided course resets are coming soon.");
  };

  const handleClearStorage = () => {
    clearStoredData();
    setStatusMessage("Saved data cleared.");
  };

  return (
    <main className="gutter-container options-page">
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

          <div className="options-item options-item--toggle">
            <div>
              <h2>Kana Pronunciation</h2>
              <p>Hear system speech for each kana when you complete it.</p>
            </div>
            <label className="switch" aria-label="Toggle pronunciation">
              <input
                type="checkbox"
                checked={Boolean(options?.pronunciation)}
                onChange={handlePronunciationToggle}
              />
              <span className="slider"></span>
              <span className="check-slider-label">
                <i className="fa-solid fa-volume-high"></i>
              </span>
            </label>
          </div>
        </div>

        {statusMessage && <p className="options-status">{statusMessage}</p>}
      </div>
    </main>
  );
};

export default Options;

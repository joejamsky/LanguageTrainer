import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "../Styles/ModeSelect.scss";
import AppHeader from "../Components/AppHeader";
import { GUIDED_SCRIPT_OPTIONS } from "../Constants/guidedPaths";
import { describeLevel, readStoredLevels } from "../Misc/levelUtils";

const ModeSelect = () => {
  const navigate = useNavigate();

  const guidedLevels = useMemo(() => readStoredLevels(), []);
  const guidedCheckpoints = useMemo(() => {
    return GUIDED_SCRIPT_OPTIONS.reduce((acc, option) => {
      const level = guidedLevels[option.key];
      acc[option.key] = describeLevel(level).summary;
      return acc;
    }, {});
  }, [guidedLevels]);

  const handleGuidedSelect = () => {
    navigate("/guided");
  };

  const handleCustomSelect = () => {
    navigate("/setup");
  };

  return (
    <main className="mode-select">
      <AppHeader />
      <header className="mode-select-header">
        <h1>How do you want to train?</h1>
        <p className="subtitle">
          Follow the guided sequence to resume your checkpoint or dive into a custom free play run.
        </p>
      </header>

      <div className="mode-card-grid">
        <section className="mode-card guided-card">
          <div>
            <p className="card-eyebrow">Guided</p>
            <h2>Guided Journey</h2>
            <p>
              Resume from your saved checkpoint and progress through Kana with spaced repetition and built-in reviews.
            </p>
            <div className="mode-summary">
              <span>Checkpoints</span>
              <div className="mode-summary-grid">
                {GUIDED_SCRIPT_OPTIONS.map((option) => (
                  <div key={option.key} className="mode-summary-item">
                    <span className="mode-summary-title">{option.title}</span>
                    <strong>{guidedCheckpoints[option.key]}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <button type="button" onClick={handleGuidedSelect}>
            Start Guided
          </button>
        </section>

        <section className="mode-card custom-card">
          <div>
            <p className="card-eyebrow">Custom</p>
            <h2>Custom Session</h2>
            <p>
              Choose rows, modes, modifiers, and shuffle yourself. Perfect when you want to focus on a specific skill.
            </p>
            <div className="mode-summary">
              <span>Build your own run</span>
              <strong>Path · Mode · Kana · Shuffle</strong>
            </div>
          </div>
          <button type="button" onClick={handleCustomSelect}>
            Build Custom Run
          </button>
        </section>
      </div>
    </main>
  );
};

export default ModeSelect;

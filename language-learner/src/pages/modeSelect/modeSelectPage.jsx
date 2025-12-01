import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/Pages/ModeSelect.scss";
import AppHeader from "../../components/appHeader";
import { GUIDED_SCRIPT_OPTIONS } from "../../constants/guidedPaths";
import { describeLevel, readStoredLevels } from "../../misc/levelUtils";

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
    <main className="gutter-container mode-select">
      <AppHeader />
      <header className="mode-select-header">
        <h1>How do you want to train?</h1>
      </header>

      <div className="mode-card-grid">
        <section className="mode-card guided-card">
          <div>
            <h2>Guided Journey</h2>
            <p>
              Resume from saved checkpoints and progress through Kana using spaced repetition.
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
            <h2>Custom Session</h2>
            <p>
              Choose rows, modes, modifiers, and shuffle yourself. Perfect when you want to focus on a specific skill.
            </p>
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

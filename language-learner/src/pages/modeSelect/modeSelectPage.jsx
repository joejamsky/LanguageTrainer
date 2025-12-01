import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/pages/modeSelect.scss";
import AppHeader from "../../components/appHeader";

const ModeSelect = () => {
  const navigate = useNavigate();
  const [guidedStatus] = useState("");

  const guidedCheckpointSummaries = [
    { key: "hiragana", title: "Hiragana", summary: "Kana | Mode | Group | Shuffle" },
    { key: "katakana", title: "Katakana", summary: "Kana | Mode | Group | Shuffle" },
    { key: "both", title: "Both", summary: "Kana | Mode | Group | Shuffle" },
  ];

  const handleGuidedSelect = () => {
    navigate("/guided/setup");
  };

  const handleCustomSelect = () => {
    navigate("/custom/setup");
  };

  return (
    <main className="gutter-container mode-select">
      <AppHeader />
      <header className="mode-select-header">
        <h1>How do you want to train?</h1>
      </header>

      <div className="mode-card-grid">
        <section className="mode-card">
          <div>
            <h2>Guided Journey</h2>
            <p>
              Resume from saved checkpoints and progress through Kana using spaced repetition.
            </p>
            <div className="mode-summary">
              <span>Checkpoints</span>
              <div className="mode-summary-grid">
                {guidedCheckpointSummaries.map((item) => (
                  <div key={item.key} className="mode-summary-item">
                    <span className="mode-summary-title">{item.title}</span>
                    <span>{item.summary}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <button type="button" onClick={handleGuidedSelect}>
            Enter Guided Setup
          </button>
        </section>

        <section className="mode-card">
          <div>
            <h2>Custom Session</h2>
            <p>
              Choose rows, modes, modifiers, and shuffle yourself. Perfect when you want to focus on a specific skill.
            </p>
          </div>
          <button type="button" onClick={handleCustomSelect}>
            Enter Custom Setup
          </button>
        </section>
      </div>
    </main>
  );
};

export default ModeSelect;

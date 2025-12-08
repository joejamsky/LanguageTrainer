import React from "react";
import "../../styles/pages/modeSelect.scss";
import AppHeader from "../../components/appHeader";
import LinkButton from "../../components/linkButton";

const ModeSelect = () => {
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
              Progress through kana paths using spaced repetition and resume from saved checkpoints from previous sessions.
            </p>
          </div>
          <LinkButton to="/guided/setup">
            Enter Guided Setup
          </LinkButton>
        </section>

        <section className="mode-card">
          <div>
            <h2>Custom Session</h2>
            <p>
              Choose rows, modes, modifiers, and shuffle yourself. Perfect when you want to focus on a specific group of kana.
            </p>
          </div>
          <LinkButton to="/custom/setup">
            Enter Custom Setup
          </LinkButton>
        </section>
      </div>
    </main>
  );
};

export default ModeSelect;

import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../../styles/pages/guidedSetup.scss";
import AppHeader from "../../components/appHeader";
import Button from "../../components/button";

const GUIDED_SCRIPT_OPTIONS = [
  {
    key: "hiragana",
    title: "Hiragana",
    caption: "Start with あ rows",
  },
  {
    key: "katakana",
    title: "Katakana",
    caption: "Train ア rows",
  },
  {
    key: "both",
    title: "Both",
    caption: "Mix Hiragana + Katakana",
  },
];

const GuidedSetup = () => {
  const [scriptSelection, setScriptSelection] = useState(
    () => GUIDED_SCRIPT_OPTIONS[0]?.key || "hiragana"
  );
  const [statusMessage, setStatusMessage] = useState("");

  const handleStartGuided = () => {
    setStatusMessage("Guided gameplay is coming soon.");
  };

  return (
    <main className="gutter-container guided-setup">
      <AppHeader />
      <header className="guided-header">
        <h1>Select your script focus</h1>
        <p>
          Guided runs move you through Kana in an optimal spaced path. Each script keeps its own checkpoint—pick the route you want to resume.
        </p>
      </header>

      <div className="guided-options">
        {GUIDED_SCRIPT_OPTIONS.map((choice) => (
          <button
            key={choice.key}
            type="button"
            className={`guided-choice ${scriptSelection === choice.key ? "active" : ""}`}
            onClick={() => setScriptSelection(choice.key)}
          >
            <span className="guided-choice-title">{choice.title}</span>
            <span className="guided-choice-caption">{choice.caption}</span>
            <div className="guided-choice-summary">
              <span>Checkpoint</span>
              <strong>Coming soon</strong>
            </div>
          </button>
        ))}
      </div>

      <div className="guided-actions">
        <Button className="guided-start" onClick={handleStartGuided}>
          Start Guided
        </Button>
        <Link to="/options" className="guided-link">
          Reset checkpoints or clear data
        </Link>
        {statusMessage && <p className="guided-status">{statusMessage}</p>}
      </div>
    </main>
  );
};

export default GuidedSetup;

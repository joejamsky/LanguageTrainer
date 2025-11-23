import React, { useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../Styles/GuidedSetup.scss";
import PageNav from "../Components/PageNav";
import { useGameState } from "../Contexts/GameStateContext";
import { GUIDED_SCRIPT_OPTIONS } from "../Constants/guidedPaths";
import { buildGuidedLevelMap, getInitialGuidedSelection } from "../Misc/guidedGameMode";

const GuidedSetup = () => {
  const navigate = useNavigate();
  const { applyLevelConfiguration, setSessionType } = useGameState();

  const { descriptors } = useMemo(() => buildGuidedLevelMap(), []);
  const [scriptSelection, setScriptSelection] = useState(() => getInitialGuidedSelection());

  const handleStartGuided = () => {
    const levelToApply = descriptors[scriptSelection]?.level;
    if (!levelToApply) return;
    applyLevelConfiguration(levelToApply);
    setSessionType("guided");
    navigate("/game");
  };

  return (
    <main className="guided-setup">
      <PageNav />
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
              <strong>{descriptors[choice.key]?.descriptor.summary || "Row 1 | Ordered"}</strong>
            </div>
          </button>
        ))}
      </div>

      <div className="guided-actions">
        <button type="button" className="guided-start" onClick={handleStartGuided}>
          Start Guided
        </button>
        <Link to="/options" className="guided-link">
          Reset checkpoints or clear data
        </Link>
      </div>
    </main>
  );
};

export default GuidedSetup;

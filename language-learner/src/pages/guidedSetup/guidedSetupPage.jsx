import React, { useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../../styles/Pages/GuidedSetup.scss";
import AppHeader from "../../components/appHeader";
import { useGameState } from "../../contexts/gameStateContext";
import { GUIDED_SCRIPT_OPTIONS } from "../../constants/guidedPaths";
import {
  describeLevel,
  readStoredLevel,
  readStoredLevels,
} from "../../misc/levelUtils";

const GuidedSetup = () => {
  const navigate = useNavigate();
  const { applyLevelConfiguration, setSessionType } = useGameState();

  const descriptors = useMemo(() => {
    const storedLevels = readStoredLevels();
    const map = {};
    GUIDED_SCRIPT_OPTIONS.forEach((option) => {
      const level = storedLevels[option.key] || readStoredLevel(option.key);
      map[option.key] = {
        level,
        descriptor: describeLevel(level),
      };
    });
    return map;
  }, []);
  const [scriptSelection, setScriptSelection] = useState(
    () => GUIDED_SCRIPT_OPTIONS[0]?.key || "hiragana"
  );

  const handleStartGuided = () => {
    const levelToApply = descriptors[scriptSelection]?.level;
    if (!levelToApply) return;
    applyLevelConfiguration(levelToApply);
    setSessionType("guided");
    navigate("/game");
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
              <strong>{descriptors[choice.key]?.descriptor.summary || "Row 1 | No Shuffle"}</strong>
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

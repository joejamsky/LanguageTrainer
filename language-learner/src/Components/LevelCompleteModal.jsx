import React, { useEffect } from "react";
import "../Styles/LevelCompleteModal.scss";
import { useGameState } from "../Contexts/GameStateContext";

const formatTime = (seconds = 0) => {
  if (!Number.isFinite(seconds)) return "--:--";
  const mins = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const secs = (seconds % 60).toString().padStart(2, "0");
  return `${mins}:${secs}`;
};

const LevelCompleteModal = () => {
  const { game, stats, currentLevel, goToNextLevel, applyLevelConfiguration } = useGameState();

  useEffect(() => {
    if (!game.gameover) return;
    const handleKeyDown = (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        goToNextLevel();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [game.gameover, goToNextLevel]);

  if (!game.gameover || !currentLevel) {
    return null;
  }

  const bestTimes = stats.bestTimesByLevel || {};
  const levelKey = currentLevel.key;
  const bestForLevel = bestTimes[levelKey] || 0;
  const currentTime = stats.recentTime || 0;
  const isNewBest = currentTime > 0 && currentTime === bestForLevel;

  const handleReplay = () => {
    if (currentLevel) {
      applyLevelConfiguration(currentLevel);
    }
  };

  return (
    <div className="level-complete-backdrop" role="dialog" aria-modal="true">
      <div className="level-complete-card">
        <p className="level-complete-eyebrow">Level Complete</p>
        <h2>Congratulations!</h2>
        <p className="level-complete-subtitle">
          Level {currentLevel.rowLevel}-{currentLevel.scriptLevel}-{currentLevel.shuffleLevel} cleared.
        </p>

        <div className="level-complete-times">
          <div className="time-panel">
            <span className="time-label">Your time</span>
            <span className="time-value">{formatTime(currentTime)}</span>
          </div>
          <div className="time-panel">
            <span className="time-label">Best for this level</span>
            <span className="time-value">{bestForLevel ? formatTime(bestForLevel) : "--:--"}</span>
            {isNewBest && <span className="time-pill">New best!</span>}
          </div>
        </div>

        <div className="level-complete-actions">
          <button type="button" className="level-complete-primary" onClick={goToNextLevel}>
            Next Level
          </button>
          <button type="button" className="level-complete-secondary" onClick={handleReplay}>
            Replay Level
          </button>
        </div>
      </div>
    </div>
  );
};

export default LevelCompleteModal;

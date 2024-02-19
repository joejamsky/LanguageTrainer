// ControlPanel.js
import React from 'react';

function ControlPanel({
  resetGame,
  timer,
  hintsEnabled,
  setHintsEnabled,
  difficultyLevel,
  setDifficultyLevel,
}) {
  return (
    <div className="control-panel">
      <button onClick={resetGame}>Reset</button>
      <div>Timer: {Math.floor(timer.elapsed / 1000)} seconds</div>
      <label>
        <input
          type="checkbox"
          checked={hintsEnabled}
          onChange={(e) => setHintsEnabled(e.target.checked)}
        />
        Show Hints
      </label>
      <input
        type="range"
        min="1"
        max="5"
        value={difficultyLevel}
        onChange={(e) => setDifficultyLevel(e.target.value)}
      />
    </div>
  );
}

export default ControlPanel;

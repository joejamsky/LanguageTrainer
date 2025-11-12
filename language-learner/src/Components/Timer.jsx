import React, { useState, useEffect } from "react";
import "../Styles/Timer.scss";
import { useGameState } from "../Contexts/GameStateContext.js";
import { describeLevel } from "../Misc/levelUtils";

function Timer() {
  const { reset, game, stats, setStats, currentLevel } = useGameState();
  const [timeElapsed, setTimeElapsed] = useState(0);
  const levelKey = currentLevel?.key;
  const bestTimesByLevel = stats.bestTimesByLevel || {};
  const bestTimeForLevel = levelKey ? bestTimesByLevel[levelKey] || 0 : 0;
  const currentLevelDescriptor = currentLevel ? describeLevel(currentLevel) : null;
  const levelGridHeaders = ["Mode", "Group", "Kana", "Shuff"];
  const levelGridValues = [
    currentLevelDescriptor?.mode || "--",
    currentLevelDescriptor?.grouping || "--",
    currentLevelDescriptor?.kana || "--",
    currentLevelDescriptor?.shuffle || "--",
  ];

  const handleResetClick = () => {
    reset();
    setTimeElapsed(0);
  };

  useEffect(() => {
    let timer;

    if (game.start && !game.gameover) {
      timer = setInterval(() => {
        setTimeElapsed((prevTime) => prevTime + 1);
      }, 1000);
    }

    return () => clearInterval(timer); // Ensure cleanup on dependency changes
  }, [game.start, game.gameover]);

  useEffect(() => {
    if (!game.start) {
      setTimeElapsed(0);
    }
  }, [game.start]);

  useEffect(() => {
    if (game.gameover && timeElapsed > 0) {
      setStats((prevStats) => {
        const previousBestForLevel = levelKey
          ? prevStats.bestTimesByLevel?.[levelKey] || 0
          : 0;
        const improved = previousBestForLevel === 0 || timeElapsed < previousBestForLevel;
        const existingBestTimes = prevStats.bestTimesByLevel || {};
        const nextBestTimes = levelKey
          ? {
              ...existingBestTimes,
              [levelKey]: improved ? timeElapsed : previousBestForLevel,
            }
          : existingBestTimes;
        const nextOverallBest =
          prevStats.bestTime === 0 || timeElapsed < prevStats.bestTime
            ? timeElapsed
            : prevStats.bestTime;

        return {
          ...prevStats,
          recentTime: timeElapsed,
          bestTime: nextOverallBest,
          bestTimesByLevel: nextBestTimes,
        };
      });
    }
  }, [game.gameover, timeElapsed, setStats, levelKey]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${padTime(minutes)}:${padTime(remainingSeconds)}`;
  };

  const padTime = (time) => {
    return time.toString().padStart(2, "0");
  };

  return (
    <div className="timer-container">
      <div className="current-level-container">
        <span className="current-level-copy">Level</span>
        <div className="best-time-divider"></div>
        <div className="current-level-grid">
          {levelGridHeaders.map((label) => (
            <span key={`header-${label}`} className="current-level-cell current-level-cell--header">
              {label}
            </span>
          ))}
          {levelGridValues.map((value, index) => (
            <span
              key={`value-${levelGridHeaders[index]}`}
              className="current-level-cell current-level-cell--value"
            >
              {value}
            </span>
          ))}
        </div>
      </div>

      <button onClick={handleResetClick} className="reset-button">
        <span className="time">{formatTime(timeElapsed)}</span>
        <div className="best-time-divider"></div>
        <span className="reset">&#10227;</span>
      </button>

      <div className="best-time-container">
        <span className="best-time-copy">Best</span>
        <div className="best-time-divider"></div>
        <span className="best-time">
          {formatTime(bestTimeForLevel || stats.bestTime || 0)}
        </span>
      </div>
    </div>
  );
}

export default Timer;

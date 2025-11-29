import React, { useState, useEffect } from "react";
import "../Styles/Timer.scss";
import { useGameState } from "../Contexts/GameStateContext.js";
import { describeLevel } from "../Misc/levelUtils";

function Timer() {
  const { game, setStats, currentLevel } = useGameState();
  const [timeElapsed, setTimeElapsed] = useState(0);
  const levelKey = currentLevel?.key;
  const currentLevelDescriptor = currentLevel ? describeLevel(currentLevel) : null;
  const levelGridHeaders = ["Mode", "Group", "Kana", "Shuffle"];
  const levelGridValues = [
    currentLevelDescriptor?.mode || "--",
    currentLevelDescriptor?.grouping || "--",
    currentLevelDescriptor?.kana || "--",
    currentLevelDescriptor?.shuffle || "--",
  ];

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
      <div className="level-info">
        <div className="level-row level-row--headers">
          {levelGridHeaders.map((label) => (
            <span key={`header-${label}`} className="level-cell">
              {label}
            </span>
          ))}
        </div>
        <div className="level-divider"></div>
        <div className="level-row level-row--values">
          {levelGridValues.map((value, index) => (
            <span key={`value-${levelGridHeaders[index]}`} className="level-cell">
              {value}
            </span>
          ))}
        </div>
        <div className="level-divider"></div>
      </div>

      <div className="timer-pill">{formatTime(timeElapsed)}</div>
    </div>
  );
}

export default Timer;

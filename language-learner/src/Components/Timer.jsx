import React, { useState, useEffect } from "react";
import "../Styles/Timer.scss";
import { useGameState } from "../Contexts/GameStateContext.js";

function Timer() {
  const { reset, game, stats, setStats } = useGameState();
  const [timeElapsed, setTimeElapsed] = useState(0);

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
    if (game.gameover && timeElapsed > 0) {
      setStats((prevStats) => ({
        recentTime: timeElapsed,
        bestTime:
          timeElapsed < prevStats.bestTime || prevStats.bestTime === 0
            ? timeElapsed
            : prevStats.bestTime,
      }));
    }
  }, [game.gameover, timeElapsed, stats.bestTime, setStats]);

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
      <button onClick={handleResetClick} className="reset-button">
        <span className="time">{formatTime(timeElapsed)}</span>
        <span className="reset">&#10227;</span>
      </button>

      <div className="best-time-container">
        <span className="best-time-copy">Best</span>
        <div className="best-time-divider"></div>
        <span className="best-time">{formatTime(stats.bestTime)}</span>
      </div>
    </div>
  );
}

export default Timer;

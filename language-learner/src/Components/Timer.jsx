import React, { useState, useEffect } from "react";
import "../Styles/Timer.scss";
import { useGameState } from "../Contexts/GameStateContext.js";

function Timer() {
  const { reset, game, stats, setStats } = useGameState();
  const [timeElapsed, setTimeElapsed] = useState(0);

  const handleResetClick = () => {
    reset()
    setTimeElapsed(0);
  }

  useEffect(() => {
    let timer;

    if (game.start && !game.gameover) {
      timer = setInterval(() => {
        setTimeElapsed((prevTime) => prevTime + 1);
      }, 1000);
    } else if (!game.start || game.gameover) {
      clearInterval(timer);
    }

    return () => clearInterval(timer);
  }, [game.start, game.gameover]);

  useEffect(() => {
    if (game.gameover && timeElapsed > 0) {
      if (timeElapsed < stats.bestTime || stats.bestTime === 0 ) {
        setStats({
          recentTime: timeElapsed,
          bestTime: timeElapsed,
        });
      } else {
        setStats((prevStats) => ({
          ...prevStats,
          recentTime: timeElapsed,
        }));
      }
    }
  }, [game.gameover, timeElapsed, setStats, stats.bestTime]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${padTime(minutes)}:${padTime(remainingSeconds)}`;
  };

  // Helper function to pad single digit numbers with a leading zero
  const padTime = (time) => {
    return time.toString().padStart(2, '0');
  };

  return (
    <div className="timer-container">
        
            <button onClick={handleResetClick} className="reset-button">
                <div className="time">{formatTime(timeElapsed)}</div>
                <div className="reset">&#10227;</div>
            </button>
        
    </div>
  );


}

export default Timer;

import React, { useState, useEffect } from "react";
import "../Styles/Timer.scss";

function Timer({ start, reset, gameover }) {
  
  const [timeElapsed, setTimeElapsed] = useState(0);

  const handleResetClick = () => {
    reset()
    setTimeElapsed(0);
  }

  useEffect(() => {
    let timer;

    if (start && !gameover) {
      timer = setInterval(() => {
        setTimeElapsed((prevTime) => prevTime + 1);
      }, 1000);
    } else if (!start && timeElapsed !== 0) {
      clearInterval(timer);
    }

    return () => clearInterval(timer);
  }, [start, setTimeElapsed, timeElapsed]);

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

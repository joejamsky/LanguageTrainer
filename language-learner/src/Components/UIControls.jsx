import React from 'react';
import '../Styles/UIControls.scss'


function UIControls({
  timeElapsed,
  setTimeElapsed,
  showPlaceholders,
  setShowPlaceholders,
  shuffleIntensity,
  setShuffleIntensity,
  shuffledCharacters,
  setShuffledCharacters,
  hiraganaCharacters
}) {
  const resetGame = () => {
    setTimeElapsed(0);

    // Reset the shuffle intensity or any other game settings as necessary
    setShuffleIntensity(0); // Reset shuffle intensity to default

    // Resetting characters to initial state
    setShuffledCharacters([...hiraganaCharacters]);

    // Optionally, reset any other game state you manage
  };

  return (
      <div className="ui">
        <button className="reset-btn" onClick={resetGame}>
          &#10227;
        </button>

        <button
          className="hint-btn"
          onClick={() => setShowPlaceholders(!showPlaceholders)}
        >
          {showPlaceholders ? (
            <span>
              Hint: <i className="fa-regular fa-eye"></i>
            </span>
          ) : (
            <span>
              Hint: <i className="fa-regular fa-eye-slash"></i>
            </span>
          )}
        </button>

        <div className="difficulty-container">
          <i className="fa-solid fa-shuffle"></i>
          <input
            type="range"
            min="0"
            max="5"
            value={shuffleIntensity}
            className="difficulty-slider"
            onChange={(e) => setShuffleIntensity(Number(e.target.value))}
          />
        </div>

        <div className="time">Time: {timeElapsed} seconds</div>
      </div>
  );
}

export default UIControls;

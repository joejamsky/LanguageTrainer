import React from "react";
import "../Styles/Main.scss";
import "@fortawesome/fontawesome-free/css/all.css";
import TopGrid from "../Components/TopGrid.jsx";
import BotGrid from "../Components/BotGrid.jsx";
import Timer from "../Components/Timer.jsx";
import MobileHint from "../Components/MobileHint.jsx";
import LevelCompleteModal from "../Components/LevelCompleteModal.jsx";
import PageNav from "../Components/PageNav";
import { useGameState } from "../Contexts/GameStateContext.js";

const Game = () => {
  useGameState();

  return (
    <div className="Main">
      <PageNav />
      <div className="gutter-container">
        <>
          <div className="UI-header">
            <MobileHint />
            <Timer />
          </div>
          <TopGrid />
          <div className="UI-divider-container m-1">
            <div className="UI-divider"></div>
          </div>
          <BotGrid />
          <LevelCompleteModal />
          {/* {hintVisible && (
            <div className="gameplay-hint-box">
              <button
                type="button"
                className="gameplay-hint-close"
                aria-label="Close hint"
                onClick={() => setHintVisible(false)}
              >
                ×
              </button>
              <p className="gameplay-hint-title">How to Play</p>
              <p className="gameplay-hint-copy">
                {isMobileScreen
                  ? "Drag the tiles from the bottom grid into the matching slots above to clear the board."
                  : "Type the romaji answer in the input field (or drag a tile) to fill the matching slot above."}
              </p>
              {!isMobileScreen && (
                <p className="gameplay-hint-shortcut">
                  Tip: Hold Cmd + Shift (Ctrl + Shift on Windows) to briefly reveal hints.
                </p>
              )}
            </div>
          )} */}
        </>
      </div>
    </div>
  );
};

export default Game;

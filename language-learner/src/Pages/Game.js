import React from "react";
import "../Styles/Main.scss";
import "../Styles/Game.scss";
import "@fortawesome/fontawesome-free/css/all.css";
import TopGrid from "../Components/TopGrid.jsx";
import BotGrid from "../Components/BotGrid.jsx";
import LevelCompleteModal from "../Components/LevelCompleteModal.jsx";
import GameHeader from "../Components/GameHeader.jsx";
import { useGameState } from "../Contexts/GameStateContext.js";

const Game = () => {
  useGameState();

  return (
    <main className="gutter-container game">
      <div className="game-layout">
        <div className="header-cell">
          <div className="game-header-container">
            <GameHeader />
          </div>
        </div>

        <div className="rail left-rail" aria-hidden />
        <div className="rail right-rail" aria-hidden />

        <div className="board-section top-board">
          <TopGrid />
        </div>

        <div className="board-divider">
          <div className="UI-divider"></div>
        </div>

        <div className="board-section bottom-board">
          <BotGrid />
        </div>
      </div>
      <LevelCompleteModal />
    </main>
  );
};

export default Game;

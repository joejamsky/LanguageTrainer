import React from "react";
import "../../styles/Main.scss";
import "../../styles/Pages/Game.scss";
import "@fortawesome/fontawesome-free/css/all.css";
import TopGrid from "./components/topGrid";
import BotGrid from "./components/botGrid";
import LevelCompleteModal from "./components/levelCompleteModal";
import GameHeader from "./components/gameHeader";
import PronunciationSpeaker from "../../components/pronunciationSpeaker";

const Game = () => {
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
      <PronunciationSpeaker />
      <LevelCompleteModal />
    </main>
  );
};

export default Game;

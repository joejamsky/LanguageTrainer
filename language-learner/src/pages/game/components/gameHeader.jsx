import React from "react";
import AppHeader from "../../../components/appHeader";
import Timer from "./gameTimer";
import MobileHint from "./mobileHint";

const GameHeader = () => {
  return (
    <div className="game-header">
      <div className="header-left">
        <AppHeader showHome={false} />
      </div>
      <div className="header-center">
        <Timer />
      </div>
      <div className="header-right">
        <MobileHint />
      </div>
    </div>
  );
};

export default GameHeader;

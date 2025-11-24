import React from "react";
import AppHeader from "./AppHeader";
import Timer from "./Timer.jsx";
import MobileHint from "./MobileHint.jsx";

const GameHeader = () => {
  return (
    <div className="UI-header">
      <AppHeader showHome={false}>
        <MobileHint />
      </AppHeader>
      <Timer />
    </div>
  );
};

export default GameHeader;

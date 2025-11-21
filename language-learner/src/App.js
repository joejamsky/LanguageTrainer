import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./Styles/App.scss";
import Game from "./Pages/Game";
import { GameStateProvider } from "./Contexts/GameStateContext";
import Home from "./Pages/Home";
import ModeSelect from "./Pages/ModeSelect";
import GuidedSetup from "./Pages/GuidedSetup";
import Setup from "./Pages/Setup";
import Stats from "./Pages/Stats";
import Options from "./Pages/Options";

function App() {
  return (
    <BrowserRouter>
      <GameStateProvider>
        <div className="App">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/mode" element={<ModeSelect />} />
            <Route path="/guided" element={<GuidedSetup />} />
            <Route path="/setup" element={<Setup />} />
            <Route path="/options" element={<Options />} />
            <Route path="/stats" element={<Stats />} />
            <Route path="/game" element={<Game />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </GameStateProvider>
    </BrowserRouter>
  );
}

export default App;

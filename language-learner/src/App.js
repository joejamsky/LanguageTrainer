import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./styles/App.scss";
import Game from "./pages/game/gamePage";
import { AppStateProvider } from "./contexts/gameStateContext";
import Home from "./pages/home/homePage";
import ModeSelect from "./pages/modeSelect/modeSelectPage";
import GuidedSetup from "./pages/guidedSetup/guidedSetupPage";
import CustomSetup from "./pages/customSetup/customSetupPage";
import Stats from "./pages/stats/statsPage";
import Options from "./pages/options/optionsPage";

function App() {
  return (
    <BrowserRouter>
      <AppStateProvider>
        <div className="App">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/mode" element={<ModeSelect />} />
            <Route path="/guided" element={<GuidedSetup />} />
            <Route path="/guided/setup" element={<GuidedSetup />} />
            <Route path="/setup" element={<CustomSetup />} />
            <Route path="/custom/setup" element={<CustomSetup />} />
            <Route path="/options" element={<Options />} />
            <Route path="/stats" element={<Stats />} />
            <Route path="/game" element={<Game />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </AppStateProvider>
    </BrowserRouter>
  );
}

export default App;

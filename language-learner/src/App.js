import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./Styles/App.scss";
import Main from "./Components/Main";
import { GameStateProvider } from "./Contexts/GameStateContext";
import Home from "./Pages/Home";

function App() {
  return (
    <BrowserRouter>
      <GameStateProvider>
        <div className="App">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/game" element={<Main />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </GameStateProvider>
    </BrowserRouter>
  );
}

export default App;

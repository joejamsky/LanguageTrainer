import React from "react";
import "./Styles/App.scss";
import Main from "./Components/Main";
import { GameStateProvider } from "./Contexts/GameStateContext";

function App() {

  return (
    <GameStateProvider>
      <div className="App">
        <Main/>
      </div>
    </GameStateProvider>
  );
}

export default App;

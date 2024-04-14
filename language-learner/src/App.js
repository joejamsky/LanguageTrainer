import React, { useState, useEffect } from "react";
import "./Styles/App.scss";
import "./Styles/Header.scss";
import {
  japanese_characters_vertical,
} from "./Misc/Constants.js";
import "@fortawesome/fontawesome-free/css/all.css";
import TopGrid from "./Components/TopGrid.jsx";
import BotGrid from "./Components/BotGrid.jsx";
import Timer from "./Components/Timer.jsx";
import UIControls from "./Components/UIControls.jsx"
import Header from "./Components/Header.jsx"

function App() {
  const [topCharacters, setTopCharacters] = useState([]);
  const [botCharacters, setBotCharacters] = useState([]);
  
  const [start, setStart] = useState(false);


  useEffect(() => {
    reset();
  }, []);

  const reset = () => {
    const initialCharacters = japanese_characters_vertical.map(char => ({
      ...char 
    }));

    setTopCharacters(initialCharacters);
    setBotCharacters([...initialCharacters]); // Ensure a separate copy for botCharacters

    setStart(false);
  };

  
  return (
    <div className="App">
      <Header />
      <TopGrid
        characterData={topCharacters}
        topCharacters={topCharacters}
        setTopCharacters={setTopCharacters}
        botCharacters={botCharacters}
        setBotCharacters={setBotCharacters}
        showHints={false}
      />

      <Timer start={start} reset={reset} />

      <BotGrid
        botCharacters={botCharacters}
        setStart={setStart}
      />

      

    </div>
  );
}

export default App;

import React, { useState, useEffect } from "react";
import "./Styles/App.scss";
import {
  japanese_characters_vertical,
} from "./Misc/Constants.js";
import "@fortawesome/fontawesome-free/css/all.css";
import TopGrid from "./Components/TopGrid.jsx";
import BotGrid from "./Components/BotGrid.jsx";
import Timer from "./Components/Timer.jsx";
import Menu from "./Components/Menu.jsx"

function App() {
  const [topCharacters, setTopCharacters] = useState([]);
  const [botCharacters, setBotCharacters] = useState([]);
  const [options, setOptions] = useState({
    characters: {
      hiragana: { activeTop: true, activeBot: false },
      katakana: { activeTop: false, activeBot: false },
      romaji: { activeTop: false, activeBot: true }
    },
    topRowLevels: 10,
    botRowShuffleLevel: 10,
    sortBy: ['sound', 'shape', 'missed'],
    sound: false
  })
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

  useEffect(() => {
    console.log('options', options.topCharacters)
  });

  
  return (
    <div className="App">
      <div className="gutter-container"> 

        <TopGrid
          topCharacters={topCharacters}
          setTopCharacters={setTopCharacters}
          botCharacters={botCharacters}
          setBotCharacters={setBotCharacters}
          options={options}
        />

        <div className="UI-container">
          <div className="UI-divider-container">
            <div className="UI-divider"></div>
          </div>
          <Timer start={start} reset={reset} />
          <Menu 
            options={options}
            setOptions={setOptions}
          />
        </div>

        <BotGrid
          botCharacters={botCharacters}
          setStart={setStart}
        />

      </div>
    </div>
  );
}

export default App;

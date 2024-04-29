import React, { useState, useEffect } from "react";
import "./Styles/App.scss";
import {
  japanese_characters_vertical,
} from "./Misc/Constants.js";
import { shuffleArray } from "./Misc/Utils.js";
import "@fortawesome/fontawesome-free/css/all.css";
import TopGrid from "./Components/TopGrid.jsx";
import BotGrid from "./Components/BotGrid.jsx";
import Timer from "./Components/Timer.jsx";
import Menu from "./Components/Menu.jsx";

function App() {
  const [characters, setCharacters] = useState({
    topCharacters: [],
    botCharacters: []
  });
  const [options, setOptions] = useState({
    characters: {
      hiragana: { activeTop: true, activeBot: false },
      katakana: { activeTop: false, activeBot: false },
      romaji: { activeTop: false, activeBot: true },
      dakuon: false,
      botType: ['hiragana', 'katakana', 'romaji']
    },
    topRowLevels: 10,
    botRowShuffleLevel: 0,
    sorting: {
        current: 0,
        methods: ['sound', 'h-shape', 'k-shape', 'missed']
    },
    sound: false
  })
  const [game, setGame] = useState({
      gameover: false
  })
  const [stats, setStats] = useState({
    recentTime: 0,
    bestTime: 0,
  })
  const [start, setStart] = useState(false);

  useEffect(() => {
    reset();
  }, []);

  useEffect(() => {
    reset();
    if(characters.botCharacters.length !== 0){
      const tempChars = shuffleArray(characters.botCharacters, options.botRowShuffleLevel);
      setCharacters({
        topCharacters: defaultCharacterMap(japanese_characters_vertical),
        botCharacters: tempChars
      })
    }
  }, [options]);


  const defaultCharacterMap = (charArray) => {
    return charArray.filter(char => 
      options.characters.dakuon || !char.dakuon
    ).map(char => ({
      ...char
    }));
  }
  const reset = () => {
    setStart(false);
    setGame((prevGame) => ({
      ...prevGame,
      gameover: false
    }))
    // setOptions((prevOptions) => ({
    //   ...prevOptions,
    //   botRowShuffleLevel: 0
    // }))

    // const initialCharacters = japanese_characters_vertical.filter(char => 
    //   options.characters.dakuon || !char.dakuon
    // ).map(char => ({
    //   ...char
    // }));
    setCharacters({
      topCharacters: defaultCharacterMap(japanese_characters_vertical),
      botCharacters: defaultCharacterMap(japanese_characters_vertical)
    });

  };

  
  return (
    <div className="App">
      <div className={`gutter-container ${game.gameover ? 'gameover' : 'gameon'}`}>

        <TopGrid
          characters={characters}
          setCharacters={setCharacters}
          options={options}
          setGame={setGame}
        />

        <div className="UI-container">
          <div className="UI-divider-container">
            <div className="UI-divider"></div>
          </div>
          <Timer start={start} reset={reset} gameover={game.gameover}/>
          <Menu 
            options={options}
            setOptions={setOptions}
          />
        </div>

        <BotGrid
          characters={characters.botCharacters}
          setCharacters={setCharacters}
          setStart={setStart}
        />

      </div>
    </div>
  );
}

export default App;

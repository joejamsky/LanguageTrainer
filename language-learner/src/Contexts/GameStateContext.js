import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
import { cloneCharacters, filterCharacters } from '../Misc/Utils'; 
import japanese_characters_standard from '../Data/japanese_characters_standard.json'; 
// import japanese_characters_byshape_hiragana from '../Data/japanese_characters_byshape_hiragana.json'; 
// import japanese_characters_byshape_katakana from '../Data/japanese_characters_byshape_katakana.json'; 

const initialState = {
  characters: {
    topCharacters: [],
    botCharacters: [],
    defaultCharacters: []
  },
  options: {
    characterTypes: {
      hiragana: { activeTop: false, activeBot: true },
      katakana: { activeTop: false, activeBot: false },
      romaji: { activeTop: true, activeBot: false },
    },
    dakuon: false,
    topRowLevels: 10,
    gameMode: {
      current: 0,
      methods: ['sound', 'h-shape', 'k-shape', 'missed']
    },
    sound: false
  },
  game: {
    start: false,
    gameover: false
  },
  stats: {
    recentTime: 0,
    bestTime: 0,
  },
  selectedTile: {
    id: null,
    index: null
  },
};

const GameStateContext = createContext();

const breakpoints = {
  mobile: 480,
  tablet: 768,
  laptop: 1024,
  desktop: 1200,
}

export const GameStateProvider = ({ children }) => {
  const [characters, setCharacters] = useState(initialState.characters);
  const [options, setOptions] = useState(initialState.options);
  const [game, setGame] = useState(initialState.game);
  const [stats, setStats] = useState(initialState.stats);
  const [selectedTile, setSelectedTile] = useState(initialState.selectedTile);
  const [screenSize, setScreenSize] = useState('desktop'); 
  const [textInput, setTextInput] = useState('');


  // Function to determine screen size
  const updateScreenSize = useCallback(() => {
    const width = window.innerWidth;

    if (width <= breakpoints.mobile) setScreenSize('mobile');
    else if (width <= breakpoints.tablet) setScreenSize('tablet');
    else if (width <= breakpoints.laptop) setScreenSize('laptop');
    else setScreenSize('desktop');
  }, []);

  // Set up an event listener to update screen size on resize
  useEffect(() => {
    updateScreenSize(); // Run on initial load
    window.addEventListener('resize', updateScreenSize);
    return () => window.removeEventListener('resize', updateScreenSize); // Cleanup
  }, [updateScreenSize]);

  // const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const isMobile = true;

  const filterByOptions = useCallback(
    (character) => {
      const isDakuonEnabled = options.dakuon;
      const characterIsDakuon = character.dakuon;
      return isDakuonEnabled || !characterIsDakuon;
    },
    [options.dakuon]
  );

  const reset = useCallback(() => {
    setGame(initialState.game);
    // setStats(initialState.stats);
    setOptions(initialState.options);
    const filteredCharacters = cloneCharacters(
      filterCharacters(japanese_characters_standard, filterByOptions)
    );
    setCharacters({
      topCharacters: filteredCharacters,
      botCharacters: filteredCharacters,
      defaultCharacters: filteredCharacters,
    });
  }, [filterByOptions]);

  const getCurrentRow = (characters) => {
    const firstRenderedIndex = characters.findIndex(char => char.render);
    const currentRow = Math.floor(firstRenderedIndex / 5);
    return currentRow;
};

  const handleDrop = (targetId, targetIndex) => {
    if(selectedTile.id === targetId) {
      const tempTopChars = [...characters.topCharacters];
      tempTopChars[targetIndex].filled = true;

      const currentRow = getCurrentRow(characters.botCharacters);
      const startIdx = currentRow * 5;
      const endIdx = startIdx + 5;

      const tempBotChars = [...characters.botCharacters]
      tempBotChars[selectedTile.index].filled = true;
      const row = tempBotChars.slice(startIdx, endIdx);
      const allFilled = row.every(char => char.filled);

      if (allFilled) {
          row.forEach(char => char.render = false); // Hide the filled row
      }

      if (allFilled && (currentRow + 1) === (tempBotChars.length / 5) ){
          setGame((prevGame) => ({
              ...prevGame,
              gameover: true
          }))
      }

      setCharacters(prevChars => ({
          ...prevChars,
          topCharacters: tempTopChars,
          botCharacters: tempBotChars
      }));

    }

  }


  const value = {
    characters,
    setCharacters,
    options,
    setOptions,
    game,
    setGame,
    stats,
    setStats,
    reset,
    filterByOptions,
    isMobile,
    screenSize,
    selectedTile,
    setSelectedTile,
    handleDrop,
    textInput, 
    setTextInput
  };

  return (
    <GameStateContext.Provider value={value}>
      {children}
    </GameStateContext.Provider>
  );
};

// Custom hook for accessing the context
export const useGameState = () => {
  const context = useContext(GameStateContext);
  if (context === undefined) {
    throw new Error('useGameState must be used within a GameStateProvider');
  }
  return context;
};

export default GameStateContext;

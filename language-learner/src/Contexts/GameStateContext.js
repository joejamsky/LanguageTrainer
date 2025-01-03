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
      hiragana: { activeTop: true, activeBot: true },
      katakana: { activeTop: true, activeBot: false },
      romaji: { activeTop: false, activeBot: false },
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
  const [startMenuOpen, setStartMenuOpen] = useState(true); 

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

  const handleTextSubmit = (submittedChar) => {
    if(game.start === false) {
      setGame((prevGame) => ({
        ...prevGame,
        start: true
      }))
    }
    // 1) Identify which row we’re on
    const currentRow = getCurrentRow(characters.botCharacters); // e.g. 0 for first row
    const startIdx = currentRow * 5;
    const endIdx = startIdx + 5;
  
    // 2) Clone arrays for immutability
    const tempBotChars = [...characters.botCharacters];
    const tempTopChars = [...characters.topCharacters];
  
    // 3) Slice out the 5 tiles in the current row
    const row = tempBotChars.slice(startIdx, endIdx);
  
    // 4) Find the tile that matches the user's typed answer (ignoring placeholders)
    const matchedTile = row.find(
      (tile) => !tile.placeholder && tile.romaji === submittedChar
    );
  
    // If there is no match, do nothing (or show an error, etc.)
    if (!matchedTile) {
      return -1;
    }
  
    // 5) Find the same tile in the full bottom array and top array by ID
    const bottomIndex = tempBotChars.findIndex((tile) => tile.id === matchedTile.id);
    const topIndex = tempTopChars.findIndex((tile) => tile.id === matchedTile.id);
  
    // 6) Mark both matching tiles as filled (if found)
    if (bottomIndex !== -1) {
      tempBotChars[bottomIndex].filled = true;
    }
    if (topIndex !== -1) {
      tempTopChars[topIndex].filled = true;
    }
  
    // 7) Check if the entire row is now “all filled”
    //    (again ignoring placeholders)
    const allFilled = row
      .filter((tile) => !tile.placeholder)
      .every((tile) => tile.filled);
  
    // If they are all filled, hide (render = false) the row
    if (allFilled) {
      // row is just a slice referencing the same objects in tempBotChars
      row.forEach((tile) => {
        tile.render = false;
      });
    }
  
    // 8) Check if we've completed the final row => game over
    const totalRows = tempBotChars.length / 5; // e.g. total # of rows
    if (allFilled && (currentRow + 1) === totalRows) {
      setGame((prevGame) => ({
        ...prevGame,
        gameover: true,
      }));
    }
  
    // 9) Update state
    setCharacters((prevChars) => ({
      ...prevChars,
      topCharacters: tempTopChars,
      botCharacters: tempBotChars,
    }));
  };
  
  


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
    handleTextSubmit,
    startMenuOpen, 
    setStartMenuOpen
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

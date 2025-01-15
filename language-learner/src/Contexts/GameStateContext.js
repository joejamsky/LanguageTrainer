import React, { createContext, useState, useContext, useCallback, useEffect} from 'react';
import { defaultState, breakpoints} from '../Misc/Utils'; 
import japanese_characters_standard_top from '../Data/japanese_characters_standard_top.json'; 
import japanese_characters_standard_bot from "../Data/japanese_characters_standard_bot";
// import japanese_characters_byshape_hiragana from '../Data/japanese_characters_byshape_hiragana.json'; 
// import japanese_characters_byshape_katakana from '../Data/japanese_characters_byshape_katakana.json'; 

const GameStateContext = createContext();

export const GameStateProvider = ({ children }) => {
  const [characters, setCharacters] = useState({
    topCharacters: japanese_characters_standard_top, 
    botCharacters: japanese_characters_standard_bot
  });
  const [options, setOptions] = useState(defaultState.options);
  const [game, setGame] = useState(defaultState.game);
  const [stats, setStats] = useState(defaultState.stats);
  const [selectedTile, setSelectedTile] = useState(defaultState.selectedTile);
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



  const reset = () => {
    setGame(defaultState.game);
    setCharacters({
      topCharacters: japanese_characters_standard_top,
      botCharacters: japanese_characters_standard_bot,
    });
  };

  const getCurrentRow = (characters) => {
    const firstRenderedIndex = characters.findIndex(char => !char.completed);
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
      (tile) => !tile.placeholder && tile.characters.romaji.character === submittedChar
    );
  
    // If there is no match, do nothing (or show an error, etc.)
    if (!matchedTile) {
      return -1;
    }
  
    // 5) Find the same tile in the full bottom array and top array by ID
    const bottomIndex = tempBotChars.findIndex((tile) => tile.id === matchedTile.id);
    const topIndex = tempTopChars.findIndex((tile) => tile.id === matchedTile.id);

    // 6) Mark both matching tiles as filled (if found)
    if (bottomIndex !== -1 && options.characterTypes.hiragana === true) {
      tempBotChars[bottomIndex].characters.hiragana.filled = true;
    }
    if (bottomIndex !== -1 && options.characterTypes.katakana === true) {
      tempBotChars[bottomIndex].characters.katakana.filled = true;
    }
    if (topIndex !== -1 && options.characterTypes.hiragana === true) {
      tempTopChars[topIndex].characters.hiragana.filled = true;
    }
    if (topIndex !== -1 && options.characterTypes.katakana === true) {
      tempTopChars[topIndex].characters.katakana.filled = true;
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
  
  const handleCharacterSelect = (type) => {
    console.log('defaultAll', characters.defaultAll)
    setCharacters((prevChars) => ({
      ...prevChars,
      botCharacters: prevChars[`default${type}`] || [],
    }));
    console.log('characters', characters.botCharacters)
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
    screenSize,
    selectedTile,
    setSelectedTile,
    handleDrop,
    handleTextSubmit,
    startMenuOpen, 
    setStartMenuOpen,
    handleCharacterSelect
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

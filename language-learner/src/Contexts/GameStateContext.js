import React, { createContext, useState, useContext, useCallback, useEffect} from 'react';
import { defaultState, breakpoints} from '../Misc/Utils'; 
import japanese_characters_standard from '../Data/japanese_characters_standard.json'; 
// import japanese_characters_standard_bot from "../Data/japanese_characters_standard_bot";
// import japanese_characters_byshape_hiragana from '../Data/japanese_characters_byshape_hiragana.json'; 
// import japanese_characters_byshape_katakana from '../Data/japanese_characters_byshape_katakana.json'; 

const GameStateContext = createContext();

const generateBotCharacters = (botCharacters, options) => {
  const hiraganaItems = [];
  const katakanaItems = [];
  const romajiItems = [];

  // Group items by type
  botCharacters.forEach((char) => {
    if (!char.characters) return;

    if (char.modifierGroup === "dakuten" && !options.characterTypes.dakuten) return;
    if (char.modifierGroup === "handakuten" && !options.characterTypes.handakuten) return;

    if (options.characterTypes.hiragana && char.characters.hiragana?.render) {
      hiraganaItems.push({ type: "hiragana", ...char.characters.hiragana, id: char.id, matchDesktop: char.characters.romaji.character });
    }
    if (options.characterTypes.katakana && char.characters.katakana?.render) {
      katakanaItems.push({ type: "katakana", ...char.characters.katakana, id: char.id, matchDesktop: char.characters.romaji.character });
    }
    if (options.characterTypes.romaji && char.characters.romaji?.render) {
      romajiItems.push({ type: "romaji", ...char.characters.romaji, id: char.id, matchDesktop: char.characters.romaji.character });
    }
  });

  // Combine items row by row (5 items per row)
  const combinedRows = [];
  const maxLength = Math.max(hiraganaItems.length, katakanaItems.length, romajiItems.length);

  for (let i = 0; i < maxLength; i += 5) {
    combinedRows.push(
      ...hiraganaItems.slice(i, i + 5),
      ...katakanaItems.slice(i, i + 5),
      ...romajiItems.slice(i, i + 5)
    );
  }

  return combinedRows;
};

export const GameStateProvider = ({ children }) => {
  const [characters, setCharacters] = useState({
    topCharacters: japanese_characters_standard, 
    botCharacters: generateBotCharacters(japanese_characters_standard, defaultState.options)
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
      topCharacters: japanese_characters_standard,
      botCharacters: japanese_characters_standard,
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
    if (!game.start) {
      setGame((prevGame) => ({
        ...prevGame,
        start: true,
      }));
    }
  
    // 1) Identify the current row
    // const currentRow = getCurrentRow(characters.botCharacters); // e.g. 0 for first row
    // const startIdx = currentRow * 5;
    // const endIdx = startIdx + 5;
  
    // 2) Clone arrays for immutability
    const tempBotChars = [...characters.botCharacters];
    const tempTopChars = [...characters.topCharacters];
  
    // 3) Slice out the 5 tiles in the current row
    // const row = tempBotChars.slice(startIdx, endIdx);
  
    if(submittedChar === tempBotChars[game.tileIndex].matchDesktop){
      
      setGame((prevGame) => ({
        ...prevGame,
        tileIndex: prevGame.tileIndex + 1,
      }));

      tempBotChars[game.tileIndex].render = false
      // tempBotChars[game.tileIndex].characters.katakana.render 

    }

    // // 4) Check if the text input matches any `character` in the row
    // const matchedTile = tempBotChars.find((tile) => {

    //   console.log("tile", tile)
      
    //   if (!tile.placeholder && tile.characters.romaji.character === submittedChar) {
    //     return true;
    //   }
    //   return false;
    // });
  
    // if (!matchedTile) {
    //   console.log("No match found for input:", matchedTile);
    //   return -1; // No match, exit function
    // }
  
    // console.log("Matched Tile:", matchedTile);
  
    // // 5) Find the index of the matched tile in botCharacters and topCharacters
    // const bottomIndex = tempBotChars.findIndex((tile) => tile.id === matchedTile.id);
    // const topIndex = tempTopChars.findIndex((tile) => tile.id === matchedTile.id);
  
    // // 6) Mark both matching tiles as filled (if found)
    // if (bottomIndex !== -1) {
    //   tempBotChars[bottomIndex].completed = true; // Mark tile as completed
    // }
    // if (topIndex !== -1) {
    //   tempTopChars[topIndex].completed = true; // Mark tile as completed
    // }
  
    // 7) Check if the entire row is now “all filled”
    // const allFilled = row
    //   .filter((tile) => !tile.placeholder)
    //   .every((tile) => tile.completed);
  
    // // If all tiles in the row are filled, hide the row (set render = false)
    // if (allFilled) {
    //   row.forEach((tile) => {
    //     tile.render = false;
    //   });
    // }
  
    // 8) Check if game over (last row fully completed)
    // const totalRows = tempBotChars.length / 5; // e.g. total # of rows
    // if (allFilled && currentRow + 1 === totalRows) {
    //   setGame((prevGame) => ({
    //     ...prevGame,
    //     gameover: true,
    //   }));
    // }
  
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

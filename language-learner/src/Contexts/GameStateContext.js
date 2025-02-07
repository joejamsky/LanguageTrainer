import React, { createContext, useState, useContext, useCallback, useEffect} from 'react';
import { defaultState, breakpoints, dictionaryKanaToRomaji} from '../Misc/Utils'; 
import japanese_characters_standard_bot from '../Data/japanese_characters_standard_bot.json'; 
import japanese_characters_standard_top from '../Data/japanese_characters_standard_top.json';

/** Helper function to see if user's input matches a script object. */
const matchInput = (scriptObj, userInput) => {
  // If it's already romaji, just compare directly
  if (scriptObj.type === "romaji") {
    return scriptObj.character.toLowerCase() === userInput.toLowerCase();
  }
  
  // Otherwise, it's hiragana or katakana: check dictionary
  const romaji = dictionaryKanaToRomaji[scriptObj.character] || "";
  return romaji.toLowerCase() === userInput.toLowerCase();
};

/** Checks toggles to decide if a character should be visible. */
const handleCharRenderToggles = (item, options) => {
  // Always filter out items that are placeholders or not meant to render
  if (item.placeholder || !item.render) return false;

  // Determine if the base type is enabled
  let baseEnabled = false;
  if (item.type === "hiragana") {
    baseEnabled = options.characterTypes.hiragana;
  } else if (item.type === "katakana") {
    baseEnabled = options.characterTypes.katakana;
  } else if (item.type === "romaji") {
    baseEnabled = options.characterTypes.romaji;
  }

  // If the item is a modifier, require that both the base and modifier toggles are enabled
  if (item.modifierGroup === "dakuten") {
    return baseEnabled && options.modifierGroup.dakuten;
  } else if (item.modifierGroup === "handakuten") {
    return baseEnabled && options.modifierGroup.handakuten;
  } else {
    // For items that are not modifiers (or considered "base")
    return baseEnabled;
  }
};




const GameStateContext = createContext();

export const GameStateProvider = ({ children }) => {

  // 1) Filter the default arrays right away, using the defaultState.options
  const initialFilteredBot = japanese_characters_standard_bot.filter(item =>
    handleCharRenderToggles(item, defaultState.options)
  );

  const [characters, setCharacters] = useState({
    masterTopCharacters: japanese_characters_standard_top, 
    masterBotCharacters: japanese_characters_standard_bot,
    topCharacters: japanese_characters_standard_top, 
    botCharacters: initialFilteredBot
  });
  const [options, setOptions] = useState(defaultState.options);
  const [game, setGame] = useState(defaultState.game);
  const [stats, setStats] = useState(defaultState.stats);
  const [selectedTile, setSelectedTile] = useState(defaultState.selectedTile);
  const [screenSize, setScreenSize] = useState('desktop'); 
  const [startMenuOpen, setStartMenuOpen] = useState(true); 

  // Breakpoints logic
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


  // Only filter the master lists (and update the visible top/bot characters)
  // when options change AND the game has not started yet.
  // This prevents reinitializing botCharacters mid-game.
  useEffect(() => {
    if (!game.start) { // <<-- ADDED: Check that the game hasn't started
      setCharacters(prevChars => {
        const filteredBot = prevChars.masterBotCharacters.filter(item =>
          handleCharRenderToggles(item, options)
        );
        return {
          ...prevChars,
          botCharacters: filteredBot,
          topCharacters: japanese_characters_standard_top
        };
      });
    }
  }, [options, game.start]); // <<-- UPDATED: added game.start to dependencies


  const reset = () => {
    setGame(defaultState.game);
    setCharacters({
      masterTopCharacters: japanese_characters_standard_top,
      masterBotCharacters: japanese_characters_standard_bot,
      topCharacters: japanese_characters_standard_top,
      botCharacters: japanese_characters_standard_bot
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
    const tempBotChars = [...characters.botCharacters];
    const tempTopChars = [...characters.topCharacters];
    const currentTile = tempBotChars[0];
    
    if (!game.start) {
      setGame(prevGame => ({
        ...prevGame,
        start: true,
      }));
    }
  
    // Guard if out of range
    if (tempBotChars.length <= 0) {
      console.log("No more tiles to match.");
      return;
    }

      // Exit early if the submitted character doesn't match.
    if (!matchInput(currentTile, submittedChar)) {
      return -1;
    }

    // Find the corresponding top tile by parentId.
    const topTile = tempTopChars.find(tile => tile.id === currentTile.parentId);
    // If found, look for the matching script (using Object.values to directly access the scripts)
    const matchingScript = topTile?.scripts && Object.values(topTile.scripts)
      .find(script => script.id === currentTile.id);
      
    if (matchingScript) {
      matchingScript.filled = true;
    }

    tempBotChars.shift();

    if(tempBotChars.length === 0){
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

import React, { createContext, useState, useContext, useCallback, useEffect} from 'react';
import { 
  defaultState, 
  breakpoints, 
  dictionaryKanaToRomaji,
  shuffleArray,
  shuffleRows
} from '../Misc/Utils'; 
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
const handleCharRenderToggles = (item, filters) => {
  // Always filter out items that are placeholders or not meant to render
  // if (item.placeholder || !item.render) return false;

  // Determine if the base type is enabled
  let baseEnabled = false;
  if (item.type === "hiragana") {
    baseEnabled = filters.characterTypes.hiragana;
  } else if (item.type === "katakana") {
    baseEnabled = filters.characterTypes.katakana;
  } else if (item.type === "romaji") {
    baseEnabled = filters.characterTypes.romaji;
  }

  // If the item is a modifier, require that both the base and modifier toggles are enabled
  if (item.modifierGroup === "dakuten") {
    return baseEnabled && filters.modifierGroup.dakuten;
  } else if (item.modifierGroup === "handakuten") {
    return baseEnabled && filters.modifierGroup.handakuten;
  } else {
    // For items that are not modifiers (or considered "base")
    return baseEnabled;
  }
};


// When updating a miss, update a separate stats object.
const updateMissedStats = (currentTileId) => {
  const stats = JSON.parse(localStorage.getItem('tileStats')) || {};
  stats[currentTileId] = (stats[currentTileId] || 0) + 1;
  localStorage.setItem('tileStats', JSON.stringify(stats));
};


const getInitialCharacters = () => {
  const stats = JSON.parse(localStorage.getItem('tileStats')) || {};
  const defaultBot = japanese_characters_standard_bot.map(tile => ({
    ...tile,
    // Overwrite the missed count if stored, otherwise use the default.
    missed: stats[tile.id] || tile.missed,
    // Reset ephemeral fields:
    filled: false,
    render: false,
  }));
  
  return {
    masterTopCharacters: japanese_characters_standard_top,
    masterBotCharacters: defaultBot,
    topCharacters: japanese_characters_standard_top,
    botCharacters: defaultBot.filter(item => handleCharRenderToggles(item, defaultState.filters)),
  };
};

const GameStateContext = createContext();

export const GameStateProvider = ({ children }) => {

  const [characters, setCharacters] = useState(getInitialCharacters);
  const [filters, setFilters] = useState(defaultState.filters)
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
  // when filters change AND the game has not started yet.
  // This prevents reinitializing botCharacters mid-game.
  useEffect(() => {
    setCharacters(prevChars => {
      // 1. Filter the master bot characters using your filtering function.
      const filteredBot = prevChars.masterBotCharacters.filter(item =>
        handleCharRenderToggles(item, filters)
      );
  
      // 2. Define the grid dimensions.
      const numCols = 5;
      const numRows = Math.floor(filteredBot.length / numCols);
  
      // 3. Create the grid (array of rows)
      let grid = [];
      for (let r = 0; r < numRows; r++) {
        grid.push(filteredBot.slice(r * numCols, r * numCols + numCols));
      }

      // --- Apply Shuffling Based on Options ---
  
      // If row shuffling is enabled, shuffle each row.
      if (options.sorting.rowShuffle) {
        grid = shuffleRows
        (grid);
      }
  
      // If column shuffling is enabled, shuffle each column.
      if (options.sorting.columnShuffle) {
        for (let col = 0; col < numCols; col++) {
          // Extract the column.
          let colItems = grid.map(row => row[col]);
  
          // For the "i" (col 1) and "e" (col 3) columns, only shuffle non-placeholders.
          if (col === 1 || col === 3) {
            const nonPlaceholders = colItems.filter(item => !item.placeholder);
            const placeholders = colItems.filter(item => item.placeholder);
            const shuffledNonPlaceholders = shuffleArray(nonPlaceholders);
            colItems = [...shuffledNonPlaceholders, ...placeholders];
          } else {
            // For all other columns, shuffle normally.
            colItems = shuffleArray(colItems);
          }
  
          // Put the shuffled column items back into the grid.
          for (let row = 0; row < numRows; row++) {
            grid[row][col] = colItems[row];
          }
        }
      }
  
      // 4. Flatten the grid back to a one-dimensional array.
      const filteredSortedBot = grid.flat();
  
      return {
        ...prevChars,
        botCharacters: filteredSortedBot,
        topCharacters: japanese_characters_standard_top,
      };
    });
  }, [filters, options.sorting.rowShuffle, options.sorting.columnShuffle]);


  const reset = () => {
    setGame(defaultState.game);
    setCharacters({
      masterTopCharacters: japanese_characters_standard_top,
      masterBotCharacters: japanese_characters_standard_bot,
      topCharacters: japanese_characters_standard_top,
      botCharacters: japanese_characters_standard_bot.filter(item => handleCharRenderToggles(item, defaultState.filters) )
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

  // Helper to update local storage
  const saveCharactersToLocalStorage = (state) => {
    localStorage.setItem('characters', JSON.stringify(state));
  };

  // Helper to update the missed count for the current tile
  const updateMissedTile = (currentTile, characters) => {
    return {
      ...characters,
      masterBotCharacters: characters.masterBotCharacters.map(tile =>
        tile.id === currentTile.id ? { ...tile, missed: tile.missed + 1 } : tile
      )
    };
  };

  const handleTextSubmit = (submittedChar) => {
    const tempBotChars = [...characters.botCharacters];
    const tempTopChars = [...characters.topCharacters];
    const currentTile = tempBotChars[0];

    // Start game if not already started.
    if (!game.start) {
      setGame(prevGame => ({ ...prevGame, start: true }));
    }

    // Guard: if no more tiles, exit.
    if (tempBotChars.length === 0) {
      console.log("No more tiles to match.");
      return;
    }

    // Handle a miss.
    if (!matchInput(currentTile, submittedChar)) {
      const newState = updateMissedTile(currentTile, characters);
      setCharacters(newState);
      saveCharactersToLocalStorage(newState);
      updateMissedStats(currentTile.id);
      return -1;
    }

    // Handle a correct match:
    // 1. Mark the matching script as filled.
    const topTile = tempTopChars.find(tile => tile.id === currentTile.parentId);
    if (topTile?.scripts) {
      Object.values(topTile.scripts).forEach(script => {
        if (script.id === currentTile.id) {
          script.filled = true;
        }
      });
    }

    // 2. Remove the current tile and any contiguous placeholders.
    tempBotChars.shift();
    while (tempBotChars[0]?.placeholder) {
      tempBotChars.shift();
    }

    // 3. Check for game over.
    if (tempBotChars.length === 0) {
      setGame(prevGame => ({ ...prevGame, gameover: true }));
    }

    // 4. Update state and local storage.
    const newState = {
      ...characters,
      topCharacters: tempTopChars,
      botCharacters: tempBotChars,
    };

    setCharacters(newState);
    saveCharactersToLocalStorage(newState);
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
    filters,
    setFilters,
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

import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
import { 
  defaultState, 
  breakpoints, 
  dictionaryKanaToRomaji
} from '../Misc/Utils'; 
import { getSoundSorted, shuffleByShapeGroup } from '../Misc/ShuffleSort'
import japanese_characters_standard_bot from '../Data/japanese_characters_standard_bot.json'; 
import japanese_characters_standard_top from '../Data/japanese_characters_standard_top.json';

/* =============================
   HELPER FUNCTIONS (Local)
   ============================= */

// Compares user's input with a script object's expected value.
const matchInput = (scriptObj, userInput) => {
  if (scriptObj.type === "romaji") {
    return scriptObj.character.toLowerCase() === userInput.toLowerCase();
  }
  const romaji = dictionaryKanaToRomaji[scriptObj.character] || "";
  return romaji.toLowerCase() === userInput.toLowerCase();
};

// Determines whether a character should render based on filters.
const handleCharRenderToggles = (item, filters) => {
  let baseEnabled = false;
  if (item.type === "hiragana") baseEnabled = filters.characterTypes.hiragana;
  else if (item.type === "katakana") baseEnabled = filters.characterTypes.katakana;
  else if (item.type === "romaji") baseEnabled = filters.characterTypes.romaji;

  if (item.modifierGroup === "dakuten") {
    return baseEnabled && filters.modifierGroup.dakuten;
  } else if (item.modifierGroup === "handakuten") {
    return baseEnabled && filters.modifierGroup.handakuten;
  } else {
    return baseEnabled;
  }
};

// Update missed count in localStorage stats.
const updateMissedStats = (currentTileId) => {
  const stats = JSON.parse(localStorage.getItem('tileStats')) || {};
  stats[currentTileId] = (stats[currentTileId] || 0) + 1;
  localStorage.setItem('tileStats', JSON.stringify(stats));
};

// Initialize characters from defaults and stored stats.
const getInitialCharacters = () => {
  const stats = JSON.parse(localStorage.getItem('tileStats')) || {};
  const defaultBot = japanese_characters_standard_bot.map(tile => ({
    ...tile,
    missed: stats[tile.id] || tile.missed,
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


/* =============================
   CONTEXT & PROVIDER
   ============================= */

const GameStateContext = createContext();

export const GameStateProvider = ({ children }) => {
  const [characters, setCharacters] = useState(getInitialCharacters);
  const [filters, setFilters] = useState(defaultState.filters);
  const [options, setOptions] = useState(defaultState.options);
  const [game, setGame] = useState(defaultState.game);
  const [stats, setStats] = useState(defaultState.stats);
  const [selectedTile, setSelectedTile] = useState(defaultState.selectedTile);
  const [screenSize, setScreenSize] = useState('desktop');
  const [startMenuOpen, setStartMenuOpen] = useState(true);

  // Update screen size based on breakpoints.
  const updateScreenSize = useCallback(() => {
    const width = window.innerWidth;
    if (width <= breakpoints.mobile) setScreenSize('mobile');
    else if (width <= breakpoints.tablet) setScreenSize('tablet');
    else if (width <= breakpoints.laptop) setScreenSize('laptop');
    else setScreenSize('desktop');
  }, []);

  useEffect(() => {
    updateScreenSize();
    window.addEventListener('resize', updateScreenSize);
    return () => window.removeEventListener('resize', updateScreenSize);
  }, [updateScreenSize]);

  // Destructure sorting and game mode options for clarity.
  const { rowShuffle, columnShuffle } = options.sorting;
  const { current, methods } = options.gameMode;

  // Re-sort botCharacters when filters, shuffling, or game mode change.
  useEffect(() => {
    setCharacters(prevChars => {
      const filteredBot = prevChars.masterBotCharacters.filter(item =>
        handleCharRenderToggles(item, filters)
      );
      let updatedBotCharacters;
      switch (methods[current]) {
        case 'sound':
          updatedBotCharacters = getSoundSorted(filteredBot, rowShuffle, columnShuffle);
          break;
        case 'h-shape':
          updatedBotCharacters = shuffleByShapeGroup(filteredBot, 'hiragana', rowShuffle, columnShuffle);
          break;
        case 'k-shape':
          updatedBotCharacters = shuffleByShapeGroup(filteredBot, 'katakana', rowShuffle, columnShuffle);
          break;
        case 'missed':
          updatedBotCharacters = filteredBot.filter(tile => !tile.placeholder)
            .sort((a, b) => b.missed - a.missed);
          break;
        default:
          updatedBotCharacters = filteredBot;
      }
      return {
        ...prevChars,
        botCharacters: updatedBotCharacters,
        topCharacters: japanese_characters_standard_top,
      };
    });
  }, [filters, rowShuffle, columnShuffle, current, methods]);

  // Reset game and characters to initial state.
  const reset = () => {
    setGame(defaultState.game);
    setCharacters(getInitialCharacters());
  };

  const getCurrentRow = (chars) => {
    const index = chars.findIndex(char => !char.completed);
    return Math.floor(index / 5);
  };

  const handleDrop = (targetId, targetIndex) => {
    if (selectedTile.id === targetId) {
      const tempTopChars = [...characters.topCharacters];
      tempTopChars[targetIndex].filled = true;

      const currentRow = getCurrentRow(characters.botCharacters);
      const startIdx = currentRow * 5;
      const endIdx = startIdx + 5;
      const tempBotChars = [...characters.botCharacters];
      tempBotChars[selectedTile.index].filled = true;
      const row = tempBotChars.slice(startIdx, endIdx);
      const allFilled = row.every(char => char.filled);

      if (allFilled) row.forEach(char => char.render = false);
      if (allFilled && (currentRow + 1) === (tempBotChars.length / 5)) {
        setGame(prevGame => ({ ...prevGame, gameover: true }));
      }
      setCharacters(prevChars => ({
        ...prevChars,
        topCharacters: tempTopChars,
        botCharacters: tempBotChars
      }));
    }
  };

  const saveCharactersToLocalStorage = (state) => {
    localStorage.setItem('characters', JSON.stringify(state));
  };

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

    if (!game.start) {
      setGame(prevGame => ({ ...prevGame, start: true }));
    }
    if (tempBotChars.length === 0) {
      console.log("No more tiles to match.");
      return;
    }
    if (!matchInput(currentTile, submittedChar)) {
      const newState = updateMissedTile(currentTile, characters);
      setCharacters(newState);
      saveCharactersToLocalStorage(newState);
      updateMissedStats(currentTile.id);
      return -1;
    }
    const topTile = tempTopChars.find(tile => tile.id === currentTile.parentId);
    if (topTile?.scripts) {
      Object.values(topTile.scripts).forEach(script => {
        if (script.id === currentTile.id) {
          script.filled = true;
        }
      });
    }
    tempBotChars.shift();
    while (tempBotChars[0]?.placeholder) {
      tempBotChars.shift();
    }
    if (tempBotChars.length === 0) {
      setGame(prevGame => ({ ...prevGame, gameover: true }));
    }
    const newState = {
      ...characters,
      topCharacters: tempTopChars,
      botCharacters: tempBotChars,
    };
    setCharacters(newState);
    saveCharactersToLocalStorage(newState);
  };

  const handleCharacterSelect = (type) => {
    setCharacters(prevChars => ({
      ...prevChars,
      botCharacters: prevChars[`default${type}`] || [],
    }));
  };

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

export const useGameState = () => {
  const context = useContext(GameStateContext);
  if (context === undefined) {
    throw new Error('useGameState must be used within a GameStateProvider');
  }
  return context;
};

export default GameStateContext;

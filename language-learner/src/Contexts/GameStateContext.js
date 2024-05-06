import React, { createContext, useState, useContext, useCallback } from 'react';
import { cloneCharacters, filterCharacters } from '../Misc/Utils'; 
import japanese_characters_standard from '../Data/japanese_characters_standard.json'; 

// Initial state definitions
const initialState = {
  characters: {
    topCharacters: [],
    botCharacters: []
  },
  options: {
    characters: {
      hiragana: { activeTop: false, activeBot: true },
      katakana: { activeTop: false, activeBot: false },
      romaji: { activeTop: true, activeBot: false },
      // dakuon: false,
    },
    topRowLevels: 10,
    botRowShuffleLevel: 0,
    sorting: {
      current: 0,
      methods: ['sound', 'h-shape', 'k-shape', 'missed']
    },
    sound: false
  },
  game: {
    gameover: false
  },
  stats: {
    recentTime: 0,
    bestTime: 0,
  },
  start: false
};

const GameStateContext = createContext();

export const GameStateProvider = ({ children }) => {
  const [characters, setCharacters] = useState(initialState.characters);
  const [options, setOptions] = useState(initialState.options);
  const [game, setGame] = useState(initialState.game);
  const [stats, setStats] = useState(initialState.stats);
  const [start, setStart] = useState(initialState.start);

  const reset = useCallback(() => {
    setStart(false);
    setGame(prevGame => ({
        ...prevGame,
        gameover: false
    }));
    setCharacters({
        topCharacters: cloneCharacters(filterCharacters(japanese_characters_standard, filterByOptions)),
        botCharacters: cloneCharacters(filterCharacters(japanese_characters_standard, filterByOptions))
    });
  }, []); 

  const filterByOptions = (character) => {
    const isDakuonEnabled = options.characters.dakuon;
    const characterIsDakuon = character.dakuon;
    return isDakuonEnabled || !characterIsDakuon;
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
    start,
    setStart,
    reset,
    filterByOptions
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
